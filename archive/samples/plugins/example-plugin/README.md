# @uepm/example-plugin

Example Unreal Engine plugin distributed via NPM, demonstrating the UEPM (Unreal Engine Package Manager) workflow.

## Installation

```bash
npm install @uepm/example-plugin
```

## Prerequisites

Your Unreal Engine project must be initialized for UEPM:

```bash
npx @uepm/init
```

## What's Included

This plugin demonstrates:

- **Basic plugin structure** - Standard Unreal Engine plugin layout
- **NPM distribution** - Plugin distributed via NPM registry
- **Engine compatibility** - Semver-based engine version requirements
- **C++ module** - Simple module with logging functionality
- **Plugin descriptor** - Proper .uplugin file configuration

## Plugin Structure

```
@uepm/example-plugin/
├── ExamplePlugin.uplugin     # Plugin descriptor
├── package.json              # NPM package configuration
├── Source/                   # C++ source code
│   └── ExamplePlugin/
│       ├── Private/
│       │   ├── ExamplePlugin.cpp
│       │   └── ExamplePluginModule.cpp
│       ├── Public/
│       │   ├── ExamplePlugin.h
│       │   └── ExamplePluginModule.h
│       └── ExamplePlugin.Build.cs
├── Resources/                # Plugin resources
│   └── Icon128.png
└── README.md
```

## Engine Compatibility

- **Unreal Engine**: 5.0.0 or later (< 6.0.0)
- **Platforms**: All platforms supported by Unreal Engine

## Usage in Unreal Engine

1. Install the plugin via NPM
2. Open your project in Unreal Engine
3. Go to **Edit > Plugins**
4. Find "Example Plugin" in the list
5. Enable the plugin
6. Restart the editor when prompted

The plugin will log a message when loaded:

```
LogExamplePlugin: Example Plugin has been loaded!
```

## Development

This plugin serves as a template for creating your own NPM-distributed Unreal Engine plugins. Key features:

- **Proper package.json** with `unreal.engineVersion` field
- **Standard plugin structure** following Unreal Engine conventions
- **Build configuration** with proper module dependencies
- **NPM publishing** ready with correct file inclusions

## Creating Your Own Plugin

Use this plugin as a starting point:

1. Copy the plugin structure
2. Rename files and classes
3. Update package.json with your plugin details
4. Implement your plugin functionality
5. Publish to NPM

## License

MIT