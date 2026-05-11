# Testing UEPM from GitHub Repository

This document explains how to test UEPM using the latest code from the GitHub repository at https://github.com/adamschlesinger/uepm.

## Quick Test

Run the automated test script:

```bash
./test-github-install.sh
```

This script will:
1. Clone the UEPM repository
2. Build all packages
3. Initialize your Unreal project for UEPM
4. Install the example plugins
5. Verify everything is working correctly

## Manual Testing Steps

If you prefer to test manually:

### 1. Clone and Build UEPM

```bash
# Clone the repository
git clone https://github.com/adamschlesinger/uepm.git uepm-repo
cd uepm-repo

# Install dependencies and build packages
npm install --ignore-scripts
npm run build
```

### 2. Initialize Your Unreal Project

```bash
# Go to your Unreal project directory
cd /path/to/your/unreal/project

# Initialize with UEPM
node /path/to/uepm-repo/packages/init/bin/uepm-init.js
```

### 3. Install Plugins

```bash
# Install plugins from NPM
npm install @uepm/example-plugin @uepm/dependency-plugin
```

### 4. Validate Installation

```bash
# Run validation
npx uepm-validate
```

### 5. Test in Unreal Engine

1. Open your `.uproject` file in Unreal Engine
2. Go to **Edit > Plugins**
3. Look for "ExamplePlugin" and "DependencyPlugin"
4. Both should be available and can be enabled

## What Gets Installed

After running the test, your project will have:

- **Modified .uproject file**: Contains `"AdditionalPluginDirectories": ["node_modules"]`
- **Example Plugin**: A basic plugin demonstrating UEPM structure
- **Dependency Plugin**: A plugin that depends on the Example Plugin
- **Validation Hook**: Checks plugin compatibility with your engine version

## Project Structure After Installation

```
your-project/
├── YourProject.uproject          # Modified with AdditionalPluginDirectories
├── package.json                  # Updated with plugin dependencies
├── node_modules/@uepm/           # UEPM plugins
│   ├── example-plugin/           # Basic example plugin
│   ├── dependency-plugin/        # Plugin with dependencies
│   └── validate/                 # Validation package
└── Source/                       # Your existing Unreal source code
```

## Cleanup

To clean up after testing:

```bash
rm -rf uepm-temp  # Remove cloned repository
rm -rf node_modules  # Remove installed plugins
git checkout package.json  # Restore original package.json (if in git)
```

## Troubleshooting

### Build Errors
If you encounter build errors when cloning the repository:
- Make sure you have Node.js 18+ installed
- Try running `npm install --ignore-scripts` to skip postinstall scripts
- Build packages individually if needed

### Plugin Not Found in Unreal Engine
- Verify the `.uproject` file contains `"AdditionalPluginDirectories": ["node_modules"]`
- Check that plugin files exist in `node_modules/@uepm/`
- Regenerate project files in Unreal Engine

### Validation Errors
- Check that your Unreal Engine version is compatible with the plugins
- Look for specific error messages in the validation output
- Ensure all plugin dependencies are installed

## Next Steps

Once you've verified UEPM works with your project:

1. **Create your own plugins** following the example plugin structure
2. **Publish to NPM** for easy distribution
3. **Use patch-package** to modify existing plugins
4. **Share with your team** using standard NPM workflows

For more information, see the main UEPM documentation in the repository.