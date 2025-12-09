# @uepm/validate

Validation hook for checking Unreal Engine plugin compatibility with your project's engine version.

## Usage

This package is typically installed automatically by `@uepm/init` and runs as a postinstall hook.

Manual installation:

```bash
npm install --save-dev @uepm/validate
```

Add to your package.json:

```json
{
  "scripts": {
    "postinstall": "uepm-validate"
  }
}
```

## What it does

On every `npm install`, this hook:
1. Reads your .uproject file to get the engine version
2. Scans installed plugins in node_modules
3. Checks each plugin's engine version compatibility
4. Warns about any incompatible plugins

## Requirements

- Node.js >= 18.0.0
- Unreal Engine project with .uproject file
- Plugins with `unreal.engineVersion` field in package.json

## License

MIT
