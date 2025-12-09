# @uepm/init

Initialize Unreal Engine projects to use NPM-based plugins.

## Usage

Run once in your Unreal project directory:

```bash
npx @uepm/init
```

This will:
- Add `node_modules` to your .uproject's AdditionalPluginDirectories
- Create or update package.json with validation hooks
- Set up automatic engine compatibility checking

## What it does

1. Finds your .uproject file
2. Modifies it to include `node_modules` in plugin search paths
3. Creates/updates package.json with postinstall hook
4. Installs the validation hook

After running this once, you can install Unreal plugins via NPM:

```bash
npm install @uepm/example-plugin
```

## Requirements

- Node.js >= 18.0.0
- Unreal Engine project with .uproject file

## License

MIT
