#!/bin/bash

# Test script to demonstrate UEPM workflow with GitHub repository
# This script shows how to use UEPM with plugins from a GitHub repository

set -e  # Exit on any error

echo "🚀 Testing UEPM with GitHub repository: https://github.com/adamschlesinger/uepm"
echo ""

# Clean up any existing installations
echo "🧹 Cleaning up existing installations..."
rm -rf node_modules package-lock.json uepm-temp
echo "✓ Cleanup complete"
echo ""

# Clone the UEPM repository temporarily
echo "📥 Cloning UEPM repository..."
git clone https://github.com/adamschlesinger/uepm.git uepm-temp
cd uepm-temp
echo "✓ Repository cloned"
echo ""

# Build the packages (skip the sample project to avoid postinstall issues)
echo "🔨 Building UEPM packages..."
npm install --ignore-scripts
npm run build

# Build individual packages that need compilation
cd packages/core && npm run build && cd ../..
cd packages/init && npm run build && cd ../..
cd packages/validate && npm run build && cd ../..

echo "✓ Packages built"
echo ""

# Go back to the sample project
cd ..

# Initialize the project using the cloned UEPM
echo "🎯 Initializing project with UEPM..."
node uepm-temp/packages/init/bin/uepm-init.js
echo "✓ Project initialized"
echo ""

# Install the example plugins from NPM
echo "📦 Installing example plugins from NPM..."
npm install @uepm/example-plugin @uepm/dependency-plugin
echo "✓ Plugins installed from NPM"
echo ""

# Run validation
echo "🔍 Running plugin validation..."
npx uepm-validate
echo "✓ Validation complete"
echo ""

# Verify the installation
echo "✅ Verifying installation..."
echo "📁 Project structure:"
echo "   SampleProject.uproject - $([ -f SampleProject.uproject ] && echo "✓ Found" || echo "✗ Missing")"
echo "   node_modules/@uepm/example-plugin/ - $([ -d node_modules/@uepm/example-plugin ] && echo "✓ Found" || echo "✗ Missing")"
echo "   node_modules/@uepm/dependency-plugin/ - $([ -d node_modules/@uepm/dependency-plugin ] && echo "✓ Found" || echo "✗ Missing")"

# Check if .uproject has been modified
if grep -q "node_modules" SampleProject.uproject; then
    echo "   AdditionalPluginDirectories in .uproject - ✓ Configured"
else
    echo "   AdditionalPluginDirectories in .uproject - ✗ Not configured"
fi

# Check plugin files
if [ -f "node_modules/@uepm/example-plugin/ExamplePlugin.uplugin" ]; then
    echo "   ExamplePlugin.uplugin - ✓ Found"
else
    echo "   ExamplePlugin.uplugin - ✗ Missing"
fi

if [ -f "node_modules/@uepm/dependency-plugin/DependencyPlugin.uplugin" ]; then
    echo "   DependencyPlugin.uplugin - ✓ Found"
else
    echo "   DependencyPlugin.uplugin - ✗ Missing"
fi

echo ""
echo "🎉 UEPM GitHub installation test complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Open SampleProject.uproject in Unreal Engine 5.7"
echo "   2. Go to Edit > Plugins to see the installed plugins"
echo "   3. Both ExamplePlugin and DependencyPlugin should be available"
echo ""
echo "🧹 To clean up, run: rm -rf uepm-temp"