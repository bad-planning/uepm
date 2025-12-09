# Requirements Document

## Introduction

This document specifies the requirements for a command-line tool that enables Unreal Engine projects to use plugins distributed via NPM. The tool provides an `init` command that configures Unreal project files to recognize plugins installed in `node_modules`, and includes example plugins demonstrating the integration pattern. The system must be compatible with `patch-package` to support the common Unreal development practice of modifying plugin source code.

## Glossary

- **UEPM**: Unreal Engine Package Manager - the command-line tool that manages NPM-based plugins for Unreal Engine
- **NPX Command**: A command-line executable distributed via NPM that can be run without global installation
- **Unreal Project File (uproject)**: A JSON configuration file with `.uproject` extension that defines an Unreal Engine project
- **Additional Plugin Directories**: A configuration field in the uproject file that specifies custom locations where Unreal Engine should search for plugins
- **NPM Plugin**: An Unreal Engine plugin packaged and distributed through the Node Package Manager
- **Example Plugin**: A sample Unreal Engine plugin demonstrating the NPM distribution pattern
- **Dependency Plugin**: A plugin that is required by another plugin, demonstrating plugin-to-plugin dependencies
- **Sample Project**: A minimal Unreal Engine project used for testing and demonstrating the plugin system
- **patch-package**: An NPM tool that allows developers to make and persist modifications to packages in node_modules
- **Postinstall Hook**: An NPM script that executes automatically after package installation
- **Semver**: Semantic Versioning - a versioning scheme using MAJOR.MINOR.PATCH format with range syntax for compatibility specification
- **Engine Version**: The Unreal Engine version specified in the uproject file's EngineAssociation field

## Requirements

### Requirement 1

**User Story:** As an Unreal Engine developer, I want to initialize my project to use NPM-based plugins, so that I can leverage the NPM ecosystem for plugin management.

#### Acceptance Criteria

1. WHEN a developer executes the init command in a directory containing a uproject file, THEN UEPM SHALL add `node_modules` to the Additional Plugin Directories array in the uproject file
2. WHEN the init command modifies a uproject file, THEN UEPM SHALL preserve all existing configuration and formatting
3. WHEN the init command is executed in a directory without a uproject file, THEN UEPM SHALL display an error message indicating no project file was found
4. WHEN the init command is executed and `node_modules` already exists in Additional Plugin Directories, THEN UEPM SHALL skip the modification and inform the user
5. WHEN the init command is executed in a directory without a package.json file, THEN UEPM SHALL create a package.json with appropriate project metadata and postinstall hook
6. WHEN the init command is executed in a directory with an existing package.json file, THEN UEPM SHALL add or update the postinstall script to include the validation hook
7. WHEN the init command completes successfully, THEN UEPM SHALL display a confirmation message to the user

### Requirement 2

**User Story:** As an Unreal Engine developer, I want to install plugins via NPM, so that I can use standard package management workflows.

#### Acceptance Criteria

1. WHEN a developer installs an NPM Plugin via npm install, THEN the NPM Plugin SHALL be placed in the node_modules directory with proper Unreal plugin structure
2. WHEN Unreal Engine loads a project with configured Additional Plugin Directories, THEN the Unreal Engine SHALL discover and load plugins from node_modules
3. WHEN an NPM Plugin is installed, THEN the NPM Plugin SHALL contain all required Unreal plugin files including uplugin descriptor and source or binary files
4. WHEN an NPM Plugin declares dependencies on other plugins, THEN the package.json SHALL specify those dependencies using standard NPM dependency declarations
5. WHEN an NPM Plugin is removed via npm uninstall, THEN the Unreal Engine SHALL handle the missing plugin gracefully on next project load

### Requirement 3

**User Story:** As a plugin developer, I want to create an example plugin that demonstrates NPM distribution, so that other developers can follow the pattern.

#### Acceptance Criteria

1. WHEN the Example Plugin is examined, THEN the Example Plugin SHALL contain a valid uplugin descriptor file with metadata
2. WHEN the Example Plugin is examined, THEN the Example Plugin SHALL contain a package.json file with appropriate NPM metadata
3. WHEN the Example Plugin is installed via NPM, THEN the Example Plugin SHALL be loadable by Unreal Engine without additional configuration
4. WHEN the Example Plugin is examined, THEN the Example Plugin SHALL include source code demonstrating basic plugin functionality
5. WHEN the Example Plugin package.json is examined, THEN the Example Plugin SHALL include documentation explaining the NPM distribution pattern

### Requirement 4

**User Story:** As a plugin developer, I want to create a dependency plugin example, so that I can demonstrate how plugins can depend on other NPM-distributed plugins.

#### Acceptance Criteria

1. WHEN the Dependency Plugin is examined, THEN the Dependency Plugin SHALL contain a valid uplugin descriptor declaring dependencies on other plugins
2. WHEN the Dependency Plugin package.json is examined, THEN the Dependency Plugin SHALL declare the Example Plugin as an NPM dependency
3. WHEN the Dependency Plugin is installed via NPM, THEN NPM SHALL automatically install the Example Plugin as a transitive dependency
4. WHEN Unreal Engine loads a project with the Dependency Plugin, THEN the Unreal Engine SHALL successfully resolve and load both plugins
5. WHEN the Dependency Plugin is examined, THEN the Dependency Plugin SHALL include source code that utilizes functionality from the Example Plugin

### Requirement 5

**User Story:** As an Unreal Engine developer, I want to modify plugin source code and persist those changes, so that I can customize plugins for my project needs.

#### Acceptance Criteria

1. WHEN a developer modifies source files in an NPM Plugin within node_modules, THEN patch-package SHALL be able to create a patch file capturing those modifications
2. WHEN a developer runs npm install after patches exist, THEN patch-package SHALL automatically reapply the modifications to the NPM Plugin
3. WHEN UEPM documentation is examined, THEN UEPM SHALL include instructions for using patch-package with NPM Plugins
4. WHEN an NPM Plugin is structured, THEN the NPM Plugin SHALL not include any mechanisms that would prevent patch-package from functioning
5. WHEN patches are applied to plugin source code, THEN the Unreal Engine SHALL compile and load the modified plugin successfully

### Requirement 6

**User Story:** As a developer, I want the CLI tool to support multiple commands, so that additional functionality can be added in the future.

#### Acceptance Criteria

1. WHEN UEPM architecture is examined, THEN UEPM SHALL use a command-based structure allowing multiple subcommands
2. WHEN a developer runs UEPM without arguments, THEN UEPM SHALL display available commands and usage information
3. WHEN a developer runs UEPM with an invalid command, THEN UEPM SHALL display an error message and suggest valid commands
4. WHEN new commands are added to UEPM, THEN UEPM SHALL maintain backward compatibility with existing commands
5. WHEN UEPM is invoked via npx, THEN UEPM SHALL execute without requiring global installation

### Requirement 7

**User Story:** As an Unreal Engine developer, I want clear error messages and validation, so that I can quickly resolve configuration issues.

#### Acceptance Criteria

1. WHEN the init command encounters an invalid uproject file, THEN UEPM SHALL display a descriptive error message indicating the JSON parsing failure
2. WHEN the init command cannot write to the uproject file, THEN UEPM SHALL display an error message indicating permission or file system issues
3. WHEN multiple uproject files exist in the directory, THEN UEPM SHALL either prompt the user to select one or use a deterministic selection method
4. WHEN UEPM encounters an unexpected error, THEN UEPM SHALL display the error message and exit with a non-zero status code
5. WHEN the init command validates the uproject file structure, THEN UEPM SHALL verify the file contains valid Unreal project JSON schema

### Requirement 8

**User Story:** As a developer, I want a sample Unreal Engine project, so that I can test the plugin system and see a working example.

#### Acceptance Criteria

1. WHEN the Sample Project is examined, THEN the Sample Project SHALL contain a valid uproject file with minimal configuration
2. WHEN the Sample Project is opened in Unreal Engine, THEN the Sample Project SHALL load successfully without errors
3. WHEN the Sample Project has NPM plugins installed, THEN the Sample Project SHALL demonstrate the plugins functioning correctly
4. WHEN the Sample Project is examined, THEN the Sample Project SHALL include a package.json configured to use the Example Plugin and Dependency Plugin
5. WHEN the Sample Project is examined, THEN the Sample Project SHALL include documentation explaining how to set up and test the plugin system

### Requirement 9

**User Story:** As an Unreal Engine developer, I want plugins to validate engine version compatibility, so that I can avoid installing incompatible plugins.

#### Acceptance Criteria

1. WHEN an NPM Plugin package.json is examined, THEN the NPM Plugin SHALL declare engine version compatibility using semver range syntax
2. WHEN the init command is executed, THEN UEPM SHALL install an NPM postinstall hook that validates plugin compatibility
3. WHEN the postinstall hook executes, THEN the postinstall hook SHALL read the Unreal Engine version from the uproject file
4. WHEN the postinstall hook validates a plugin, THEN the postinstall hook SHALL compare the project engine version against the plugin semver range
5. WHEN a plugin is incompatible with the project engine version, THEN the postinstall hook SHALL display a warning message identifying the incompatible plugin and version requirements
