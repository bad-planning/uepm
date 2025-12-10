# Implementation Plan

- [x] 1. Set up project structure and tooling
  - Create TypeScript project with proper configuration
  - Set up Vitest for testing with fast-check integration
  - Configure build process to compile TypeScript to JavaScript
  - Set up bin entries for CLI and validation hook
  - Configure package.json for NPM publishing
  - _Requirements: 6.1, 6.5_

- [x] 2. Implement core UProject file management
  - Create TypeScript interfaces for UProjectFile structure
  - Implement findProjectFile function to locate .uproject in directory
  - Implement readProject function to parse .uproject JSON
  - Implement writeProject function preserving formatting
  - Implement addPluginDirectory function to add to AdditionalPluginDirectories
  - Implement hasPluginDirectory function to check for existing entries
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2.1 Write property test for uproject modification
  - **Property 1: Init command adds node_modules while preserving existing data**
  - **Validates: Requirements 1.1, 1.2**

- [x] 2.2 Write property test for idempotence
  - **Property 2: Init command is idempotent**
  - **Validates: Requirements 1.4**

- [x] 3. Implement package.json management
  - Create TypeScript interfaces for PackageJson structure
  - Implement exists function to check for package.json
  - Implement create function to generate new package.json with UEPM config
  - Implement read function to parse existing package.json
  - Implement write function to save package.json
  - Implement function to add/update postinstall script
  - _Requirements: 1.5, 1.6, 9.2_

- [x] 3.1 Write property test for package.json creation
  - **Property 8: Init command creates package.json when missing**
  - **Validates: Requirements 1.5**

- [x] 3.2 Write property test for package.json updates
  - **Property 9: Init command updates existing package.json**
  - **Validates: Requirements 1.6**

- [x] 4. Implement init command
  - Create InitCommand class implementing CLICommand interface
  - Implement command execution logic to find .uproject file
  - Add logic to modify .uproject with node_modules directory
  - Add logic to create or update package.json
  - Add logic to install postinstall hook
  - Implement success and error messaging
  - Handle edge cases (no .uproject, multiple .uproject files, already initialized)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.1, 7.2, 7.3_

- [x] 4.1 Write unit tests for init command
  - Test successful initialization with existing package.json
  - Test successful initialization without package.json
  - Test error handling for missing .uproject
  - Test handling of already-initialized projects
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 5. Implement CLI framework and command registry
  - Create CommandRegistry class for managing commands
  - Implement command registration and lookup
  - Create main CLI entry point using Commander.js
  - Implement help command and usage information display
  - Implement error handling for invalid commands
  - Configure bin entry in package.json
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 5.1 Write unit tests for CLI framework
  - Test command registration
  - Test help output
  - Test invalid command handling
  - _Requirements: 6.2, 6.3_

- [x] 6. Implement validation hook core logic
  - Create validation hook entry point script
  - Implement getEngineVersion function to extract version from .uproject
  - Implement findInstalledPlugins function to discover plugins in node_modules
  - Implement validatePlugin function for semver compatibility checking
  - Implement warning message formatting for incompatible plugins
  - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [x] 6.1 Write property test for engine version parsing
  - **Property 3: Validation hook correctly parses engine versions**
  - **Validates: Requirements 9.3**

- [x] 6.2 Write property test for semver validation
  - **Property 4: Semver validation correctly identifies compatibility**
  - **Validates: Requirements 9.4**

- [x] 6.3 Write unit tests for validation hook
  - Test with compatible plugin example
  - Test with incompatible plugin example
  - Test warning message format
  - _Requirements: 9.5_

- [x] 7. Implement error handling and validation
  - Create ErrorMessage interface and formatting utilities
  - Implement JSON parsing error handling with descriptive messages
  - Implement file system error handling (permissions, not found)
  - Implement uproject schema validation
  - Ensure all errors produce non-zero exit codes
  - Handle multiple .uproject files with deterministic selection
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7.1 Write property test for error exit codes
  - **Property 5: Error conditions produce non-zero exit codes**
  - **Validates: Requirements 7.4**

- [x] 7.2 Write property test for uproject validation
  - **Property 6: UProject validation accepts valid schemas**
  - **Validates: Requirements 7.5**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create example plugin package
  - Create directory structure for @uepm/example-plugin
  - Create ExamplePlugin.uplugin descriptor with metadata
  - Create package.json with unreal.engineVersion field
  - Implement basic plugin source code (simple module with logging)
  - Add Source/ExamplePlugin/Public and Private directories
  - Create minimal plugin module class
  - Add Resources directory with icon
  - Add README.md with NPM distribution documentation
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 2.3_

- [x] 9.1 Write unit tests for example plugin structure
  - Verify .uplugin file exists and is valid JSON
  - Verify package.json has required fields
  - Verify source files exist
  - Verify README documentation exists
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 10. Create dependency plugin package
  - Create directory structure for @uepm/dependency-plugin
  - Create DependencyPlugin.uplugin with Plugins dependency array
  - Create package.json declaring @uepm/example-plugin as dependency
  - Implement plugin source code that references ExamplePlugin
  - Add Source/DependencyPlugin/Public and Private directories
  - Create plugin module that uses ExamplePlugin functionality
  - Add README.md explaining dependency pattern
  - _Requirements: 4.1, 4.2, 4.5, 2.4_

- [x] 10.1 Write unit tests for dependency plugin structure
  - Verify .uplugin declares plugin dependencies
  - Verify package.json declares NPM dependencies
  - Verify source code references example plugin
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 11. Create sample Unreal project
  - Create minimal .uproject file with EngineAssociation
  - Create package.json with example plugin dependencies
  - Add Config directory with DefaultEngine.ini
  - Create README.md with setup and testing instructions
  - Document how to run init command
  - Document how to install plugins
  - Document how to use patch-package
  - _Requirements: 8.1, 8.4, 8.5, 5.3_

- [ ] 11.1 Write unit tests for sample project structure
  - Verify .uproject is valid
  - Verify package.json has correct dependencies
  - Verify README documentation exists
  - _Requirements: 8.1, 8.4, 8.5_

- [ ] 12. Implement property-based test generators
  - Create arbitrary for valid UProjectFile objects
  - Create arbitrary for engine version strings
  - Create arbitrary for semver range expressions
  - Create arbitrary for PackageJson objects
  - Configure fast-check with 100 iterations minimum
  - _Requirements: All property tests_

- [ ] 12.1 Write property test for postinstall hook installation
  - **Property 7: Init command installs postinstall hook**
  - **Validates: Requirements 9.2**

- [ ] 13. Add documentation and README
  - Create main README.md with quick start guide
  - Document all CLI commands and options
  - Add troubleshooting section for common issues
  - Document plugin package.json structure requirements
  - Add examples of semver ranges for engine compatibility
  - Document patch-package integration workflow
  - Add contributing guidelines
  - _Requirements: 5.3, 6.2_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
