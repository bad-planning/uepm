#!/bin/bash

# Test script to simulate the publishing workflow locally
# This runs the same steps as the GitHub Action but without actually publishing

set -e

echo "🧪 Testing publish workflow (dry run)..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    echo "❌ Error: Run this script from the repository root"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Build packages
echo "🔨 Building packages..."
npm run build
echo "✓ Packages built"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
echo "✓ Tests passed"
echo ""

# Show current versions
echo "📋 Current package versions:"
echo "Core: $(node -p "require('./packages/core/package.json').version")"
echo "Init: $(node -p "require('./packages/init/package.json').version")"
echo "Validate: $(node -p "require('./packages/validate/package.json').version")"
echo "Example Plugin: $(node -p "require('./samples/plugins/example-plugin/package.json').version")"
echo "Dependency Plugin: $(node -p "require('./samples/plugins/dependency-plugin/package.json').version")"
echo ""

# Test CLI functionality
echo "🔧 Testing CLI functionality..."
node packages/init/bin/uepm-init.js --help > /dev/null
node packages/postinstall/bin/uepm-postinstall.js --help > /dev/null
echo "✓ CLI commands work"
echo ""

# Test sample project structure
echo "🏗️ Testing sample project structure..."
cd samples/tests
npm test > /dev/null
cd ../..
echo "✓ Sample project tests pass"
echo ""

echo "✅ All checks passed! Ready for publishing."
echo ""
echo "To publish to NPM:"
echo "1. Go to GitHub repository"
echo "2. Navigate to Actions tab"
echo "3. Select 'Publish to NPM' workflow"
echo "4. Click 'Run workflow'"
echo "5. Choose version bump type (patch/minor/major)"
echo "6. Optionally enable dry run to test first"
echo "7. Click 'Run workflow' button"