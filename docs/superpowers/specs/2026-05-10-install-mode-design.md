# Install Mode Design

**Date:** 2026-05-10
**Status:** Approved

## Overview

UEPM currently creates symbolic links in `UEPMPlugins/` pointing into `node_modules/`. This works for git-based workflows but breaks on Windows (symlinks require elevated permissions or developer mode) and is incompatible with Perforce, the dominant VCS in game development (P4 reconcile walks into junctions; P4 studios expect all project files to be real, checkable-in files).

This feature adds a configurable `installMode` that controls how UEPM places plugin files into `UEPMPlugins/`. The mode is chosen once during `npx @uepm/init` and stored in `package.json`.

## Install Modes

| Mode | Behavior | Best for |
|---|---|---|
| `symlink` | Symbolic links in `UEPMPlugins/` pointing to `node_modules/` (junctions on Windows) | Git workflows |
| `copy` | Plugin files copied from `node_modules/` into `UEPMPlugins/` as real directories | Perforce / any VCS that vendors files |
| `none` | No `UEPMPlugins/` management; no postinstall hook installed | Teams with a custom plugin pipeline |

Default when `installMode` is absent from `package.json`: `symlink` (backward compatibility with existing projects).

## Configuration Schema

`InstallMode` is defined in `@uepm/core/src/types.ts`:

```typescript
export type InstallMode = 'symlink' | 'copy' | 'none';
```

`PackageJson` gains a typed `uepm` field:

```typescript
uepm?: {
  installMode?: InstallMode;
};
```

The value is written during `npx @uepm/init` (project context) and read at runtime by `uepm-postinstall`.

## VCS Detection

`detectInstallMode(directory: string): Promise<InstallMode>` in `@uepm/core` walks up the directory tree checking for VCS indicators and returns the recommended default:

**P4 indicators** → `'copy'`:
- `P4CONFIG` or `P4PORT` environment variables are set
- A `.p4config` file exists in `directory` or any ancestor directory

**Git indicator** → `'symlink'`:
- A `.git` directory exists in `directory` or any ancestor directory

**Neither** → `'symlink'`

P4 is checked before git. Studios using P4 sometimes also have git for tooling; the presence of P4 indicators means P4 is the primary VCS.

## Init Flow (Project Context)

Project init gains a single interactive `select` prompt using the `prompts` library (already a dependency of `@uepm/init`). The highlighted default is set by `detectInstallMode()`.

```
? Install mode ›
❯ symlink — symbolic links in UEPMPlugins/ (git workflow)
  copy   — real files in UEPMPlugins/ (Perforce / any VCS)
  none   — UEPM handles init only, no postinstall hook
```

**`--yes` flag**: skips the prompt, uses the detected default.

**Non-TTY without `--yes`**: throws `UEPMError('INTERACTIVE_REQUIRED', ...)` with a suggestion to use `--yes`, same as plugin init.

**Based on selected mode:**
- `symlink` / `copy`: writes `uepm.installMode` to `package.json`, adds `postinstall: "uepm-postinstall"` script, adds `@uepm/postinstall` to `devDependencies`
- `none`: writes `uepm.installMode: "none"` to `package.json`, does **not** add postinstall script or devDependency

`InitOptions` gains `installMode?: InstallMode`.

The prompt logic lives in a new `packages/init/src/project-prompts.ts` (parallel to the existing `plugin-prompts.ts`).

## Strategy Pattern (Postinstall)

### File Structure

```
packages/postinstall/src/
  install-strategy.ts              — InstallStrategy interface
  strategies/
    symlink-strategy.ts            — SymlinkInstallStrategy
    copy-strategy.ts               — CopyInstallStrategy
```

### Interface

```typescript
export interface InstallStrategy {
  install(
    pluginName: string,
    sourcePath: string,
    uepmPluginsDir: string
  ): Promise<void>;

  cleanup(
    installedPluginNames: string[],
    uepmPluginsDir: string
  ): Promise<void>;
}
```

`cleanup` runs once per postinstall invocation after all `install` calls. It removes entries in `UEPMPlugins/` that are no longer in `installedPluginNames`. Both strategies implement it — `SymlinkInstallStrategy` removes stale symlinks, `CopyInstallStrategy` removes stale directories.

### SymlinkInstallStrategy

Extracts the current symlink logic from `setup.ts`. Adds Windows junction support:

```typescript
const isWindows = process.platform === 'win32';
// Junctions require absolute targets; Unix symlinks use relative paths
const target = isWindows ? sourcePath : relativeSourcePath;
const type = isWindows ? 'junction' : 'dir';
await fs.symlink(target, uepmLinkPath, type);
```

### CopyInstallStrategy

Uses `fs.cp(sourcePath, targetPath, { recursive: true })` to copy plugin files. Before copying, removes any existing directory at `targetPath` (handles updates cleanly). Cleanup compares `UEPMPlugins/` entries against `installedPluginNames` and removes any that are not in the list.

### `setup.ts` orchestration

```typescript
// Read mode from package.json (default: 'symlink')
const mode = packageJson.uepm?.installMode ?? 'symlink';

if (mode === 'none') return; // nothing to do

if (!['symlink', 'copy'].includes(mode)) {
  throw new UEPMError('INVALID_CONFIG', `Unknown installMode: "${mode}". Expected symlink, copy, or none.`);
}

const strategy = mode === 'copy' ? new CopyInstallStrategy() : new SymlinkInstallStrategy();

// ... per-plugin loop calling strategy.install() ...

await strategy.cleanup(linkedPluginNames, uepmPluginsDir);
```

## Error Handling

- **Unknown `installMode`**: `UEPMError` with the invalid value and a list of valid options
- **Copy failures**: collected and thrown as a batch after the loop (same pattern as current symlink batch errors)
- **Cleanup**: only removes entries confirmed to be stale (in `UEPMPlugins/` but not in current installed plugin list) — never blindly deletes
- **Windows junction failure**: the original `EPERM`/`EACCES` error surfaces directly rather than a misleading `EEXIST`

## Testing

**`detectInstallMode`** (new test file in `@uepm/core`):
- P4 env var set → returns `'copy'`
- `.p4config` file in ancestor directory → returns `'copy'`
- `.git` directory present → returns `'symlink'`
- Neither → returns `'symlink'`
- P4 indicators present alongside `.git` → returns `'copy'` (P4 takes precedence)

**`SymlinkInstallStrategy`**:
- Existing `setup.test.ts` tests migrate here
- Windows junction path tested with `process.platform` mocked to `'win32'`

**`CopyInstallStrategy`**:
- Real temp dirs throughout (no mocking)
- `install`: files are actually present in `UEPMPlugins/` after call
- `install` on existing directory: files updated to new version
- `cleanup`: stale directory removed; directory for currently-installed plugin preserved

**Project init prompt** (new tests in `packages/init`):
- `--yes` uses VCS-detected default without prompting
- Non-TTY without `--yes` → error with `--yes` suggestion
- `symlink` mode → postinstall script and devDep added, `uepm.installMode` written
- `copy` mode → same as symlink
- `none` mode → no postinstall script, no devDep, `uepm.installMode: "none"` written
- Re-init with `--force` re-prompts for mode (same as first run — `--force` doesn't preserve existing values)

## Backward Compatibility

Existing projects without `uepm.installMode` in `package.json` continue to work as before — the postinstall hook defaults to `symlink` behavior. No migration required.
