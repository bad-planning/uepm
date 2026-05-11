# @uepm/init

One-time initialization tool for Unreal Engine projects to enable NPM plugin support.

## Installation

This package is designed to be run via `npx` without installation:

```bash
npx @uepm/init
```

## Usage

### Basic Usage

Navigate to your Unreal Engine project directory and run:

```bash
cd YourUnrealProject
npx @uepm/init
```

### Command Line Options

```bash
npx @uepm/init [options]
```

**Options:**
- `-f, --force` - Force reinitialization even if already initialized
- `-d, --project-dir <path>` - Project directory (defaults to current directory)
- `-h, --help` - Display help information
- `-V, --version` - Display version number

### Examples

```bash
# Initialize current directory
npx @uepm/init

# Force reinitialize a specific project
npx @uepm/init --force --project-dir ./MyProject

# Get help
npx @uepm/init --help
```

## What It Does

The init command performs the following actions:

1. **Locates your .uproject file** in the specified directory
2. **Modifies the .uproject file** to add `node_modules` to `AdditionalPluginDirectories`
3. **Creates or updates package.json** with UEPM configuration
4. **Installs postinstall hooks** for automatic plugin setup and validation
5. **Preserves existing configuration** - only adds what's necessary

### .uproject Modifications

Before:
```json
{
  "FileVersion": 3,
  "EngineAssociation": "5.3",
  "Category": "",
  "Description": ""
}
```

After:
```json
{
  "FileVersion": 3,
  "EngineAssociation": "5.3",
  "Category": "",
  "Description": "",
  "AdditionalPluginDirectories": [
    "node_modules"
  ]
}
```

### package.json Creation/Updates

If no `package.json` exists, creates:
```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "private": true,
  "description": "Unreal Engine project with NPM plugin support",
  "scripts": {
    "postinstall": "patch-package && uepm-postinstall"
  },
  "devDependencies": {
    "@uepm/postinstall": "^1.0.0",
    "patch-package": "^8.0.0"
  }
}
```

If `package.json` exists, adds/updates:
- `postinstall` script
- `@uepm/postinstall` dev dependency
- `patch-package` dev dependency (if not present)

## Error Handling

The init command provides clear error messages for common issues:

### No .uproject File Found
```
Error: No .uproject file found in /path/to/directory
Make sure you're running this command in an Unreal Engine project directory.
```

### Multiple .uproject Files
```
Warning: Multiple .uproject files found. Using: ProjectName.uproject
```

### Permission Errors
```
Error: Permission denied writing to ProjectName.uproject
Check file permissions and try again.
```

### Invalid JSON
```
Error: Invalid JSON in ProjectName.uproject at line 5, column 12
Please fix the JSON syntax and try again.
```

## Exit Codes

- `0` - Success
- `1` - General error (file not found, permission denied, etc.)
- `2` - Invalid command line arguments
- `3` - File system error
- `4` - JSON parsing error

## Requirements

- Node.js >= 18.0.0
- Write access to the project directory
- Valid Unreal Engine project with .uproject file

## Programmatic Usage

You can also use this package programmatically:

```typescript
import { init, InitOptions } from '@uepm/init';

const options: InitOptions = {
  projectDir: '/path/to/project',
  force: false
};

try {
  const result = await init(options);
  console.log(result.message);
} catch (error) {
  console.error('Init failed:', error.message);
}
```

## Related Packages

- **[@uepm/postinstall](../postinstall)** - Postinstall hooks (automatically installed)
- **[@uepm/core](../core)** - Shared utilities (dependency)

## License

MIT