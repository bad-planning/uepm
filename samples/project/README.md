# Sample Unreal Engine Project with UEPM

This is a sample Unreal Engine project that demonstrates how to use UEPM (Unreal Engine Package Manager) to manage plugins distributed via NPM.

## Prerequisites

- Unreal Engine 5.7 or compatible version
- Node.js 18.x or later
- NPM (comes with Node.js)

## Quick Start

### 1. Initialize the Project for UEPM

If this project hasn't been initialized for UEPM yet, run:

```bash
npx @uepm/init
```

This command will:
- Add `node_modules` to the `AdditionalPluginDirectories` in `SampleProject.uproject`
- Create or update `package.json` with the postinstall validation hook
- Install the `@uepm/validate` package as a dev dependency

### 2. Install Plugin Dependencies

Install the example plugins from NPM:

```bash
npm install @uepm/example-plugin @uepm/dependency-plugin
```

This will:
- Download the plugins from the NPM registry
- Install them in your project's `node_modules/@uepm/` directory
- Run the postinstall hook to validate engine compatibility
- Apply any existing patches via `patch-package`

### 3. Open the Project in Unreal Engine

1. Double-click `SampleProject.uproject` to open it in Unreal Engine
2. If prompted about missing modules, click "Yes" to regenerate project files
3. The project should load with the NPM-distributed plugins automatically discovered

### 4. Verify Plugin Installation

To verify that the plugins are loaded correctly:

1. In Unreal Engine, go to **Edit > Plugins**
2. Look for "ExamplePlugin" and "DependencyPlugin" in the plugin list
3. Both should be enabled and show as "Installed"
4. Check the Output Log for plugin loading messages
5. When you play the game, you should see a green message on screen: "SampleProject loaded! Check Output Log for UEPM plugin messages."

### 5. Explore the Source Code

The sample project includes C++ source code that demonstrates plugin integration:

- **`Source/SampleProject/SampleProjectGameModeBase.cpp`**: Contains `TestPluginIntegration()` method that logs plugin status
- **`Source/SampleProject/`**: Complete Unreal Engine module structure with build files
- **Target files**: Proper game and editor target configurations

## Plugin Management

### Installing Additional Plugins

To install more UEPM-compatible plugins:

```bash
npm install @uepm/some-other-plugin
```

The postinstall hook will automatically validate compatibility with your engine version.

### Modifying Plugin Source Code

UEPM is compatible with `patch-package` for persisting modifications to plugin source code:

#### 1. Make Changes to Plugin Source

Navigate to the plugin in `node_modules` and modify the source files:

```bash
# Example: Edit the ExamplePlugin source
code node_modules/@uepm/example-plugin/Source/ExamplePlugin/Private/ExamplePlugin.cpp
```

#### 2. Create a Patch

After making your changes, create a patch file:

```bash
npx patch-package @uepm/example-plugin
```

This creates a patch file in the `patches/` directory that captures your modifications.

#### 3. Persist Changes

The patch will be automatically applied whenever you run `npm install` thanks to the postinstall script in `package.json`.

### Engine Version Compatibility

The validation hook checks plugin compatibility with your engine version:

- **Compatible plugins**: No warnings, plugins load normally
- **Incompatible plugins**: Warning messages displayed during `npm install`
- **Version ranges**: Plugins specify compatibility using semver ranges (e.g., `">=5.0.0 <6.0.0"`)

To check compatibility manually:

```bash
npx uepm-validate
```

## Project Structure

```
sample-project/
├── SampleProject.uproject     # Main project file (configured for UEPM)
├── package.json              # NPM dependencies and scripts
├── Source/                   # Unreal Engine C++ source code
│   ├── SampleProject.Target.cs
│   ├── SampleProjectEditor.Target.cs
│   └── SampleProject/
│       ├── SampleProject.Build.cs
│       ├── SampleProject.cpp
│       ├── SampleProject.h
│       ├── SampleProjectGameModeBase.h
│       └── SampleProjectGameModeBase.cpp
├── Config/
│   └── DefaultEngine.ini     # Engine configuration
├── ../../node_modules/       # NPM-installed plugins (workspace level)
│   └── @uepm/
│       ├── example-plugin/   # Basic example plugin
│       └── dependency-plugin/ # Plugin with dependencies
├── patches/                  # patch-package modifications (created as needed)
└── README.md                # This file
```

## Troubleshooting

### Plugin Not Loading

1. **Check the Output Log** in Unreal Engine for error messages
2. **Verify plugin structure** - ensure the plugin has a valid `.uplugin` file
3. **Check engine compatibility** - run `npx uepm-validate` to see compatibility warnings
4. **Regenerate project files** - close Unreal Engine and regenerate project files

### Compatibility Warnings

If you see warnings about plugin compatibility:

1. **Check the plugin's engine version requirements** in its `package.json`
2. **Update your engine version** if possible
3. **Contact the plugin author** for compatibility updates
4. **Use at your own risk** - the plugin may still work despite warnings

### Build Errors

If you encounter build errors after installing plugins:

1. **Clean and rebuild** the project
2. **Check for conflicting dependencies** between plugins
3. **Verify plugin source code** is compatible with your engine version
4. **Check patches** - ensure any applied patches are still valid

### NPM Installation Issues

If `npm install` fails:

1. **Clear NPM cache**: `npm cache clean --force`
2. **Delete node_modules**: `rm -rf node_modules package-lock.json`
3. **Reinstall**: `npm install`
4. **Check network connectivity** and NPM registry access

## Example Plugins

This project includes two example plugins to demonstrate the UEPM system:

### @uepm/example-plugin

A basic plugin that demonstrates:
- Proper NPM package structure for Unreal plugins
- Engine version compatibility specification
- Basic plugin module implementation

### @uepm/dependency-plugin

A plugin that demonstrates:
- Plugin-to-plugin dependencies via NPM
- How dependent plugins are automatically installed
- Cross-plugin functionality usage

## Development Workflow

### Adding New Plugins

1. **Find UEPM-compatible plugins** on NPM (search for `uepm` keyword)
2. **Install via NPM**: `npm install @uepm/plugin-name`
3. **Verify compatibility** - check for warnings during installation
4. **Test in Unreal Engine** - ensure the plugin loads and functions correctly

### Creating Your Own Plugins

To create your own UEPM-compatible plugin:

1. **Study the example plugins** in `node_modules/@uepm/`
2. **Follow the package.json structure** with `unreal.engineVersion` field
3. **Include all necessary Unreal plugin files** (`.uplugin`, source, resources)
4. **Test with this sample project** before publishing

### Version Management

- **Engine versions**: Specified in `SampleProject.uproject` (`EngineAssociation`)
- **Plugin versions**: Managed via NPM semver in `package.json`
- **Compatibility**: Validated automatically via the postinstall hook

## Contributing

This sample project is part of the UEPM ecosystem. To contribute:

1. **Report issues** with plugin compatibility or project setup
2. **Suggest improvements** to the documentation or project structure
3. **Create example plugins** that demonstrate additional patterns
4. **Share your experience** using UEPM in real projects

## License

This sample project is provided under the MIT License. Individual plugins may have their own licenses - check each plugin's documentation for details.