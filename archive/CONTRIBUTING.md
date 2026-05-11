# Contributing to UEPM

Thank you for your interest in contributing to UEPM (Unreal Engine Package Manager)! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Creating Example Plugins](#creating-example-plugins)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- NPM >= 7.0.0 (for workspaces support)
- Git
- Unreal Engine 5.0+ (for testing)

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/uepm.git
   cd uepm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build all packages**:
   ```bash
   npm run build
   ```

4. **Run tests to verify setup**:
   ```bash
   npm test
   ```

## Project Structure

UEPM is organized as a monorepo with multiple packages:

```
uepm/
├── packages/                     # Core NPM packages
│   ├── core/                     # Shared utilities
│   ├── init/                     # One-time initialization tool
│   └── postinstall/              # Postinstall hooks
├── samples/                      # Example projects and plugins
│   ├── plugins/                  # Sample plugins
│   │   ├── example-plugin/       # Basic plugin example
│   │   └── dependency-plugin/    # Plugin with dependencies
│   ├── project/                  # Sample Unreal Engine project
│   └── tests/                    # Integration tests for samples
├── scripts/                      # Build and deployment scripts
├── .kiro/                        # Kiro AI specifications
└── docs/                         # Additional documentation
```

### Package Dependencies

```
@uepm/init ──────┐
                 ├─── @uepm/core
@uepm/postinstall ┘

@uepm/example-plugin (independent)
@uepm/dependency-plugin ──── @uepm/example-plugin
```

## Development Workflow

### Working on Core Packages

Each package can be developed independently:

```bash
# Work on the core utilities
cd packages/core
npm run build
npm test

# Work on the init command
cd packages/init
npm run build
npm test

# Work on postinstall hooks
cd packages/postinstall
npm run build
npm test
```

### Building and Testing

```bash
# Build all packages
npm run build

# Test all packages
npm test

# Clean all build artifacts
npm run clean
```

### Working with Samples

The samples directory contains working examples:

```bash
# Test the sample project
cd samples/project
npm install
# Open SampleProject.uproject in Unreal Engine

# Test sample plugins
cd samples/plugins/example-plugin
npm test

# Run integration tests
cd samples/tests
npm test
```

## Testing

UEPM uses a comprehensive testing strategy:

### Unit Tests

Each package has unit tests using Vitest:

```bash
# Run unit tests for a specific package
cd packages/core
npm test

# Run tests in watch mode
npm run test:watch
```

### Property-Based Tests

Critical functionality is tested with property-based tests using fast-check:

```bash
# Property tests are included in regular test runs
npm test

# Example property test
test('UProject modification preserves existing data', () => {
  fc.assert(
    fc.property(uprojectArbitrary(), (uproject) => {
      const result = addPluginDirectory(uproject, 'node_modules');
      // Verify all original fields are preserved
      expect(result.EngineAssociation).toBe(uproject.EngineAssociation);
    })
  );
});
```

### Integration Tests

Integration tests verify the complete workflow:

```bash
# Run integration tests
cd samples/tests
npm test
```

### Testing Guidelines

1. **Write tests first** - Use TDD when possible
2. **Test behavior, not implementation** - Focus on what the code should do
3. **Use property-based tests** for critical logic that should work with any input
4. **Include edge cases** - Test boundary conditions and error cases
5. **Keep tests fast** - Unit tests should run quickly

### Test Coverage

Aim for high test coverage on core functionality:

- **Unit tests**: >80% coverage on core logic
- **Property tests**: All critical correctness properties
- **Integration tests**: All major user workflows
- **Edge cases**: All error conditions

## Code Style

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Strict mode** - Enable strict TypeScript checking
- **Explicit types** - Prefer explicit types over `any`
- **JSDoc comments** - Document public APIs

```typescript
/**
 * Adds a plugin directory to the UProject configuration
 * @param project - The UProject object to modify
 * @param directory - Directory path to add
 * @returns Modified UProject object (does not mutate original)
 */
export function addPluginDirectory(
  project: UProjectFile, 
  directory: string
): UProjectFile {
  // Implementation
}
```

### Error Handling

- **Use UEPMError** for expected errors with proper exit codes
- **Provide helpful messages** - Include suggestions when possible
- **Fail fast** - Don't continue with invalid state

```typescript
if (!fs.existsSync(projectPath)) {
  throw new UEPMError(
    'No .uproject file found',
    'UPROJECT_NOT_FOUND',
    3,
    `Searched in: ${directory}`,
    'Make sure you\'re in an Unreal Engine project directory'
  );
}
```

### Async/Await

- **Use async/await** instead of callbacks or raw promises
- **Handle errors properly** with try/catch blocks
- **Use fs.promises** for file operations

### File Organization

- **One class per file** when possible
- **Group related functions** in modules
- **Export from index.ts** for clean imports
- **Separate types** into dedicated files when complex

## Submitting Changes

### Pull Request Process

1. **Create a feature branch** from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with appropriate tests

3. **Ensure all tests pass**:
   ```bash
   npm test
   ```

4. **Build all packages**:
   ```bash
   npm run build
   ```

5. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add plugin dependency validation"
   ```

6. **Push and create pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `chore:` - Build process or auxiliary tool changes

Examples:
```
feat: add engine version validation to postinstall hook
fix: preserve JSON formatting when modifying .uproject files
docs: add troubleshooting section to README
test: add property tests for package.json creation
```

### Pull Request Guidelines

- **Clear description** - Explain what the PR does and why
- **Link issues** - Reference any related issues
- **Small, focused changes** - Prefer multiple small PRs over large ones
- **Update documentation** - Include relevant documentation updates
- **Add tests** - Ensure new functionality is tested

## Creating Example Plugins

To contribute example plugins that demonstrate UEPM patterns:

### Plugin Structure

Follow the established structure:

```
your-plugin/
├── YourPlugin.uplugin           # Plugin descriptor
├── package.json                 # NPM package configuration
├── README.md                    # Plugin documentation
├── Source/                      # C++ source code
│   └── YourPlugin/
│       ├── Private/
│       ├── Public/
│       └── YourPlugin.Build.cs
├── Resources/                   # Plugin resources
│   └── Icon128.png
└── Content/                     # Blueprint assets (if any)
```

### Package.json Requirements

```json
{
  "name": "@uepm/your-plugin",
  "version": "1.0.0",
  "description": "Description of your plugin",
  "main": "YourPlugin.uplugin",
  "unreal": {
    "engineVersion": ">=5.0.0 <6.0.0",
    "pluginName": "YourPlugin"
  },
  "files": [
    "YourPlugin.uplugin",
    "Source/**/*",
    "Resources/**/*",
    "Content/**/*"
  ],
  "keywords": ["unreal", "unreal-engine", "plugin", "uepm"],
  "license": "MIT"
}
```

### Plugin Descriptor (.uplugin)

```json
{
  "FileVersion": 3,
  "Version": 1,
  "VersionName": "1.0.0",
  "FriendlyName": "Your Plugin",
  "Description": "Description of your plugin",
  "Category": "UEPM Examples",
  "CreatedBy": "Your Name",
  "CanContainContent": false,
  "IsBetaVersion": false,
  "IsExperimentalVersion": false,
  "Installed": false,
  "Modules": [
    {
      "Name": "YourPlugin",
      "Type": "Runtime",
      "LoadingPhase": "Default"
    }
  ]
}
```

### Testing Example Plugins

1. **Create comprehensive tests** for plugin structure
2. **Test with sample project** to ensure compatibility
3. **Document usage examples** in README
4. **Include source code comments** explaining key concepts

## Documentation

### Documentation Standards

- **Clear and concise** - Write for developers of all skill levels
- **Include examples** - Show practical usage
- **Keep up to date** - Update docs when changing functionality
- **Use proper formatting** - Follow Markdown best practices

### Types of Documentation

1. **README files** - Overview and quick start for each package
2. **API documentation** - Generated from JSDoc comments
3. **Guides and tutorials** - Step-by-step instructions
4. **Troubleshooting** - Common issues and solutions

### Documentation Locations

- **Package READMEs** - `packages/*/README.md`
- **Main README** - `README.md` (overview and quick start)
- **Contributing guide** - `CONTRIBUTING.md` (this file)
- **Sample documentation** - `samples/README.md` and `samples/project/README.md`

## Release Process

### Version Management

UEPM uses semantic versioning (semver):

- **Major** (1.0.0) - Breaking changes
- **Minor** (0.1.0) - New features, backward compatible
- **Patch** (0.0.1) - Bug fixes, backward compatible

### Release Steps

1. **Update versions** in affected packages:
   ```bash
   # Update package.json versions
   cd packages/core && npm version patch
   cd packages/init && npm version patch
   cd packages/postinstall && npm version patch
   ```

2. **Update dependencies** between packages if needed

3. **Build and test everything**:
   ```bash
   npm run build
   npm test
   ```

4. **Create release commit**:
   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   git tag v1.0.1
   ```

5. **Publish packages**:
   ```bash
   npm publish --workspaces
   ```

6. **Push changes**:
   ```bash
   git push origin main --tags
   ```

### Pre-release Testing

Before releasing:

1. **Test with sample project** - Ensure complete workflow works
2. **Test on multiple platforms** - Windows, macOS, Linux
3. **Test with different Node.js versions** - 18.x, 20.x, latest
4. **Verify NPM package contents** - Check published files

## Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Pull Request Reviews** - Code review and feedback

### Asking Questions

When asking for help:

1. **Search existing issues** first
2. **Provide context** - What are you trying to do?
3. **Include details** - OS, Node.js version, error messages
4. **Share code** - Minimal reproduction case when possible

### Reporting Bugs

When reporting bugs:

1. **Use issue templates** if available
2. **Describe expected vs actual behavior**
3. **Include reproduction steps**
4. **Share relevant logs and error messages**
5. **Specify environment details**

## Code of Conduct

### Our Standards

- **Be respectful** - Treat all contributors with respect
- **Be inclusive** - Welcome contributors of all backgrounds
- **Be constructive** - Provide helpful feedback
- **Be patient** - Help newcomers learn

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information

### Enforcement

Project maintainers are responsible for clarifying standards and will take appropriate action in response to unacceptable behavior.

## Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file (if we create one)
- **Release notes** for significant contributions
- **Package.json author/contributors** fields where appropriate

Thank you for contributing to UEPM! Your efforts help make Unreal Engine plugin development better for everyone.