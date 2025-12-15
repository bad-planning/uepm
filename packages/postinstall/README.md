# @uepm/postinstall

Unified postinstall hooks for UEPM - handles both plugin setup and validation in a single package.

## Installation

This package is typically installed automatically when you run `npx @uepm/init`, but you can install it manually:

```bash
npm install --save-dev @uepm/postinstall
```

## Usage

The postinstall hook runs automatically during `npm install` via the postinstall script. You can also run it manually:

```bash
npx uepm-postinstall
```

## What it does

The postinstall process performs two main tasks:

### 1. Plugin Setup (`setupPlugins`)

- **Creates UEPMPlugins directory** - Dedicated folder for Unreal Engine plugin discovery
- **Symlinks UEPM plugins** - Creates clean symlinks from `node_modules/@uepm/*` to `UEPMPlugins/`
- **Handles local development** - Supports both NPM packages and local `file:` dependencies
- **Smart filtering** - Only processes actual plugins (excludes core packages like `@uepm/init`)

### 2. Plugin Validation (`validatePlugins`)

- **Engine compatibility checking** - Validates plugins against your Unreal Engine version
- **Semver range support** - Uses semantic versioning for compatibility checks
- **Clear reporting** - Shows compatible and incompatible plugins with reasons
- **Non-blocking warnings** - Warns about issues but doesn't fail the installation

## Integration

Add to your package.json:

```json
{
  "scripts": {
    "postinstall": "uepm-postinstall"
  },
  "devDependencies": {
    "@uepm/postinstall": "^0.1.0"
  }
}
```

This replaces the previous approach of separate `uepm-setup && uepm-validate` commands.

## Example Output

```
🔧 Running UEPM postinstall...
📦 Setting up plugin symlinks...
✓ Linked @uepm/example-plugin -> UEPMPlugins/example-plugin
✓ Linked @uepm/dependency-plugin -> UEPMPlugins/dependency-plugin
✓ Successfully linked 2 UEPM plugin(s) to UEPMPlugins directory
🔍 Validating plugin compatibility...
✅ 2 compatible plugin(s):
   ✓ @uepm/example-plugin@1.0.1 (requires >=5.0.0 <6.0.0)
   ✓ @uepm/dependency-plugin@1.0.1 (requires >=5.0.0 <6.0.0)
✅ UEPM postinstall complete!
```

## Directory Structure

After running, your project will have:

```
your-project/
├── YourProject.uproject          # Contains "UEPMPlugins" in AdditionalPluginDirectories
├── package.json                  # Contains "postinstall": "uepm-postinstall"
├── UEPMPlugins/                  # Clean plugin directory for Unreal Engine
│   ├── example-plugin/           # Symlink to node_modules/@uepm/example-plugin
│   └── dependency-plugin/        # Symlink to node_modules/@uepm/dependency-plugin
└── node_modules/@uepm/           # Actual NPM-installed plugins
    ├── example-plugin/           # Real plugin files
    └── dependency-plugin/        # Real plugin files
```

## API

### `runPostinstall(projectDir?: string)`

Main function that runs both setup and validation. Called by the CLI.

### `setupPlugins(projectDir: string)`

Sets up plugin symlinks in the UEPMPlugins directory.

### `validatePlugins(projectDir: string)`

Validates plugin compatibility and returns detailed results.

## Error Handling

- **Non-critical errors** are logged as warnings but don't fail the process
- **Critical errors** (like missing .uproject) will exit with code 1
- **Validation warnings** are displayed but don't prevent installation

## Requirements

- Node.js 18.x or later
- An Unreal Engine project initialized with `@uepm/init`
- Plugins must follow UEPM conventions (package.json with `unreal.engineVersion`)

## License

MIT