#!/bin/bash

# Local publishing script that mimics the GitHub Action workflow
# This script publishes packages to NPM using the token from .env file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Run this script from the repository root"
    exit 1
fi

# Load environment variables
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create it with NPM_TOKEN=your_token"
    exit 1
fi

source .env

if [ -z "$NPM_TOKEN" ]; then
    print_error "NPM_TOKEN not found in .env file"
    exit 1
fi

# Parse command line arguments
VERSION_TYPE="patch"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --version-type)
            VERSION_TYPE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--version-type patch|minor|major|prerelease] [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --version-type    Version bump type (default: patch)"
            echo "  --dry-run        Don't actually publish, just show what would happen"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_step "Local NPM Publishing Script"
echo "Version type: $VERSION_TYPE"
echo "Dry run: $DRY_RUN"
echo ""

if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN MODE - No actual publishing will occur"
    echo ""
fi

# Step 1: Install dependencies
print_step "Installing dependencies"
npm install
print_success "Dependencies installed"
echo ""

# Step 2: Build packages
print_step "Building packages"
npm run build
print_success "Packages built"
echo ""

# Step 3: Run tests
print_step "Running tests"
npm test
print_success "Tests passed"
echo ""

# Step 4: Configure NPM authentication
print_step "Configuring NPM authentication"
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
print_success "NPM authentication configured"
echo ""

# Function to bump version in package.json
bump_version() {
    local package_dir=$1
    local version_type=$2
    
    cd "$package_dir"
    if [ "$DRY_RUN" = true ]; then
        local current_version=$(node -p "require('./package.json').version")
        echo "Would bump $package_dir from $current_version ($version_type)" >&2
        echo $current_version
    else
        npm version $version_type --no-git-tag-version >&2
        local new_version=$(node -p "require('./package.json').version")
        echo "Bumped $package_dir to $new_version" >&2
        echo $new_version
    fi
    cd - > /dev/null
}

# Function to update dependency versions
update_dependency() {
    local package_file=$1
    local dep_name=$2
    local new_version=$3
    
    if [ "$DRY_RUN" = true ]; then
        echo "Would update $dep_name to ^$new_version in $package_file"
        return
    fi
    
    # Update dependency version using node
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$package_file', 'utf8'));
        if (pkg.dependencies && pkg.dependencies['$dep_name']) {
            pkg.dependencies['$dep_name'] = '^$new_version';
        }
        if (pkg.devDependencies && pkg.devDependencies['$dep_name']) {
            pkg.devDependencies['$dep_name'] = '^$new_version';
        }
        fs.writeFileSync('$package_file', JSON.stringify(pkg, null, 2) + '\n');
    "
}

# Step 5: Sync package versions to workspace version
print_step "Syncing package versions to workspace version"

workspace_version=$(node -p "require('./package.json').version")
echo "Workspace version: $workspace_version"
echo ""

# Function to sync package version to workspace version
sync_to_workspace_version() {
    local package_file=$1
    local package_name=$2
    
    if [ "$DRY_RUN" = true ]; then
        if [ -f "$package_file" ]; then
            local current_version=$(node -p "require('./$package_file').version")
            echo "Would sync $package_name from $current_version to $workspace_version"
        else
            echo "Would sync $package_name (file not found: $package_file) to $workspace_version"
        fi
        return
    fi
    
    # Update package version to match workspace
    if [ -f "$package_file" ]; then
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('$package_file', 'utf8'));
            const oldVersion = pkg.version;
            pkg.version = '$workspace_version';
            fs.writeFileSync('$package_file', JSON.stringify(pkg, null, 2) + '\n');
            console.log('Synced $package_name from ' + oldVersion + ' to $workspace_version');
        "
    else
        echo "Warning: Package file not found: $package_file"
    fi
}

# Sync all package versions to workspace version
sync_to_workspace_version "packages/core/package.json" "@uepm/core"
sync_to_workspace_version "packages/init/package.json" "@uepm/init"
sync_to_workspace_version "packages/postinstall/package.json" "@uepm/postinstall"
sync_to_workspace_version "samples/plugins/example-plugin/package.json" "@uepm/example-plugin"
sync_to_workspace_version "samples/plugins/dependency-plugin/package.json" "@uepm/dependency-plugin"

# Update internal dependencies to use workspace version
echo ""
echo "Updating internal dependencies to workspace version..."
update_dependency "packages/init/package.json" "@uepm/core" "$workspace_version"
update_dependency "packages/postinstall/package.json" "@uepm/core" "$workspace_version"
update_dependency "samples/plugins/dependency-plugin/package.json" "@uepm/example-plugin" "$workspace_version"
update_dependency "samples/project/package.json" "@uepm/postinstall" "$workspace_version"

print_success "All packages synced to workspace version ($workspace_version)"
echo ""

# Step 6: Version bumping
print_step "Version bumping"

# Show current versions (should all be synced now)
echo "Current versions (after sync):"
echo "Core: $(node -p "require('./packages/core/package.json').version")"
echo "Init: $(node -p "require('./packages/init/package.json').version")"
echo "Postinstall: $(node -p "require('./packages/postinstall/package.json').version")"
echo "Example Plugin: $(node -p "require('./samples/plugins/example-plugin/package.json').version")"
echo "Dependency Plugin: $(node -p "require('./samples/plugins/dependency-plugin/package.json').version")"
echo ""

# Bump workspace version first
echo "Bumping workspace version..."
if [ "$DRY_RUN" = true ]; then
    echo "Would bump workspace from $workspace_version ($VERSION_TYPE)"
    new_workspace_version=$workspace_version
else
    npm version $VERSION_TYPE --no-git-tag-version
    new_workspace_version=$(node -p "require('./package.json').version")
    echo "Bumped workspace to $new_workspace_version"
fi

# Now bump all packages to match the new workspace version
echo "Bumping all packages to match new workspace version ($new_workspace_version)..."
core_version=$(bump_version "packages/core" "patch")  # We'll override this
init_version=$(bump_version "packages/init" "patch")
postinstall_version=$(bump_version "packages/postinstall" "patch")
example_version=$(bump_version "samples/plugins/example-plugin" "patch")
dependency_version=$(bump_version "samples/plugins/dependency-plugin" "patch")

# Override all versions to match workspace
if [ "$DRY_RUN" = false ]; then
    sync_to_workspace_version "packages/core/package.json" "@uepm/core"
    sync_to_workspace_version "packages/init/package.json" "@uepm/init"
    sync_to_workspace_version "packages/postinstall/package.json" "@uepm/postinstall"
    sync_to_workspace_version "samples/plugins/example-plugin/package.json" "@uepm/example-plugin"
    sync_to_workspace_version "samples/plugins/dependency-plugin/package.json" "@uepm/dependency-plugin"
    
    # Update all versions to the new workspace version for consistency
    core_version=$new_workspace_version
    init_version=$new_workspace_version
    postinstall_version=$new_workspace_version
    example_version=$new_workspace_version
    dependency_version=$new_workspace_version
fi

# Update internal dependencies to use new workspace version
echo "Updating internal dependencies to new workspace version..."
update_dependency "packages/init/package.json" "@uepm/core" "$new_workspace_version"
update_dependency "packages/postinstall/package.json" "@uepm/core" "$new_workspace_version"
update_dependency "samples/plugins/dependency-plugin/package.json" "@uepm/example-plugin" "$new_workspace_version"
update_dependency "samples/project/package.json" "@uepm/postinstall" "$new_workspace_version"

print_success "Version bumping complete"
echo ""

if [ "$DRY_RUN" = false ]; then
    # Step 7: Rebuild after version updates
    print_step "Rebuilding packages after version updates"
    npm run build
    print_success "Packages rebuilt"
    echo ""

    # Step 8: Publishing
    print_step "Publishing packages to NPM"
    
    echo "Publishing @uepm/core@$core_version"
    cd packages/core && npm publish --access public && cd ../..
    print_success "Published @uepm/core@$core_version"
    
    echo "Publishing @uepm/init@$init_version"
    cd packages/init && npm publish --access public && cd ../..
    print_success "Published @uepm/init@$init_version"
    
    echo "Publishing @uepm/postinstall@$postinstall_version"
    cd packages/postinstall && npm publish --access public && cd ../..
    print_success "Published @uepm/postinstall@$postinstall_version"
    
    echo "Publishing @uepm/example-plugin@$example_version"
    cd samples/plugins/example-plugin && npm publish --access public && cd ../../..
    print_success "Published @uepm/example-plugin@$example_version"
    
    echo "Publishing @uepm/dependency-plugin@$dependency_version"
    cd samples/plugins/dependency-plugin && npm publish --access public && cd ../../..
    print_success "Published @uepm/dependency-plugin@$dependency_version"
    
    echo ""
    print_step "Publication Summary"
    echo "@uepm/core: $core_version"
    echo "@uepm/init: $init_version"
    echo "@uepm/postinstall: $postinstall_version"
    echo "@uepm/example-plugin: $example_version"
    echo "@uepm/dependency-plugin: $dependency_version"
    echo ""
    
    print_success "All packages published successfully!"
    echo ""
    echo "You can now test the published packages:"
    echo "  npx @uepm/init@$init_version"
    echo "  npm install @uepm/example-plugin@$example_version"
    
else
    echo ""
    print_warning "DRY RUN COMPLETE - No packages were actually published"
    echo ""
    echo "To publish for real, run:"
    echo "  $0 --version-type $VERSION_TYPE"
fi

# Clean up NPM config
rm -f ~/.npmrc
print_success "Cleaned up NPM authentication"