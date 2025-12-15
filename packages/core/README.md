# @uepm/core

Shared utilities for UProject and package.json management used by other UEPM packages.

## Installation

This package is typically installed as a dependency of other UEPM packages. You can also install it directly if you need the utilities:

```bash
npm install @uepm/core
```

## Usage

### UProject Management

```typescript
import { UProjectManager } from '@uepm/core';

const manager = new UProjectManager();

// Find .uproject file in directory
const projectPath = await manager.findProjectFile('/path/to/project');

// Read and parse .uproject file
const project = await manager.readProject(projectPath);

// Add plugin directory
const updated = manager.addPluginDirectory(project, 'node_modules');

// Write back to file (preserves formatting)
await manager.writeProject(projectPath, updated);

// Check if directory already exists
const hasNodeModules = manager.hasPluginDirectory(project, 'node_modules');
```

### Package.json Management

```typescript
import { PackageJsonManager } from '@uepm/core';

const manager = new PackageJsonManager();

// Check if package.json exists
const exists = await manager.exists('/path/to/project');

// Create new package.json with UEPM configuration
await manager.create('/path/to/project', 'MyProject');

// Read existing package.json
const packageJson = await manager.read('/path/to/project');

// Write package.json
await manager.write('/path/to/project', packageJson);
```

### Error Handling

```typescript
import { UEPMError, formatErrorMessage } from '@uepm/core';

try {
  // Some UEPM operation
} catch (error) {
  if (error instanceof UEPMError) {
    const formatted = formatErrorMessage(error.toErrorMessage());
    console.error(formatted);
    process.exit(error.exitCode);
  }
  throw error;
}
```

## API Reference

### UProjectManager

#### Methods

##### `findProjectFile(directory: string): Promise<string>`

Finds the first `.uproject` file in the specified directory.

**Parameters:**
- `directory` - Directory to search in

**Returns:** Path to the `.uproject` file

**Throws:** `UEPMError` if no `.uproject` file found

##### `readProject(filePath: string): Promise<UProjectFile>`

Reads and parses a `.uproject` file.

**Parameters:**
- `filePath` - Path to the `.uproject` file

**Returns:** Parsed UProject object

**Throws:** `UEPMError` if file cannot be read or parsed

##### `writeProject(filePath: string, project: UProjectFile): Promise<void>`

Writes a UProject object to file, preserving original formatting.

**Parameters:**
- `filePath` - Path to write to
- `project` - UProject object to write

**Throws:** `UEPMError` if file cannot be written

##### `addPluginDirectory(project: UProjectFile, directory: string): UProjectFile`

Adds a directory to the AdditionalPluginDirectories array.

**Parameters:**
- `project` - UProject object to modify
- `directory` - Directory to add

**Returns:** Modified UProject object (does not mutate original)

##### `hasPluginDirectory(project: UProjectFile, directory: string): boolean`

Checks if a directory exists in AdditionalPluginDirectories.

**Parameters:**
- `project` - UProject object to check
- `directory` - Directory to look for

**Returns:** True if directory exists

### PackageJsonManager

#### Methods

##### `exists(directory: string): Promise<boolean>`

Checks if package.json exists in the directory.

**Parameters:**
- `directory` - Directory to check

**Returns:** True if package.json exists

##### `create(directory: string, projectName: string): Promise<void>`

Creates a new package.json with UEPM configuration.

**Parameters:**
- `directory` - Directory to create package.json in
- `projectName` - Name for the project

**Throws:** `UEPMError` if file cannot be created

##### `read(directory: string): Promise<PackageJson>`

Reads and parses package.json from directory.

**Parameters:**
- `directory` - Directory containing package.json

**Returns:** Parsed PackageJson object

**Throws:** `UEPMError` if file cannot be read or parsed

##### `write(directory: string, packageJson: PackageJson): Promise<void>`

Writes PackageJson object to file.

**Parameters:**
- `directory` - Directory to write to
- `packageJson` - PackageJson object to write

**Throws:** `UEPMError` if file cannot be written

## Type Definitions

### UProjectFile

```typescript
interface UProjectFile {
  FileVersion?: number;
  EngineAssociation?: string;
  Category?: string;
  Description?: string;
  Modules?: Module[];
  Plugins?: PluginReference[];
  AdditionalPluginDirectories?: string[];
  TargetPlatforms?: string[];
  [key: string]: any; // Allow additional fields
}
```

### PackageJson

```typescript
interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  keywords?: string[];
  author?: string;
  license?: string;
  private?: boolean;
  [key: string]: any; // Allow additional fields
}
```

### UEPMError

```typescript
class UEPMError extends Error {
  code: string;
  exitCode: number;
  details?: string;
  suggestion?: string;
  
  constructor(
    message: string,
    code: string,
    exitCode: number = 1,
    details?: string,
    suggestion?: string
  );
  
  toErrorMessage(): ErrorMessage;
}
```

### ErrorMessage

```typescript
interface ErrorMessage {
  level: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  details?: string;
  suggestion?: string;
}
```

## Error Codes

The core package defines standard error codes used throughout UEPM:

| Code | Description | Exit Code |
|------|-------------|-----------|
| `UPROJECT_NOT_FOUND` | No .uproject file found | 3 |
| `UPROJECT_INVALID_JSON` | Invalid JSON in .uproject | 4 |
| `UPROJECT_READ_ERROR` | Cannot read .uproject file | 3 |
| `UPROJECT_WRITE_ERROR` | Cannot write .uproject file | 3 |
| `PACKAGE_JSON_INVALID` | Invalid package.json | 4 |
| `PACKAGE_JSON_READ_ERROR` | Cannot read package.json | 3 |
| `PACKAGE_JSON_WRITE_ERROR` | Cannot write package.json | 3 |
| `PERMISSION_DENIED` | File permission error | 4 |

## Validation

The core package includes validation utilities:

### UProject Validation

```typescript
import { validateUProject } from '@uepm/core';

const isValid = validateUProject(projectData);
```

Validates that a UProject object has:
- Valid JSON structure
- Recognized fields and types
- Proper array structures for Modules, Plugins, etc.

### Package.json Validation

```typescript
import { validatePackageJson } from '@uepm/core';

const isValid = validatePackageJson(packageData);
```

Validates that a package.json object has:
- Valid semver version strings
- Proper dependency structures
- Required fields for NPM packages

## Testing Utilities

The core package provides test generators for property-based testing:

```typescript
import { 
  uprojectArbitrary, 
  packageJsonArbitrary, 
  engineVersionArbitrary 
} from '@uepm/core/test-generators';

// Generate random valid UProject files
const uprojectGen = uprojectArbitrary();

// Generate random valid package.json files
const packageGen = packageJsonArbitrary();

// Generate random engine version strings
const versionGen = engineVersionArbitrary();
```

## Requirements

- Node.js >= 18.0.0
- File system access for reading/writing project files

## Related Packages

- **[@uepm/init](../init)** - Uses core utilities for initialization
- **[@uepm/postinstall](../postinstall)** - Uses core utilities for validation

## License

MIT