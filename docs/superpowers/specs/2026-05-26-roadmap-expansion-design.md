# UEPM Roadmap Expansion Design

**Date:** 2026-05-26  
**Status:** Approved  
**Context:** Post-v2.0.0 Rust rewrite. Core consumer and author workflows are complete. This doc defines Phases 3–7.

## Strategic Direction

UEPM's primary bottleneck is studio buy-in. Studios need two things simultaneously: a trustworthy tool that fits their existing workflows, and an ecosystem of plugins worth managing. These aren't sequential concerns — they feed each other. The phase structure below delivers something for every audience at each milestone rather than solving one problem at a time.

Monetization: fully open-source forever.  
Binary distribution: source and binary packages are both first-class, author's choice.  
Website: already exists on gh-pages; Phase 3 extends it with a live plugin directory.

---

## Phase 3 — Ecosystem & DX Polish

**Goal:** Make UEPM feel complete to anyone who discovers it. Finishes the surface area v2.0 left thin.

### Discovery & Distribution

**`uepm search <term>`**  
Queries the npm registry for packages tagged with `uepm`. Prints name, version, description, and engine compatibility against the current project's engine version (read from `Config/UEPM.ini` if present). Reuses the existing `RegistryClient`. Supports `--json` output (see Phase 4).

**`uepm new <name>`**  
Scaffolds a new plugin directory: minimal `.uplugin`, `Source/<Name>/` skeleton with `<Name>.Build.cs` and `<Name>Module.cpp`, and `Config/UEPM.ini` with `[Plugin]` pre-filled. Runs plugin-context `uepm init` automatically after scaffolding. `--template <name>` flag reserved for future template library.

**Package manager distribution**  
Automate Homebrew tap (`homebrew-uepm`), Chocolatey package, and Scoop manifest off the existing GitHub Release CI. Each release triggers a PR to the respective manifest repos via GitHub Actions.

**Website plugin directory**  
Add a live-search index page to the existing gh-pages site. Backed by the npm registry search API (`/-/v1/search?text=keywords:uepm`). Filterable by engine version. Each result links to the package's npm page. No backend required — pure client-side fetch.

### Developer Experience

**`--json` output flag**  
All commands gain a `--json` flag emitting structured JSON instead of colored human-readable output. Enables scripting, Editor plugin integration (Phase 4), and CI tooling (Phase 5). Introduced in Phase 3 so every subsequent phase can rely on it.

**Shell completions: `uepm completions <shell>`**  
Emits completion scripts for bash, zsh, fish, and PowerShell. Implemented via `clap_complete` — minimal new code. Users pipe the output into their shell config.

**`uepm outdated`**  
Reads `uepm.lock` and re-queries the registry for the latest version satisfying each declared range. Prints a table: package | current | wanted | latest. Exits non-zero if any package is behind (useful in CI). Supports `--json`.

**`uepm info <pkg>`**  
Fetches and pretty-prints a package's registry metadata: description, author, license, all published versions with engine ranges, download counts if available. Supports `--json`.

**`uepm doctor`**  
Validates local setup end-to-end:
- `Config/UEPM.ini` is parseable
- `uepm.lock` is consistent with installed files in `UEPMPlugins/`
- `.uproject` references `UEPMPlugins/` in `AdditionalPluginDirectories`
- Installed plugin engine ranges are compatible with the project's engine version
- Registry is reachable

Exits non-zero with specific, actionable error messages for each failure. Supports `--json`.

---

## Phase 4 — Native Unreal Editor Integration

**Goal:** Remove the terminal requirement for day-to-day plugin management. The Editor plugin dogfoods UEPM — it's installed via `uepm install @uepm/editor-integration`.

`--json` is available on all commands by the end of Phase 3. The Editor plugin uses it exclusively for subprocess communication. Example shapes:
```
uepm list --json
→ [{"name":"@acme/foo","version":"1.2.3","engine_range":">=5.3,<6","compatible":true,"update_available":"1.3.0"}, ...]

uepm search combat --json
→ [{"name":"@acme/combat","version":"2.0.0","description":"...","compatible":true}, ...]

uepm outdated --json
→ [{"name":"@acme/foo","current":"1.2.3","wanted":"1.2.5","latest":"2.0.0"}, ...]
```

### Editor Plugin (C++)

- Distributed as a UEPM plugin: `uepm install @uepm/editor-integration`
- Adds a dockable **UEPM** panel to the Unreal Editor
- Shells out to the `uepm` binary for all operations — no logic duplication. Binary located via `PATH` with a configurable override in Editor preferences.
- All subprocess calls use `--json` for structured output

**Installed view**  
Lists all installed plugins with version, engine compatibility badge (green/red), and update-available indicator. Right-click context menu: Uninstall, Update, Open in Registry.

**Search view**  
Search field calls `uepm search <term> --json` debounced on keystroke. Shows name, description, latest version, engine compatibility against current project engine version. One-click Install with version picker.

**Updates view**  
Runs `uepm outdated --json` on open. Table of current vs. available versions. Bulk "Update All" button.

**Log view**  
Streams subprocess stdout/stderr from running operations in real time. Persists last N operations per session.

**Editor preferences page**  
- Override `uepm` binary path
- Registry URL override
- Token input (masked, stored as `UEPM_TOKEN` in environment or OS keychain)

---

## Phase 5 — CI/CD & Private Registries

**Goal:** The studio engineering lead unlock. UEPM fits existing pipeline and registry workflows.

### CI/CD Integration

**`uepm ci`**  
Non-interactive pipeline mode. Equivalent to `uepm install --frozen` — fails if `uepm.lock` is out of sync with `Config/UEPM.ini` (drift detection). No color codes, no spinners, no interactive prompts. Clean exit codes: 0 = success, 1 = drift detected, 2 = install failed, 3 = config invalid. Pairs with `--json` for machine-readable output.

**GitHub Actions: `uepm/setup-uepm`**  
Published to the Actions Marketplace. Installs the `uepm` binary (version-pinnable), configures `UEPM_TOKEN` from secrets, and caches the binary across runs. Studios add one step:
```yaml
- uses: uepm/setup-uepm@v1
  with:
    token: ${{ secrets.UEPM_TOKEN }}
- run: uepm ci
```

**TeamCity + Jenkins**  
Documented integration patterns — not plugins, just docs. Shell step templates, env var conventions (`UEPM_TOKEN`, `UEPM_REGISTRY`), exit code handling, and caching strategies for each platform.

### Private Registry & Credential Management

**Per-scope registry routing**  
New `[Registries]` section in `Config/UEPM.ini`:
```toml
[Registries]
"@studio" = "https://registry.internal.studio.com"
"@acme"   = "https://npm.pkg.github.com"
# default registry remains UEPM_REGISTRY env var or npmjs.com
```
Routes requests for scoped packages to the declared registry. Unscoped and other-scoped packages fall through to the default. Mirrors npm's `.npmrc` scoped registry pattern.

**`uepm login [--registry <url>]` / `uepm logout`**  
Interactive credential management. Prompts for token, stores in OS keychain (Keychain Access on macOS, Windows Credential Manager, libsecret on Linux) via the `keyring` crate. Falls back to `~/.uepm/credentials` if no keychain is available.

Token precedence (highest to lowest):
1. `UEPM_TOKEN` env var (CI pipelines)
2. OS keychain
3. `~/.uepm/credentials` file

---

## Phase 6 — Binary Distribution

**Goal:** Unlock the commercial plugin ecosystem. Source-only distribution works for small plugins; studios and IP-sensitive authors need prebuilt binaries.

### Package Format

`[Plugin]` in `Config/UEPM.ini` gains a `Distribution` field:
```toml
[Plugin]
Distribution = "both"   # "source" | "binary" | "both"
```

Binary packages include prebuilt files organized by UE version and platform:
```
Binaries/Win64/UE5.4/
Binaries/Mac/UE5.3/
Binaries/Linux/UE5.4/
```
The tarball structure and registry protocol are identical — different contents, same packaging.

### Publishing Binaries

`uepm publish --platform <platform> --engine <ue-version>` — builds and uploads a platform-specific binary package. Multiple publish calls per version are supported (one for source, one per platform/engine pair). Registry stores them as tagged variants under the same package version.

### Installing with Binary Preference

`uepm install` detects the project's engine version (from `Config/UEPM.ini`) and host platform, prefers a matching binary package if available, falls back to source automatically.

New `[Settings]` options:
```toml
[Settings]
PreferBinaries  = true   # prefer binary packages when available (default: true)
FallbackToSource = true  # fall back to source if no binary match (default: true)
```

`uepm list --json` reports `"distribution": "source" | "binary"` per installed plugin.

### `uepm pack`

Dry-run tarball builder. Validates glob patterns in `[Plugin]`, lists files that would be included, and optionally writes the `.tgz` to disk without uploading. Works for both source and binary packages. No registry credentials required.

```
uepm pack              # list files only
uepm pack --output .   # write .tgz to current directory
```

---

## Phase 7 — Advanced Dependency Resolution & Workspace Support

**Goal:** Long-tail reliability at scale. Complex plugin graphs and multi-project studio setups.

### Full Backtracking Semver Resolver

Replaces the current recursive "first match wins" resolver with a proper backtracking SAT-style solver (similar to Cargo's). Handles diamond dependencies and version conflicts across transitive graphs. When resolution is impossible, surfaces a clean conflict report naming the conflicting constraints and which packages introduced them.

The existing resolver's conflict detection remains as a fast path; backtracking only triggers when the fast path fails.

### Peer Dependencies

Plugins declare `[PeerDependencies]` — packages the host project must have installed, but that the plugin doesn't install itself:
```toml
[PeerDependencies]
"@studio/ui-framework" = "^3.0.0"
```
`uepm install` warns when peer deps are missing or version-mismatched. `uepm doctor` checks peer dep satisfaction.

### Workspace Support

A `uepm.workspace.ini` at the monorepo root declares member projects:
```toml
[Workspace]
Members = ["ShooterGame", "EditorTools", "SharedPlugins"]
```

`uepm install` run from the workspace root resolves a unified dependency graph across all members and hoists shared plugins to a top-level `UEPMPlugins/`.

Commands:
- `uepm workspace list` — combined plugin graph with per-project consumption
- `uepm install @acme/foo --project ShooterGame` — install into a specific member only
- `uepm ci` — extended to validate all workspace members in one pass

---

## Known Limitations (Carried Forward)

- Full semver backtracking resolver — addressed in Phase 7
- No peer dependency support — addressed in Phase 7
- No workspace/monorepo support — addressed in Phase 7
- Binary distribution not yet supported — addressed in Phase 6
