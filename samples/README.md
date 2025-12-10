# UEPM Samples

This directory contains sample Unreal Engine projects and plugins that demonstrate how to use UEPM (Unreal Engine Package Manager) for managing plugins via NPM.

## Directory Structure

```
samples/
├── plugins/                    # Sample plugins demonstrating NPM distribution
│   ├── example-plugin/         # Basic plugin example
│   └── dependency-plugin/      # Plugin with dependencies example
└── project/                    # Sample Unreal Engine project
    ├── SampleProject.uproject  # Unreal project file
    ├── package.json           # NPM dependencies and scripts
    ├── Config/                # Unreal Engine configuration
    └── README.md              # Detailed setup instructions
```

## Sample Plugins

### example-plugin

A basic Unreal Engine plugin that demonstrates:
- Proper NPM package structure for Unreal plugins
- Engine version compatibility specification using semver
- Basic plugin module implementation with logging
- Required plugin files (.uplugin, source code, resources)

**Location**: `samples/plugins/example-plugin/`

### dependency-plugin

A plugin that demonstrates plugin-to-plugin dependencies:
- Plugin dependencies declared in .uplugin file
- NPM dependencies declared in package.json
- Cross-plugin functionality usage in source code
- Automatic dependency resolution via NPM

**Location**: `samples/plugins/dependency-plugin/`

## Sample Project

A complete Unreal Engine 5.3 project configured to use UEPM:
- Minimal but functional .uproject file
- Package.json configured for plugin management
- Engine configuration files
- Comprehensive documentation and setup instructions

**Location**: `samples/project/`

## Getting Started

### 1. Explore the Sample Project

The sample project is the best place to start understanding UEPM:

```bash
cd samples/project
cat README.md  # Read the comprehensive setup guide
```

### 2. Study the Plugin Examples

Examine the plugin structure to understand how to create UEPM-compatible plugins:

```bash
# Basic plugin example
ls -la samples/plugins/example-plugin/
cat samples/plugins/example-plugin/package.json

# Plugin with dependencies
ls -la samples/plugins/dependency-plugin/
cat samples/plugins/dependency-plugin/package.json
```

### 3. Test the Integration

Run the tests to verify everything works correctly:

```bash
# Test all samples
npm test

# Test specific components
cd samples/project && npm test
cd samples/plugins/example-plugin && npm test
cd samples/plugins/dependency-plugin && npm test
```

## Development Workflow

### Creating New Plugins

To create your own UEPM-compatible plugin:

1. **Study the examples**: Start with `samples/plugins/example-plugin/`
2. **Follow the structure**: Include .uplugin, package.json, source code, and documentation
3. **Specify engine compatibility**: Use semver ranges in package.json
4. **Test with the sample project**: Verify your plugin works with `samples/project/`

### Testing Changes

The samples include comprehensive tests that verify:
- Plugin structure and metadata
- Package.json configuration
- Source code organization
- Documentation completeness
- Unreal Engine project setup

Run tests frequently during development to catch issues early.

### Publishing Plugins

Once your plugin is ready:

1. **Test thoroughly** with the sample project
2. **Follow NPM best practices** for package publishing
3. **Include comprehensive documentation**
4. **Use semantic versioning** for releases
5. **Specify engine compatibility** clearly

## Integration with Main Packages

These samples work with the main UEPM packages:

- **@uepm/init**: Initializes Unreal projects for NPM plugin support
- **@uepm/validate**: Validates plugin compatibility during installation
- **@uepm/core**: Provides shared utilities for project and plugin management

The samples demonstrate the complete workflow from initialization to plugin usage.

## Contributing

When contributing to the samples:

1. **Maintain compatibility** with the documented UEPM workflow
2. **Update tests** when making structural changes
3. **Keep documentation current** with any changes
4. **Test across platforms** (Windows, macOS, Linux)
5. **Verify with multiple Unreal Engine versions** when possible

## Troubleshooting

### Common Issues

1. **Tests failing after moving files**: Update relative paths in test files
2. **NPM workspace issues**: Ensure root package.json includes all sample directories
3. **Plugin not loading**: Verify .uplugin file structure and engine compatibility
4. **Build errors**: Check that all required source files are included

### Getting Help

- Check the main project README for general UEPM documentation
- Review the sample project README for detailed setup instructions
- Examine the plugin examples for structure reference
- Run tests to identify specific issues

## License

These samples are provided under the MIT License, same as the main UEPM project. Individual plugins may specify their own licenses in their respective package.json files.