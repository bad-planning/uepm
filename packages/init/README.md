# @uepm/init

Initialize Unreal Engine projects for NPM plugin support.

## Installation

```bash
npm install -g @uepm/init
```

Or use directly with npx:

```bash
npx @uepm/init
```

## Usage

Navigate to your Unreal Engine project directory and run:

```bash
npx @uepm/init
```

This will:

1. **Modify your .uproject file** - Adds `node_modules` to `AdditionalPluginDirectories`
2. **Create/update package.json** - Sets up NPM configuration with postinstall validation
3. **Install validation hook** - Adds `@uepm/validate` to check plugin compatibility
4. **Set up local plugin symlinks** - Ensures plugins work in monorepo environments

## Options

- `--force, -f` - Force reinitialization even if already initialized
- `--project-dir <path>, -d <path>` - Specify project directory (defaults to current directory)
- `--help, -h` - Show help information
- `--version, -V` - Show version number

## Examples

```bash
# Initialize current directory
npx @uepm/init

# Initialize specific project
npx @uepm/init --project-dir ./MyUnrealProject

# Force reinitialization
npx @uepm/init --force
```

## What it does

After running the init command, your project will be ready to install Unreal Engine plugins via NPM:

```bash
# Install plugins
npm install @uepm/example-plugin @uepm/dependency-plugin

# Open your project in Unreal Engine
# Plugins will be automatically discovered
```

## Requirements

- Node.js 18.x or later
- Unreal Engine 5.0 or later
- An existing Unreal Engine project with a .uproject file

## License

MIT