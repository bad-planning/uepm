# @uepm/example-plugin

Example Unreal Engine plugin distributed via NPM, demonstrating the UEPM integration pattern.

## Overview

This plugin serves as a reference implementation for distributing Unreal Engine plugins through NPM. It demonstrates:

- Proper plugin structure for NPM distribution
- Engine version compatibility specification
- Basic plugin module implementation with logging
- Integration with the UEPM ecosystem

## Installation

### Prerequisites

1. Initialize your Unreal project for UEPM:
   ```bash
   npx @uepm/init
   ```

2. Install the plugin:
   ```bash
   npm install @uepm/example-plugin
   ```

### Usage

Once installed, the plugin will be automatically discovered by Unreal Engine when you open your project. The plugin provides:

- A basic module that logs startup and shutdown messages
- Example of proper plugin structure for NPM distribution
- Template for creating your own NPM-distributed plugins

## Plugin Structure

```
@uepm/example-plugin/
├── ExamplePlugin.uplugin          # Plugin descriptor
├── package.json                   # NPM package configuration
├── Source/
│   └── ExamplePlugin/
│       ├── ExamplePlugin.Build.cs # Build configuration
│       ├── Public/
│       │   └── ExamplePlugin.h    # Public header
│       └── Private/
│           └── ExamplePlugin.cpp  # Implementation
├── Resources/
│   └── Icon128.png               # Plugin icon
└── README.md                     # This file
```

## Engine Compatibility

This plugin is compatible with Unreal Engine versions `>=5.0.0 <6.0.0` as specified in the `package.json` file under the `unreal.engineVersion` field.

## Development

### Creating Your Own NPM Plugin

Use this plugin as a template for creating your own NPM-distributed Unreal Engine plugins:

1. Copy the structure of this plugin
2. Update the plugin name in all files
3. Modify the `package.json` metadata
4. Update the `.uplugin` descriptor
5. Implement your plugin functionality
6. Publish to NPM

### Engine Version Specification

Specify engine compatibility in your `package.json`:

```json
{
  "unreal": {
    "engineVersion": ">=5.0.0 <6.0.0",
    "pluginName": "YourPluginName"
  }
}
```

### Using patch-package

If you need to modify this plugin for your project:

1. Make changes to files in `node_modules/@uepm/example-plugin/`
2. Run `npx patch-package @uepm/example-plugin`
3. Commit the generated patch file
4. The patch will be automatically applied on future installs

## License

MIT
