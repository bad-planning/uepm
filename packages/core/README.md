# @uepm/core

Core utilities for UEPM (Unreal Engine Package Manager) - shared code for UProject and package.json management.

## Installation

```bash
npm install @uepm/core
```

## Usage

This package provides core functionality used by other UEPM packages:

- UProject file reading, writing, and manipulation
- Package.json management for Unreal Engine projects
- Error handling and validation utilities
- TypeScript interfaces for Unreal Engine project structures

## API

### UProject Management

```typescript
import { findProjectFile, readProject, writeProject, addPluginDirectory } from '@uepm/core';

// Find .uproject file in directory
const uprojectPath = await findProjectFile('./my-project');

// Read and parse .uproject
const project = await readProject(uprojectPath);

// Add plugin directory
const modifiedProject = addPluginDirectory(project, 'node_modules');

// Write back to file
await writeProject(uprojectPath, modifiedProject);
```

### Package.json Management

```typescript
import * as packageJsonManager from '@uepm/core';

// Check if package.json exists
const exists = await packageJsonManager.exists('./my-project');

// Create new package.json
await packageJsonManager.create('./my-project', 'my-project-name');

// Read existing package.json
const packageJson = await packageJsonManager.read('./my-project');

// Add postinstall script
const modified = packageJsonManager.addPostinstallScript(packageJson);

// Write package.json
await packageJsonManager.write('./my-project', modified);
```

## License

MIT