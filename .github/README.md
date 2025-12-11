# GitHub Actions

This directory contains GitHub Actions workflows for the UEPM project.

## Workflows

### `test.yml` - Continuous Integration
- **Triggers**: Push to main/develop branches, Pull requests to main
- **Purpose**: Run tests on multiple Node.js versions (18.x, 20.x)
- **Steps**:
  1. Install dependencies
  2. Build all packages
  3. Run test suites
  4. Test CLI functionality
  5. Validate sample project structure

### `publish.yml` - NPM Publishing
- **Triggers**: Manual dispatch only
- **Purpose**: Publish packages to NPM registry
- **Options**:
  - **Version bump type**: patch, minor, major, or prerelease
  - **Dry run**: Test the workflow without actually publishing
- **Steps**:
  1. Install dependencies and build packages
  2. Run full test suite
  3. Bump versions in dependency order
  4. Update cross-package dependencies
  5. Commit version changes
  6. Publish to NPM with public access
  7. Create and push git tag

## Publishing Process

To publish a new version:

1. **Go to GitHub repository**
2. **Navigate to Actions tab**
3. **Select "Publish to NPM" workflow**
4. **Click "Run workflow"**
5. **Configure options**:
   - Choose version bump type (patch for bug fixes, minor for features, major for breaking changes)
   - Optionally enable "Dry run" to test without publishing
6. **Click "Run workflow" button**

### Version Bump Types

- **patch** (1.0.0 → 1.0.1): Bug fixes, small improvements
- **minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **major** (1.0.0 → 2.0.0): Breaking changes
- **prerelease** (1.0.0 → 1.0.1-0): Pre-release versions

### Package Publishing Order

The workflow publishes packages in dependency order:

1. `@uepm/core` - Core utilities (no dependencies)
2. `@uepm/init` - Depends on core
3. `@uepm/validate` - Depends on core
4. `@uepm/example-plugin` - No dependencies
5. `@uepm/dependency-plugin` - Depends on example-plugin

## Secrets Required

The publish workflow requires these repository secrets:

- `NPM_TOKEN` - NPM authentication token with publish permissions
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Local Testing

Before publishing, you can test the workflow locally:

```bash
./scripts/test-publish.sh
```

This runs the same checks as the GitHub Action without actually publishing.