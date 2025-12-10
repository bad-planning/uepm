# @uepm/dependency-plugin

Example Unreal Engine plugin demonstrating dependencies on other NPM-distributed plugins.

## Overview

This plugin demonstrates how to create Unreal Engine plugins that depend on other NPM-distributed plugins. It shows:

- Plugin-to-plugin dependencies using NPM's dependency system
- Declaring plugin dependencies in the `.uplugin` descriptor
- Using functionality from dependent plugins in source code
- Proper module loading order and dependency resolution

## Dependencies

This plugin depends on:
- `@uepm/example-plugin` - Demonstrates basic NPM plugin distribution

## Installation

### Prerequisites

1. Initialize your Unreal project for UEPM:
   ```bash
   npx @uepm/init
   ```

2. Install the plugin (this will automatically install dependencies):
   ```bash
   npm install @uepm/dependency-plugin
   ```

The NPM dependency system will automatically install `@uepm/example-plugin` as a transitive dependency.

### Usage

Once installed, both plugins will be automatically discovered by Unreal Engine when you open your project. The dependency plugin will:

- Load after the ExamplePlugin (due to plugin dependency declaration)
- Verify that ExamplePlugin is available
- Demonstrate using functionality from the dependent plugin
- Log messages showing the dependency relationship

## Plugin Structure

```
@uepm/dependency-plugin/
├── DependencyPlugin.uplugin        # Plugin descriptor with dependencies
├── package.json                    # NPM package with dependency declaration
├── Source/
│   └── DependencyPlugin/
│       ├── DependencyPlugin.Build.cs # Build configuration with module dependencies
│       ├── Public/
│       │   └── DependencyPlugin.h    # Public header
│       └── Private/
│           └── DependencyPlugin.cpp  # Implementation using ExamplePlugin
└── README.md                       # This file
```

## Dependency Declaration

### NPM Dependencies (package.json)

```json
{
  "dependencies": {
    "@uepm/example-plugin": "^1.0.0"
  }
}
```

This ensures that when you install `@uepm/dependency-plugin`, NPM automatically installs the required `@uepm/example-plugin`.

### Plugin Dependencies (.uplugin)

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

This tells Unreal Engine that this plugin requires ExamplePlugin to be loaded first.

### Module Dependencies (Build.cs)

```csharp
PublicDependencyModuleNames.AddRange(
    new string[]
    {
        "Core",
        "ExamplePlugin",  // Reference to the dependent module
    }
);
```

This allows the C++ code to include headers and use functionality from ExamplePlugin.

## Engine Compatibility

This plugin is compatible with Unreal Engine versions `>=5.0.0 <6.0.0` as specified in the `package.json` file under the `unreal.engineVersion` field.

## Development

### Creating Plugins with Dependencies

Use this plugin as a template for creating plugins that depend on other NPM-distributed plugins:

1. **NPM Dependencies**: Add the required plugins to your `package.json` dependencies
2. **Plugin Dependencies**: Declare plugin dependencies in your `.uplugin` file
3. **Module Dependencies**: Add the dependent modules to your `Build.cs` file
4. **Code Usage**: Include headers and use functionality from dependent plugins

### Dependency Best Practices

1. **Version Ranges**: Use semantic versioning ranges in package.json (e.g., `^1.0.0`)
2. **Plugin Names**: Ensure plugin names in `.uplugin` match the actual plugin names
3. **Module Names**: Reference the correct module names in `Build.cs` files
4. **Loading Order**: Let Unreal Engine handle loading order based on dependencies
5. **Error Handling**: Check if dependent modules are loaded before using them

### Testing Dependencies

To verify your plugin dependencies work correctly:

1. Install your plugin in a test project
2. Check that all dependencies are installed automatically
3. Verify that Unreal Engine loads plugins in the correct order
4. Test that your plugin can access functionality from dependencies
5. Check the log output for dependency resolution messages

## Troubleshooting

### Common Issues

1. **Plugin Not Found**: Ensure the dependent plugin name in `.uplugin` matches exactly
2. **Module Not Found**: Verify module names in `Build.cs` match the dependent plugin's modules
3. **Loading Order**: If you get loading errors, check that dependencies are properly declared
4. **Version Conflicts**: Use compatible version ranges in package.json

### Debug Information

This plugin logs several messages to help debug dependency issues:
- Module startup/shutdown messages
- Dependency availability checks
- Success/failure of using dependent functionality

## License

MIT