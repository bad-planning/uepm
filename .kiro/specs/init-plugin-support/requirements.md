# Requirements Document

## Introduction

This document specifies the requirements for enhancing the UEPM init command to support both Unreal Engine projects and plugins. Currently, the init command only works with projects (`.uproject` files), but plugin developers also need a way to initialize their plugin directories for NPM distribution. The enhanced init command will detect whether it's running in a project or plugin directory and perform the appropriate initialization steps for each context.

## Glossary

- **UEPM**: Unreal Engine Package Manager - the command-line tool that manages NPM-based plugins for Unreal Engine
- **Init Command**: The UEPM command that initializes directories for NPM-based plugin support
- **Unreal Project File (uproject)**: A JSON configuration file with `.uproject` extension that defines an Unreal Engine project
- **Unreal Plugin File (uplugin)**: A JSON configuration file with `.uplugin` extension that defines an Unreal Engine plugin
- **Project Context**: When the init command is executed in a directory containing a `.uproject` file
- **Plugin Context**: When the init command is executed in a directory containing a `.uplugin` file
- **NPM Plugin**: An Unreal Engine plugin packaged and distributed through the Node Package Manager
- **Plugin Package.json**: A package.json file configured specifically for distributing an Unreal Engine plugin via NPM
- **Project Package.json**: A package.json file configured for an Unreal Engine project that consumes NPM plugins
- **Context Detection**: The process of determining whether the init command is running in a project or plugin directory
- **Plugin Metadata**: Information extracted from the `.uplugin` file to populate the package.json
- **Engine Version Compatibility**: Semver range specification indicating which Unreal Engine versions a plugin supports

## Requirements

### Requirement 1

**User Story:** As a plugin developer, I want to initialize my plugin directory for NPM distribution, so that I can easily publish my plugin to the NPM registry.

#### Acceptance Criteria

1. WHEN a developer executes the init command in a directory containing a uplugin file, THEN UEPM SHALL create a package.json file configured for plugin distribution
2. WHEN the init command creates a plugin package.json, THEN UEPM SHALL extract the plugin name from the uplugin filename and use it as the package name
3. WHEN the init command creates a plugin package.json, THEN UEPM SHALL extract version information from the uplugin file and use it as the package version
4. WHEN the init command creates a plugin package.json, THEN UEPM SHALL extract description and metadata from the uplugin file
5. WHEN the init command creates a plugin package.json, THEN UEPM SHALL include appropriate files array specifying which plugin files to include in the NPM package
6. WHEN the init command creates a plugin package.json, THEN UEPM SHALL set the main field to point to the uplugin file
7. WHEN the init command creates a plugin package.json, THEN UEPM SHALL include appropriate keywords for Unreal Engine plugin discovery

### Requirement 2

**User Story:** As a developer, I want the init command to automatically detect whether I'm in a project or plugin directory, so that I don't need to specify the context manually.

#### Acceptance Criteria

1. WHEN the init command is executed, THEN UEPM SHALL scan the current directory for both uproject and uplugin files
2. WHEN both uproject and uplugin files are found in the same directory, THEN UEPM SHALL prioritize project initialization and display a warning about the plugin file
3. WHEN only a uproject file is found, THEN UEPM SHALL perform project initialization as currently implemented
4. WHEN only a uplugin file is found, THEN UEPM SHALL perform plugin initialization
5. WHEN neither uproject nor uplugin files are found, THEN UEPM SHALL display an error message indicating no Unreal Engine project or plugin was detected
6. WHEN multiple uplugin files are found in the same directory, THEN UEPM SHALL display an error message asking the user to specify which plugin to initialize

### Requirement 3

**User Story:** As a plugin developer, I want the init command to configure my package.json with appropriate plugin-specific settings, so that my plugin can be properly distributed and consumed via NPM.

#### Acceptance Criteria

1. WHEN the init command creates a plugin package.json, THEN UEPM SHALL include an unreal section with engineVersion compatibility specification
2. WHEN the init command creates a plugin package.json, THEN UEPM SHALL include an unreal section with pluginName field matching the uplugin filename
3. WHEN the init command creates a plugin package.json, THEN UEPM SHALL set appropriate default engine version compatibility based on current Unreal Engine standards
4. WHEN the init command creates a plugin package.json, THEN UEPM SHALL include test scripts for plugin validation
5. WHEN the init command creates a plugin package.json, THEN UEPM SHALL include files array covering standard plugin directories (Source, Content, Resources, Config)
6. WHEN the init command creates a plugin package.json, THEN UEPM SHALL set the package as public by default unless specified otherwise

### Requirement 4

**User Story:** As a developer, I want the init command to handle existing package.json files appropriately in both project and plugin contexts, so that I don't lose existing configuration.

#### Acceptance Criteria

1. WHEN the init command is executed in plugin context with an existing package.json, THEN UEPM SHALL update the package.json to include plugin-specific fields without removing existing configuration
2. WHEN the init command updates an existing plugin package.json, THEN UEPM SHALL preserve existing dependencies and scripts while adding plugin-specific metadata
3. WHEN the init command is executed with the force flag in plugin context, THEN UEPM SHALL overwrite plugin-specific fields even if they already exist
4. WHEN the init command updates an existing package.json in plugin context, THEN UEPM SHALL validate that the main field points to the correct uplugin file
5. WHEN the init command encounters conflicting configuration in an existing package.json, THEN UEPM SHALL display a warning and preserve the existing values unless force flag is used

### Requirement 5

**User Story:** As a plugin developer, I want the init command to extract metadata from my uplugin file, so that my package.json is automatically populated with correct information.

#### Acceptance Criteria

1. WHEN the init command reads a uplugin file, THEN UEPM SHALL extract the FriendlyName field and use it as the package description if no description exists
2. WHEN the init command reads a uplugin file, THEN UEPM SHALL extract the Version or VersionName field and use it as the package version
3. WHEN the init command reads a uplugin file, THEN UEPM SHALL extract the CreatedBy field and use it as the package author if no author exists
4. WHEN the init command reads a uplugin file, THEN UEPM SHALL extract the DocsURL field and use it as the package homepage if no homepage exists
5. WHEN the uplugin file contains invalid JSON, THEN UEPM SHALL display an error message indicating the parsing failure and file location

### Requirement 6

**User Story:** As a developer, I want clear feedback about what type of initialization was performed, so that I understand what changes were made to my directory.

#### Acceptance Criteria

1. WHEN the init command completes successfully in project context, THEN UEPM SHALL display a message indicating project initialization was performed
2. WHEN the init command completes successfully in plugin context, THEN UEPM SHALL display a message indicating plugin initialization was performed
3. WHEN the init command detects an already initialized project or plugin, THEN UEPM SHALL display an appropriate message indicating the current state
4. WHEN the init command creates or modifies files, THEN UEPM SHALL list the specific files that were created or modified
5. WHEN the init command completes in plugin context, THEN UEPM SHALL provide next steps guidance for plugin development and publishing

### Requirement 7

**User Story:** As a plugin developer, I want the init command to set up appropriate default configurations for plugin testing, so that I can validate my plugin works correctly.

#### Acceptance Criteria

1. WHEN the init command initializes a plugin, THEN UEPM SHALL include test scripts in the package.json for plugin structure validation
2. WHEN the init command initializes a plugin, THEN UEPM SHALL include appropriate devDependencies for testing and validation
3. WHEN the init command initializes a plugin, THEN UEPM SHALL create or update gitignore patterns appropriate for Unreal Engine plugins
4. WHEN the init command initializes a plugin, THEN UEPM SHALL include build scripts if the plugin contains source code modules
5. WHEN the init command initializes a plugin, THEN UEPM SHALL set up appropriate NPM publish configuration to exclude unnecessary files

### Requirement 8

**User Story:** As a developer, I want the init command to maintain backward compatibility, so that existing projects continue to work without modification.

#### Acceptance Criteria

1. WHEN the init command is executed in a directory with only a uproject file, THEN UEPM SHALL perform exactly the same initialization as the current implementation
2. WHEN existing projects run the init command after the plugin support update, THEN UEPM SHALL produce identical results to the previous version
3. WHEN the init command API is used programmatically, THEN UEPM SHALL maintain the same function signatures and return types for project initialization
4. WHEN the init command encounters legacy project configurations, THEN UEPM SHALL handle them correctly without breaking existing functionality
5. WHEN the init command is executed with existing command-line flags, THEN UEPM SHALL honor all existing flags and options for project initialization