# Design Document

## Overview

UEPM (Unreal Engine Package Manager) is a modular Node.js-based toolset that bridges the NPM ecosystem with Unreal Engine's plugin system. The system modifies Unreal project files to recognize plugins installed in `node_modules`, validates engine compatibility using semantic versioning, and provides example plugins demonstrating the integration pattern.

The system consists of five main packages:
1. **@uepm/init** - One-time initialization tool, executable via npx without installation
2. **@uepm/validate** - Lightweight postinstall hook for engine compatibility checking
3. **@uepm/core** - Shared utilities for UProject and package.json management
4. **@uepm/example-plugin** - Example plugin demonstrating NPM distribution
5. **@uepm/dependency-plugin** - Example plugin demonstrating plugin dependencies

This modular approach ensures users only download what they need: the init tool runs once via npx, and the validation hook is a small dev dependency.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Developer                            │
└────────────┬────────────────────────────────────────────────┘
             │
             │ npx @uepm/init (one-time, no install)
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    @uepm/init Package                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Init       │  │   @uepm/     │  │    Hook      │     │
│  │   Command    │──│   core       │──│  Installer   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                           │                                  │
│                    (UProject Manager,                        │
│                     PackageJson Manager)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Modifies .uproject & package.json
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Unreal Project                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ProjectName.uproject                                 │  │
│  │  {                                                    │  │
│  │    "AdditionalPluginDirectories": ["node_modules"]   │  │
│  │  }                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  package.json                                         │  │
│  │  {                                                    │  │
│  │    "scripts": {                                       │  │
│  │      "postinstall": "uepm-validate"                   │  │
│  │    },                                                 │  │
│  │    "dependencies": {                                  │  │
│  │      "@uepm/example-plugin": "^1.0.0"                │  │
│  │    },                                                 │  │
│  │    "devDependencies": {                               │  │
│  │      "@uepm/validate": "^0.1.0"                       │  │
│  │    }                                                  │  │
│  │  }                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ npm install
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      node_modules/                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @uepm/example-plugin/                                │  │
│  │    ├── ExamplePlugin.uplugin                          │  │
│  │    ├── Source/                                        │  │
│  │    ├── Resources/                                     │  │
│  │    └── package.json                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @uepm/validate (postinstall hook)                    │  │
│  │    - Lightweight package installed as devDependency   │  │
│  │    - Reads .uproject engine version                   │  │
│  │    - Validates all plugin compatibility               │  │
│  │    - Warns on incompatibilities                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Language**: TypeScript (compiled to JavaScript for distribution)
- **Runtime**: Node.js (minimum version 18.x for modern features)
- **Monorepo**: NPM workspaces for managing multiple packages
- **File System**: Node.js fs/promises for async file operations
- **Validation**: Semver library for version range checking
- **Testing Framework**: Vitest for unit and property-based testing
- **Property Testing**: fast-check for property-based test generation

### Package Architecture

The system is organized as a monorepo with the following packages:

1. **@uepm/core** - Shared utilities
   - UProject file management
   - Package.json management
   - Type definitions
   - Used as a dependency by other packages

2. **@uepm/init** - Initialization tool
   - Depends on @uepm/core
   - Executable via npx (no installation required)
   - Modifies .uproject and package.json
   - Installs @uepm/validate as dev dependency

3. **@uepm/validate** - Validation hook
   - Depends on @uepm/core
   - Lightweight package for postinstall validation
   - Installed as devDependency in user projects
   - Runs automatically after npm install

4. **@uepm/example-plugin** - Example plugin
   - Demonstrates plugin structure
   - No dependencies on other UEPM packages

5. **@uepm/dependency-plugin** - Dependency example
   - Demonstrates plugin-to-plugin dependencies
   - Depends on @uepm/example-plugin

## Components and Interfaces

### Init Package Structure (@uepm/init)

```typescript
// Main entry point for init command
interface InitCommand {
  execute(options: InitOptions): Promise<void>;
}

interface InitOptions {
  projectDir?: string;  // Defaults to current directory
  force?: boolean;      // Force re-initialization
}

// Uses @uepm/core for file operations
import { UProjectManager, PackageJsonManager } from '@uepm/core';
```

### Core Package Structure (@uepm/core)

```typescript
// Exported from @uepm/core

interface UProjectFile {
  EngineAssociation: string;
  Category?: string;
  Description?: string;
  Modules?: Module[];
  Plugins?: PluginReference[];
  AdditionalPluginDirectories?: string[];
  TargetPlatforms?: string[];
}

interface UProjectManager {
  // Find .uproject file in directory
  findProjectFile(directory: string): Promise<string>;
  
  // Read and parse .uproject file
  readProject(filePath: string): Promise<UProjectFile>;
  
  // Write .uproject file preserving formatting
  writeProject(filePath: string, project: UProjectFile): Promise<void>;
  
  // Add node_modules to AdditionalPluginDirectories
  addPluginDirectory(project: UProjectFile, directory: string): UProjectFile;
  
  // Check if directory already exists
  hasPluginDirectory(project: UProjectFile, directory: string): boolean;
}

interface PackageJsonManager {
  // Check if package.json exists
  exists(directory: string): Promise<boolean>;
  
  // Create new package.json with UEPM configuration
  create(directory: string, projectName: string): Promise<void>;
  
  // Read existing package.json
  read(directory: string): Promise<PackageJson>;
  
  // Write package.json
  write(directory: string, packageJson: PackageJson): Promise<void>;
}
```

### Validate Package Structure (@uepm/validate)

```typescript
// Exported from @uepm/validate

interface ValidationHook {
  // Main validation entry point
  validate(projectDir: string): Promise<ValidationResult>;
  
  // Get engine version from .uproject
  getEngineVersion(projectFile: UProjectFile): string;
  
  // Find all installed plugins
  findInstalledPlugins(nodeModulesDir: string): Promise<PluginInfo[]>;
  
  // Validate single plugin compatibility
  validatePlugin(plugin: PluginInfo, engineVersion: string): CompatibilityResult;
}

interface ValidationResult {
  compatible: PluginInfo[];
  incompatible: PluginInfo[];
  warnings: string[];
}

interface PluginInfo {
  name: string;
  version: string;
  engineVersion?: string;  // Semver range from package.json
  path: string;
}

interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}
```

### Plugin Package Structure

```typescript
interface PluginPackageJson {
  name: string;
  version: string;
  description?: string;
  
  // Unreal-specific metadata
  unreal?: {
    engineVersion: string; // Semver range, e.g., ">=5.0.0 <6.0.0"
    pluginName: string;    // Name in .uplugin file
  };
  
  // Standard NPM fields
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface PluginDescriptor {
  FileVersion: number;
  Version: number;
  VersionName: string;
  FriendlyName: string;
  Description: string;
  Category: string;
  CreatedBy: string;
  CreatedByURL?: string;
  DocsURL?: string;
  MarketplaceURL?: string;
  SupportURL?: string;
  EngineVersion?: string;
  CanContainContent: boolean;
  IsBetaVersion: boolean;
  IsExperimentalVersion: boolean;
  Installed: boolean;
  Modules?: PluginModule[];
  Plugins?: PluginDependency[];
}
```

## Data Models

### File System Structure

```
project-root/
├── ProjectName.uproject          # Modified by init command
├── package.json                  # Modified by init command
├── node_modules/                 # NPM-managed plugins
│   ├── @uepm/
│   │   ├── example-plugin/
│   │   │   ├── ExamplePlugin.uplugin
│   │   │   ├── package.json
│   │   │   ├── Source/
│   │   │   │   └── ExamplePlugin/
│   │   │   │       ├── Private/
│   │   │   │       └── Public/
│   │   │   └── Resources/
│   │   └── dependency-plugin/
│   │       ├── DependencyPlugin.uplugin
│   │       ├── package.json
│   │       └── Source/
│   └── .bin/
│       └── uepm-validate         # Validation hook executable
├── patches/                      # patch-package patches
│   └── @uepm+example-plugin+1.0.0.patch
└── Content/
```

### Example Plugin package.json

```json
{
  "name": "@uepm/example-plugin",
  "version": "1.0.0",
  "description": "Example Unreal Engine plugin distributed via NPM",
  "main": "ExamplePlugin.uplugin",
  "unreal": {
    "engineVersion": ">=5.0.0 <6.0.0",
    "pluginName": "ExamplePlugin"
  },
  "files": [
    "ExamplePlugin.uplugin",
    "Source/**/*",
    "Resources/**/*",
    "Content/**/*"
  ],
  "keywords": ["unreal", "unreal-engine", "plugin", "uepm"],
  "license": "MIT"
}
```

### Dependency Plugin package.json

```json
{
  "name": "@uepm/dependency-plugin",
  "version": "1.0.0",
  "description": "Plugin demonstrating dependencies on other NPM plugins",
  "main": "DependencyPlugin.uplugin",
  "unreal": {
    "engineVersion": ">=5.0.0 <6.0.0",
    "pluginName": "DependencyPlugin"
  },
  "dependencies": {
    "@uepm/example-plugin": "^1.0.0"
  },
  "files": [
    "DependencyPlugin.uplugin",
    "Source/**/*"
  ],
  "keywords": ["unreal", "unreal-engine", "plugin", "uepm"],
  "license": "MIT"
}
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Init command adds node_modules while preserving existing data

*For any* valid uproject file with arbitrary existing configuration, running the init command should add "node_modules" to the AdditionalPluginDirectories array while preserving all other fields and their values unchanged.

**Validates: Requirements 1.1, 1.2**

### Property 2: Init command is idempotent

*For any* uproject file, running the init command multiple times should produce the same result as running it once - specifically, "node_modules" should appear exactly once in AdditionalPluginDirectories.

**Validates: Requirements 1.4**

### Property 3: Validation hook correctly parses engine versions

*For any* valid uproject file containing an EngineAssociation field, the validation hook should successfully extract and return the engine version string.

**Validates: Requirements 9.3**

### Property 4: Semver validation correctly identifies compatibility

*For any* engine version string and any semver range, the validation logic should correctly determine whether the version satisfies the range according to semver rules.

**Validates: Requirements 9.4**

### Property 5: Error conditions produce non-zero exit codes

*For any* error condition (invalid JSON, missing files, permission errors), UEPM should exit with a non-zero status code.

**Validates: Requirements 7.4**

### Property 6: UProject validation accepts valid schemas

*For any* JSON object that conforms to the Unreal project file schema (contains valid fields and types), the validation function should accept it as valid.

**Validates: Requirements 7.5**

### Property 7: Init command installs postinstall hook

*For any* project directory with a package.json, running init should add or update the postinstall script to include the validation hook command.

**Validates: Requirements 9.2**

### Property 8: Init command creates package.json when missing

*For any* project directory without a package.json, running init should create a valid package.json with appropriate project metadata and the postinstall hook configured.

**Validates: Requirements 1.5**

### Property 9: Init command updates existing package.json

*For any* project directory with an existing package.json, running init should add or update the postinstall script to include the validation hook while preserving all other fields.

**Validates: Requirements 1.6**

## Error Handling

### Error Categories

1. **File System Errors**
   - Missing .uproject file: Display clear error with suggestion to run in project root
   - Permission errors: Display error with file path and permission issue
   - Multiple .uproject files: Use deterministic selection (alphabetical) and inform user

2. **Validation Errors**
   - Invalid JSON in .uproject: Display parsing error with line/column information
   - Invalid uproject schema: Display which required fields are missing
   - Malformed package.json: Display parsing error

3. **Compatibility Errors**
   - Plugin incompatible with engine version: Display warning (non-fatal) with plugin name, required version, and actual version
   - Invalid semver range: Display error with plugin name and invalid range

4. **Runtime Errors**
   - Unexpected exceptions: Catch, log error message, and exit with code 1
   - Network errors (future): Handle gracefully with retry logic

### Error Message Format

```typescript
interface ErrorMessage {
  level: 'error' | 'warning' | 'info';
  code: string;  // e.g., 'UPROJECT_NOT_FOUND'
  message: string;
  details?: string;
  suggestion?: string;
}
```

### Exit Codes

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: File not found
- `4`: Permission denied
- `5`: Validation failed

## Testing Strategy

### Unit Testing

Unit tests will cover specific examples and integration points:

1. **UProject Manager**
   - Test parsing of example .uproject files
   - Test writing preserves formatting
   - Test finding .uproject in directory

2. **Command Execution**
   - Test init command with sample project
   - Test help command output
   - Test invalid command handling

3. **Validation Hook**
   - Test with example compatible plugins
   - Test with example incompatible plugins
   - Test warning message format

4. **Plugin Structure**
   - Verify example plugin has required files
   - Verify dependency plugin declares dependencies correctly
   - Verify package.json metadata is complete

### Property-Based Testing

Property-based tests will verify universal properties using fast-check library. Each test will run a minimum of 100 iterations with randomly generated inputs.

**Testing Framework**: Vitest with fast-check integration

**Property Test Structure**:
```typescript
import { test } from 'vitest';
import * as fc from 'fast-check';

test('Property 1: Init command adds node_modules while preserving existing data', () => {
  fc.assert(
    fc.property(
      uprojectArbitrary(), // Generator for valid uproject files
      async (uproject) => {
        const original = JSON.parse(JSON.stringify(uproject));
        const result = await initCommand(uproject);
        
        // node_modules should be added
        expect(result.AdditionalPluginDirectories).toContain('node_modules');
        
        // All other fields preserved
        for (const key of Object.keys(original)) {
          if (key !== 'AdditionalPluginDirectories') {
            expect(result[key]).toEqual(original[key]);
          }
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Generators (Arbitraries)**:

1. **UProject File Generator**: Creates valid uproject JSON with random fields
2. **Engine Version Generator**: Creates valid Unreal Engine version strings
3. **Semver Range Generator**: Creates valid semver range expressions
4. **Package.json Generator**: Creates valid package.json structures

### Integration Testing

Integration tests will verify the complete workflow:

1. **End-to-End Init Flow (Existing package.json)**
   - Create temporary project directory with package.json
   - Run init command
   - Verify .uproject modified correctly
   - Verify package.json has postinstall hook added
   - Clean up

2. **End-to-End Init Flow (No package.json)**
   - Create temporary project directory without package.json
   - Run init command
   - Verify .uproject modified correctly
   - Verify package.json created with correct structure
   - Verify postinstall hook configured
   - Clean up

3. **Plugin Installation Flow**
   - Initialize project
   - Install example plugin via npm
   - Run validation hook
   - Verify no compatibility warnings

4. **Patch Package Compatibility**
   - Install plugin
   - Modify plugin source
   - Create patch with patch-package
   - Reinstall and verify patch applied

### Test Coverage Goals

- Unit test coverage: >80% of core logic
- Property tests: All identified correctness properties
- Integration tests: All major user workflows
- Edge cases: All error conditions and boundary cases

## Implementation Notes

### Monorepo Package Structure

The UEPM system is organized as a monorepo with multiple packages:

```
uepm/                        # Monorepo root
├── package.json             # Root workspace configuration
├── packages/
│   ├── core/                # @uepm/core
│   │   ├── src/
│   │   │   ├── uproject-manager.ts
│   │   │   ├── package-json-manager.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── dist/            # Compiled output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── init/                # @uepm/init
│   │   ├── bin/
│   │   │   └── uepm-init.js
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── validate/            # @uepm/validate
│   │   ├── bin/
│   │   │   └── uepm-validate.js
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   ├── validator.ts
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── example-plugin/      # @uepm/example-plugin
│   │   ├── ExamplePlugin.uplugin
│   │   ├── Source/
│   │   ├── Resources/
│   │   └── package.json
│   │
│   └── dependency-plugin/   # @uepm/dependency-plugin
│       ├── DependencyPlugin.uplugin
│       ├── Source/
│       └── package.json
└── README.md
```

### Package Distribution

Each package is published independently to NPM:
- **@uepm/core**: Shared utilities (dependency of init and validate)
- **@uepm/init**: One-time initialization tool (used via npx)
- **@uepm/validate**: Validation hook (installed as devDependency)
- **@uepm/example-plugin**: Example plugin
- **@uepm/dependency-plugin**: Example plugin with dependencies

### Unreal Engine Version Detection

Engine version will be read from the `EngineAssociation` field in .uproject:
- Custom builds: `EngineAssociation: "5.3"` (version string)
- Launcher builds: `EngineAssociation: "{GUID}"` (requires registry lookup - future enhancement)
- For MVP, we'll support version strings and display a warning for GUID associations

### Semver Compatibility

Plugin compatibility will use standard semver ranges:
- `">=5.0.0 <6.0.0"`: Compatible with UE 5.x
- `"^5.3.0"`: Compatible with 5.3.x and 5.4+, but not 6.0
- `"~5.3.0"`: Compatible with 5.3.x only

### Formatting Preservation

When modifying .uproject files, we'll preserve formatting by:
1. Reading the original file as text
2. Parsing JSON with position tracking
3. Detecting indentation (spaces vs tabs, indent size)
4. Modifying the parsed object
5. Serializing with detected formatting
6. For MVP: Use 2-space indentation (Unreal default) and add note about formatting

### Package Extensibility

The modular package structure allows for easy extension:
- New tools can be added as separate packages (e.g., @uepm/list, @uepm/search)
- Each package can be versioned and published independently
- Shared code lives in @uepm/core to avoid duplication
- Users only install what they need

### Package.json Creation

When creating a new package.json, the init command will:
1. Derive project name from .uproject filename
2. Set version to "1.0.0"
3. Set private to true (Unreal projects typically aren't published)
4. Add postinstall script for validation
5. Install @uepm/validate as devDependency
6. Add patch-package to postinstall if not present
7. Include basic metadata (description, license)

Example generated package.json:
```json
{
  "name": "my-unreal-project",
  "version": "1.0.0",
  "private": true,
  "description": "Unreal Engine project with NPM plugin support",
  "scripts": {
    "postinstall": "patch-package && uepm-validate"
  },
  "devDependencies": {
    "@uepm/validate": "^0.1.0",
    "patch-package": "^8.0.0"
  }
}
```

### Validation Hook Behavior

The postinstall hook will:
1. Run automatically after `npm install`
2. Be non-blocking (warnings only, not errors)
3. Cache results to avoid repeated validation
4. Support `--skip-validation` flag for CI environments

### Cross-Platform Considerations

- Use `path.join()` for all path operations
- Use `fs.promises` for async file operations
- Test on Windows, macOS, and Linux
- Handle line endings (CRLF vs LF) in .uproject files

### Documentation Structure

Each component will include:
1. README.md with quick start guide
2. API documentation (generated from TypeScript)
3. Example usage in sample project
4. Troubleshooting guide for common issues

## Security Considerations

1. **File System Access**: Validate all file paths to prevent directory traversal
2. **JSON Parsing**: Use safe JSON parsing with error handling
3. **Command Injection**: Sanitize any user input used in shell commands
4. **Dependency Security**: Regular audits of dependencies with `npm audit`
5. **Package Integrity**: Publish with package-lock.json for reproducible builds

## Performance Considerations

1. **File Operations**: Use async operations to avoid blocking
2. **Validation Caching**: Cache validation results to avoid repeated checks
3. **Plugin Discovery**: Limit search depth in node_modules
4. **JSON Parsing**: Stream large files if needed (unlikely for .uproject files)

## Future Enhancements

See README.md for detailed future considerations. Key architectural decisions to support future work:

1. **Plugin Registry**: Command structure supports adding registry/search commands
2. **Version Resolution**: Validation logic can be extended for complex dependency graphs
3. **Build Artifacts**: Plugin structure supports both source and binary distributions
4. **Monorepo Support**: Path resolution can be made configurable
