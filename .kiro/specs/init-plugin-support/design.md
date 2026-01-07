# Design Document

## Overview

This design document outlines the enhancement of the UEPM init command to support both Unreal Engine projects and plugins. The current implementation only handles project initialization, but plugin developers need similar functionality to set up their plugins for NPM distribution. The enhanced init command will automatically detect the context (project vs plugin) and perform appropriate initialization steps.

## Architecture

The enhanced init command will follow a context-detection pattern where the system first determines what type of Unreal Engine asset it's working with, then delegates to the appropriate initialization strategy. This maintains backward compatibility while adding new functionality.

### High-Level Flow
1. **Context Detection**: Scan directory for `.uproject` and `.uplugin` files
2. **Strategy Selection**: Choose project or plugin initialization based on detected files
3. **Initialization Execution**: Run the appropriate initialization logic
4. **Result Reporting**: Provide context-specific feedback to the user

## Components and Interfaces

### Context Detection Module
```typescript
interface InitContext {
  type: 'project' | 'plugin';
  primaryFile: string;
  directory: string;
}

interface ContextDetector {
  detectContext(directory: string): Promise<InitContext>;
}
```

The context detector will scan for both `.uproject` and `.uplugin` files and determine the appropriate initialization strategy.

### Plugin Metadata Extractor
```typescript
interface PluginMetadata {
  name: string;
  version: string;
  friendlyName?: string;
  description?: string;
  author?: string;
  homepage?: string;
  engineVersion?: string;
}

interface PluginMetadataExtractor {
  extractMetadata(upluginPath: string): Promise<PluginMetadata>;
}
```

This component will parse `.uplugin` files and extract relevant metadata for package.json generation.

### Initialization Strategies
```typescript
interface InitializationStrategy {
  initialize(context: InitContext, options: InitOptions): Promise<InitResult>;
}

class ProjectInitializationStrategy implements InitializationStrategy {
  // Current project initialization logic
}

class PluginInitializationStrategy implements InitializationStrategy {
  // New plugin initialization logic
}
```

### Package.json Generators
```typescript
interface PackageJsonGenerator {
  generatePackageJson(metadata: any, options: InitOptions): PackageJson;
}

class ProjectPackageJsonGenerator implements PackageJsonGenerator {
  // Generate project-specific package.json
}

class PluginPackageJsonGenerator implements PackageJsonGenerator {
  // Generate plugin-specific package.json
}
```

## Data Models

### Enhanced InitOptions
```typescript
interface InitOptions {
  projectDir?: string;
  force?: boolean;
  pluginName?: string; // For explicit plugin name override
  engineVersion?: string; // For explicit engine version specification
}
```

### Enhanced InitResult
```typescript
interface InitResult {
  success: boolean;
  message: string;
  alreadyInitialized?: boolean;
  context: 'project' | 'plugin';
  filesCreated: string[];
  filesModified: string[];
}
```

### Plugin Package.json Template
```typescript
interface PluginPackageJson {
  name: string;
  version: string;
  description: string;
  main: string; // Points to .uplugin file
  scripts: {
    test: string;
    'test:watch': string;
  };
  unreal: {
    engineVersion: string;
    pluginName: string;
  };
  files: string[];
  keywords: string[];
  author?: string;
  license: string;
  engines: {
    node: string;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">init-plugin-support

Property 1: Plugin package.json creation
*For any* directory containing a valid uplugin file, when the init command is executed, a package.json file should be created with proper plugin distribution configuration
**Validates: Requirements 1.1**

Property 2: Plugin name extraction consistency
*For any* uplugin filename, the generated package.json should have a package name that correctly corresponds to the uplugin filename
**Validates: Requirements 1.2**

Property 3: Version information extraction
*For any* uplugin file containing version information, the generated package.json should extract and use that version correctly
**Validates: Requirements 1.3**

Property 4: Metadata extraction completeness
*For any* uplugin file with metadata fields, the generated package.json should extract and include all available relevant metadata
**Validates: Requirements 1.4**

Property 5: Plugin files array configuration
*For any* plugin initialization, the generated package.json should include a files array that covers all standard plugin directories
**Validates: Requirements 1.5, 3.5**

Property 6: Main field correctness
*For any* plugin initialization, the generated package.json main field should point to the correct uplugin file
**Validates: Requirements 1.6**

Property 7: Plugin keywords inclusion
*For any* plugin package.json generation, appropriate Unreal Engine plugin keywords should be included
**Validates: Requirements 1.7**

Property 8: Context detection accuracy
*For any* directory configuration, the init command should correctly identify whether it contains project files, plugin files, both, or neither
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

Property 9: Unreal section configuration
*For any* plugin initialization, the generated package.json should include a properly configured unreal section with engineVersion and pluginName
**Validates: Requirements 3.1, 3.2, 3.3**

Property 10: Plugin development setup
*For any* plugin initialization, the generated package.json should include test scripts and appropriate development dependencies
**Validates: Requirements 3.4, 7.1, 7.2**

Property 11: Existing configuration preservation
*For any* existing package.json in plugin context, the init command should preserve existing configuration while adding plugin-specific fields
**Validates: Requirements 4.1, 4.2**

Property 12: Force flag behavior
*For any* plugin context with existing configuration, the force flag should cause plugin-specific fields to be overwritten
**Validates: Requirements 4.3**

Property 13: Configuration validation
*For any* existing package.json in plugin context, the init command should validate that the main field points to the correct uplugin file
**Validates: Requirements 4.4**

Property 14: Conflict resolution
*For any* conflicting configuration in existing package.json, the init command should display warnings and preserve existing values unless force flag is used
**Validates: Requirements 4.5**

Property 15: Uplugin metadata round trip
*For any* valid uplugin file, metadata extraction should correctly parse and utilize all available fields (FriendlyName, Version, CreatedBy, DocsURL)
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

Property 16: Invalid JSON error handling
*For any* uplugin file with invalid JSON, the init command should display appropriate error messages with file location information
**Validates: Requirements 5.5**

Property 17: Context-appropriate feedback
*For any* successful initialization, the init command should provide feedback that correctly identifies the context (project vs plugin) and lists modified files
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

Property 18: Plugin development configuration
*For any* plugin initialization, appropriate development configurations should be set up including gitignore patterns and publish configuration
**Validates: Requirements 7.3, 7.5**

Property 19: Conditional build script inclusion
*For any* plugin with source code modules, build scripts should be included in the package.json
**Validates: Requirements 7.4**

Property 20: Backward compatibility preservation
*For any* project-only directory, the init command should produce identical results to the previous implementation
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

## Error Handling

The enhanced init command will implement comprehensive error handling for both project and plugin contexts:

### Context Detection Errors
- **No Unreal files found**: Clear error message indicating neither project nor plugin files were detected
- **Multiple plugin files**: Error message asking user to specify which plugin to initialize
- **Ambiguous context**: Warning when both project and plugin files are present

### Plugin-Specific Errors
- **Invalid uplugin JSON**: Detailed parsing error with file location
- **Missing required fields**: Error when uplugin file lacks essential metadata
- **File system permissions**: Clear error messages for read/write permission issues

### Backward Compatibility Errors
- **Legacy project handling**: Graceful handling of older project configurations
- **API compatibility**: Maintaining existing error types and codes for programmatic usage

## Testing Strategy

### Dual Testing Approach
The testing strategy will employ both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing Requirements:**
- Unit tests will verify specific examples and edge cases
- Integration tests will verify component interactions
- Regression tests will ensure backward compatibility
- Mock-based tests will verify error handling scenarios

**Property-Based Testing Requirements:**
- Property tests will use **Vitest** with **fast-check** library for TypeScript
- Each property-based test will run a minimum of 100 iterations
- Property tests will be tagged with comments referencing design document properties
- Tag format: `**Feature: init-plugin-support, Property {number}: {property_text}**`

**Test Coverage Areas:**
- Context detection with various directory configurations
- Metadata extraction from different uplugin file formats
- Package.json generation with various input combinations
- Error handling with invalid inputs
- Backward compatibility with existing project configurations
- File system operations and permissions

### Test Data Generation
Property-based tests will use smart generators that:
- Generate valid uplugin file structures with random metadata
- Create various directory configurations for context testing
- Generate edge cases for version parsing and metadata extraction
- Test boundary conditions for file system operations

The testing approach ensures that both concrete examples work correctly (unit tests) and that the general behavior holds across all valid inputs (property tests), providing confidence in the system's correctness and robustness.