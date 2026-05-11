# @uepm/dependency-plugin

Unreal Engine plugin demonstrating dependencies on other NPM-distributed plugins.

## Installation

```bash
npm install @uepm/dependency-plugin
```

This will automatically install the required dependency:
- `@uepm/example-plugin` - The plugin this one depends on

## Prerequisites

Your Unreal Engine project must be initialized for UEPM:

```bash
npx @uepm/init
```

## What's Included

This plugin demonstrates:

- **Plugin dependencies** - How to depend on other NPM plugins
- **Dependency resolution** - Automatic installation of required plugins
- **Cross-plugin communication** - Using functionality from other plugins
- **Proper dependency declaration** - Both in package.json and .uplugin

## Plugin Dependencies

### NPM Dependencies (package.json)
```json
{
  "dependencies": {
    "@uepm/example-plugin": "^1.0.0"
  }
}
```

### Unreal Engine Dependencies (.uplugin)
```json
{
  "Plugins": [
    {
      "Name": "ExamplePlugin",
      "Enabled": true
    }
  ]
}
```

## Plugin Structure

```
@uepm/dependency-plugin/
├── DependencyPlugin.uplugin  # Plugin descriptor with dependencies
├── package.json              # NPM package with dependencies
├── Source/                   # C++ source code
│   └── DependencyPlugin/
│       ├── Private/
│       │   ├── DependencyPlugin.cpp
│       │   └── DependencyPluginModule.cpp
│       ├── Public/
│       │   ├── DependencyPlugin.h
│       │   └── DependencyPluginModule.h
│       └── DependencyPlugin.Build.cs
└── README.md
```

## Engine Compatibility

- **Unreal Engine**: 5.0.0 or later (< 6.0.0)
- **Platforms**: All platforms supported by Unreal Engine
- **Dependencies**: Requires ExamplePlugin to be available

## Usage in Unreal Engine

1. Install the plugin via NPM (dependencies install automatically)
2. Open your project in Unreal Engine
3. Go to **Edit > Plugins**
4. Find "Dependency Plugin" in the list
5. Enable the plugin (ExamplePlugin will be enabled automatically)
6. Restart the editor when prompted

The plugin will log messages showing the dependency relationship:

```
LogExamplePlugin: Example Plugin has been loaded!
LogDependencyPlugin: Dependency Plugin has been loaded!
LogDependencyPlugin: Successfully found and using ExamplePlugin functionality
```

## Dependency Management

This plugin shows how UEPM handles plugin dependencies:

1. **NPM-level dependencies** - Ensures required plugins are downloaded
2. **Unreal Engine dependencies** - Declares plugin dependencies in .uplugin
3. **Build system integration** - Links against dependency modules
4. **Runtime dependency checking** - Verifies dependencies are available

## Creating Dependent Plugins

To create your own plugin with dependencies:

1. **Add NPM dependency** in package.json
2. **Declare Unreal dependency** in .uplugin file
3. **Add module dependency** in Build.cs file
4. **Include headers** from dependency plugin
5. **Test dependency resolution** during development

## Best Practices

- Always specify compatible version ranges for dependencies
- Test with and without dependencies to ensure proper error handling
- Document dependency requirements clearly
- Use semantic versioning for your plugin releases

## License

MIT