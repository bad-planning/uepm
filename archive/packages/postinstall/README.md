# @uepm/postinstall

Postinstall hooks for UEPM that handle plugin setup and engine compatibility validation.

## Installation

This package is automatically installed as a dev dependency when you run `npx @uepm/init`. You typically don't need to install it manually.

```bash
npm install --save-dev @uepm/postinstall
```

## Usage

### Automatic Execution

This package runs automatically after `npm install` via the postinstall script:

```json
{
  "scripts": {
    "postinstall": "patch-package && uepm-postinstall"
  }
}
```

### Manual Execution

You can also run the postinstall hook manually:

```bash
npx uepm-postinstall
```

Or from a specific directory:

```bash
npx uepm-postinstall /path/to/project
```

## What It Does

The postinstall hook performs two main functions:

### 1. Plugin Setup

Creates symlinks in the `UEPMPlugins` directory that point to plugins in `node_modules`:

```
YourProject/
├── UEPMPlugins/                  # Created by postinstall
│   ├── example-plugin/           # → ../node_modules/@uepm/example-plugin
│   └── dependency-plugin/        # → ../node_modules/@uepm/dependency-plugin
└── node_modules/@uepm/           # NPM-installed plugins
    ├── example-plugin/
    └── dependency-plugin/
```

This allows Unreal Engine to discover plugins while keeping them in the standard NPM location.

### 2. Engine Compatibility Validation

Checks each installed UEPM plugin against your project's engine version:

```bash
🔧 Running UEPM postinstall...
📦 Setting up plugin symlinks...
🔍 Validating plugin compatibility...
✅ 2 compatible plugin(s):
   ✓ @uepm/example-plugin@1.0.0 (requires >=5.0.0 <6.0.0)
   ✓ @uepm/dependency-plugin@1.0.0 (requires >=5.0.0 <6.0.0)
✅ UEPM postinstall complete!
```

### Warning for Incompatible Plugins

If plugins are incompatible with your engine version:

```bash
⚠️  1 potentially incompatible plugin(s):
   ⚠️ @uepm/old-plugin@1.0.0 requires >=4.27.0 <5.0.0, but project uses 5.3.0
```

## Engine Version Detection

The validation system reads your engine version from the `.uproject` file:

### Version String Format
```json
{
  "EngineAssociation": "5.3"
}
```

### GUID Format (Launcher Builds)
```json
{
  "EngineAssociation": "{12345678-1234-1234-1234-123456789012}"
}
```

**Note**: GUID format requires registry lookup and may show warnings. Version string format is recommended.

## Plugin Compatibility Specification

Plugins specify engine compatibility in their `package.json`:

```json
{
  "name": "@uepm/example-plugin",
  "unreal": {
    "engineVersion": ">=5.0.0 <6.0.0"
  }
}
```

### Supported Semver Ranges

| Range | Description | Compatible Versions |
|-------|-------------|-------------------|
| `">=5.0.0 <6.0.0"` | UE 5.x only | 5.0.0, 5.1.0, 5.3.2, etc. |
| `"^5.3.0"` | 5.3+ but not 6.0 | 5.3.0, 5.4.0, 5.9.9 |
| `"~5.3.0"` | 5.3.x only | 5.3.0, 5.3.1, 5.3.9 |
| `">=4.27.0"` | 4.27 and later | 4.27.0, 5.0.0, 5.3.0 |

## Error Handling

### Missing .uproject File
```bash
❌ UEPM postinstall failed: No .uproject file found
```

### Invalid Engine Version
```bash
❌ UEPM postinstall failed: Could not determine engine version from .uproject
```

### Permission Errors
```bash
❌ UEPM postinstall failed: Permission denied creating symlinks
```

## Programmatic Usage

You can use the postinstall functionality programmatically:

```typescript
import { runPostinstall, setupPlugins, validatePlugins } from '@uepm/postinstall';

// Run complete postinstall process
await runPostinstall('/path/to/project');

// Or run individual steps
await setupPlugins('/path/to/project');
const result = await validatePlugins('/path/to/project');

console.log(`Compatible: ${result.compatible.length}`);
console.log(`Incompatible: ${result.incompatible.length}`);
```

### Validation Result Structure

```typescript
interface ValidationResult {
  compatible: PluginInfo[];
  incompatible: PluginInfo[];
  warnings: string[];
}

interface PluginInfo {
  name: string;
  version: string;
  engineVersion?: string;  // Semver range from package.json
  path: string;
}
```

## Configuration

### Skipping Validation

Set environment variable to skip validation (useful for CI):

```bash
SKIP_UEPM_VALIDATION=true npm install
```

### Custom Plugin Directory

The postinstall hook looks for plugins in:
1. `node_modules/@uepm/`
2. `node_modules/` (any package with `unreal.engineVersion` in package.json)

## Troubleshooting

### Symlink Creation Fails

**Problem**: Permission errors creating symlinks on Windows.

**Solution**: Run terminal as administrator or enable Developer Mode in Windows Settings.

### Plugins Not Detected

**Problem**: Plugins installed but not found by validation.

**Solutions**:
1. Ensure plugin `package.json` has `unreal.engineVersion` field
2. Check plugin is in `node_modules/@uepm/` or has UEPM metadata
3. Verify `package.json` is valid JSON

### False Compatibility Warnings

**Problem**: Plugin works but shows compatibility warning.

**Solutions**:
1. Check if plugin author needs to update version ranges
2. Verify your `.uproject` has correct `EngineAssociation`
3. Contact plugin author about compatibility

## Related Packages

- **[@uepm/init](../init)** - Initialization tool that installs this package
- **[@uepm/core](../core)** - Shared utilities (dependency)

## License

MIT