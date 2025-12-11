# @uepm/validate

Validation hook for checking Unreal Engine plugin compatibility with your project's engine version.

## Installation

This package is typically installed automatically when you run `npx @uepm/init`, but you can install it manually:

```bash
npm install --save-dev @uepm/validate
```

## Usage

The validation hook runs automatically during `npm install` via the postinstall script. You can also run it manually:

```bash
npx uepm-validate
```

## What it does

1. **Reads your .uproject file** - Extracts the Unreal Engine version
2. **Scans node_modules** - Finds all installed UEPM plugins
3. **Checks compatibility** - Validates each plugin's `unreal.engineVersion` against your project
4. **Reports issues** - Warns about incompatible plugins with specific version requirements

## Example Output

```
✓ Validating plugins for Unreal Engine 5.7...
✓ @uepm/example-plugin@1.0.0 - Compatible (requires >=5.0.0 <6.0.0)
⚠ @uepm/old-plugin@0.5.0 - Incompatible (requires >=4.0.0 <5.0.0)
  Your engine: 5.7, Plugin requires: >=4.0.0 <5.0.0
  Consider updating the plugin or your engine version.
```

## Plugin Compatibility

Plugins specify their engine compatibility in package.json:

```json
{
  "name": "@uepm/my-plugin",
  "unreal": {
    "engineVersion": ">=5.0.0 <6.0.0"
  }
}
```

The validation uses semantic versioning (semver) to check compatibility.

## Integration

Add to your package.json postinstall script:

```json
{
  "scripts": {
    "postinstall": "uepm-validate"
  }
}
```

This ensures validation runs automatically after installing dependencies.

## Requirements

- Node.js 18.x or later
- An Unreal Engine project initialized with `@uepm/init`

## License

MIT