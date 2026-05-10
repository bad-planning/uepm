# Plugin Init Interactive Prompts

**Date:** 2026-05-10
**Status:** Approved

## Overview

When a plugin developer runs `npx @uepm/init` in a directory containing a `.uplugin` file, the command currently generates a `package.json` silently with derived defaults. The generated `name` field has no scope, and the user must manually edit the file before publishing.

This feature adds interactive prompts to plugin initialization — matching the `npm init` experience — so developers can confirm or adjust six key fields before the file is written. All defaults are derived from the `.uplugin` metadata so the user rarely needs to type anything.

Project initialization (`.uproject` context) is unaffected and stays non-interactive.

## Prompt Fields

Six fields are prompted, in this order:

| Field | Prompt text | Default source |
|---|---|---|
| Package name | `package name:` | `CreatedBy` → npm scope + filename kebab-case |
| Version | `version:` | uplugin `VersionName` → `Version.toString()` → `"1.0.0"` |
| Description | `description:` | uplugin `Description` → `FriendlyName` → `""` |
| Author | `author:` | uplugin `CreatedBy` → `""` |
| License | `license:` | `"MIT"` |
| Engine version | `engine version (semver range):` | `"^5.0.0"` |

### Scope derivation from `CreatedBy`

`CreatedBy` is lowercased, non-alphanumeric characters replaced with hyphens, consecutive hyphens collapsed, leading/trailing hyphens trimmed, and prefixed with `@`.

- `"UEPM"` → `@uepm`
- `"Epic Games"` → `@epic-games`
- `"John Doe"` → `@john-doe`
- `""` or absent → no scope (plain kebab name, e.g. `example-plugin`)

The full package name is `${scope}/${kebabPluginName}` when a scope is present, or just `${kebabPluginName}` otherwise.

### Engine version

Default is `^5.0.0`. Future work: auto-detect from a nearby `.uproject` or local UE install, since Epic does not guarantee minor-version compatibility.

## Non-TTY and `--yes` Behavior

A `-y` / `--yes` flag is added to `uepm-init`.

**With `--yes`:** Skip all prompts, use derived defaults, print a summary:
```
Wrote to /path/to/plugin/package.json:

{
  "name": "@uepm/example-plugin",
  ...
}
```

**Without TTY and without `--yes`:** Exit 1 with a clear error:
```
Error: uepm-init requires an interactive terminal for plugin initialization.
Run with --yes to accept derived defaults and skip prompts.
```

**`--yes` in project context:** Silently ignored. Project init is already non-interactive.

## Architecture

### Packages changed

| Package | Change |
|---|---|
| `@uepm/init` | Add `prompts` dep; new `plugin-prompts.ts`; update `cli.ts`, `index.ts` |
| `@uepm/core` | Extend `InitOptions`; update generator to prefer `options.*` over metadata |

### New file: `packages/init/src/plugin-prompts.ts`

Two exported functions:

```typescript
// Pure — derives defaults from metadata. Fully unit testable.
export function derivePluginDefaults(
  metadata: PluginMetadata,
  pluginName: string
): PluginPromptDefaults

// Wraps `prompts` library — only called when stdin is a TTY.
export async function promptPluginOptions(
  defaults: PluginPromptDefaults
): Promise<PluginPromptDefaults>
```

`PluginPromptDefaults` is the shared input/output shape:

```typescript
interface PluginPromptDefaults {
  packageName: string;
  version: string;
  description: string;
  author: string;
  license: string;
  engineVersion: string;
}
```

### `InitOptions` additions (`@uepm/core`)

Five new optional fields alongside the existing `engineVersion`:

```typescript
packageName?: string;
description?: string;
author?: string;
license?: string;
yes?: boolean;          // skip prompts, use derived defaults
```

### Generator changes (`plugin-package-json-generator.ts`)

Each field prefers the `options` value over the extracted metadata value:

```typescript
packageJson.name = options.packageName ?? derivedName;
packageJson.description = options.description ?? metadata.description ?? '';
packageJson.author = options.author ?? metadata.author ?? '';
packageJson.license = options.license ?? 'MIT';
engineVersion = options.engineVersion ?? metadata.engineVersion ?? '^5.0.0';
```

### Call site in `index.ts`

```typescript
// Plugin context
const metadata = await extractPluginMetadata(context.primaryFile);
const defaults = derivePluginDefaults(metadata, context.pluginName);

let resolved: PluginPromptDefaults;
if (options.yes) {
  resolved = defaults;
} else if (process.stdin.isTTY) {
  resolved = await promptPluginOptions(defaults);
} else {
  throw new UEPMError(
    'INTERACTIVE_REQUIRED',
    'uepm-init requires an interactive terminal for plugin initialization.',
    ExitCode.INVALID_ARGUMENTS,
    undefined,
    'Run with --yes to accept derived defaults and skip prompts.'
  );
}

const coreOptions: InitOptions = { ...options, ...resolved };
const result = await pluginStrategy.initialize(context, coreOptions);
```

## Testing

- `derivePluginDefaults()` — unit tests covering scope derivation, fallback chain for each field, empty `CreatedBy`
- `promptPluginOptions()` — not unit tested; it is a thin wrapper over the `prompts` library
- Integration: existing init tests pass `--yes` equivalent via direct `InitOptions` population; the new non-TTY error path gets a test in `index.ts`
- `InitOptions` additions are automatically covered by existing generator property tests once the fields are threaded through

## Dependency

`prompts` — ~7KB, zero transitive dependencies, handles Ctrl+C gracefully, clean API for pre-filled text inputs.
