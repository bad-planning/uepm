# UEPM - Unreal Engine Package Manager

A monorepo containing tools and example plugins for managing Unreal Engine plugins via NPM.

## Packages

This monorepo contains the following packages:

### Core Packages

#### [`@uepm/init`](./packages/init)
One-time initialization tool for Unreal projects. Run via npx without installation:
```bash
npx @uepm/init
```

#### [`@uepm/validate`](./packages/validate)
Lightweight validation hook that checks plugin compatibility on every `npm install`. Automatically installed by `@uepm/init`.

#### [`@uepm/core`](./packages/core)
Shared utilities for UProject and package.json management. Used internally by other packages.

### Example Plugins

#### [`@uepm/example-plugin`](./packages/example-plugin)
Example Unreal Engine plugin demonstrating the NPM distribution pattern.

#### [`@uepm/dependency-plugin`](./packages/dependency-plugin)
Example plugin demonstrating plugin-to-plugin dependencies via NPM.

## Quick Start

### 1. Initialize your Unreal project (once)

```bash
cd YourUnrealProject
npx @uepm/init
```

### 2. Install plugins

```bash
npm install @uepm/example-plugin
```

### 3. Open your project in Unreal Engine

Plugins from node_modules will be automatically discovered!

## How it works

- **@uepm/init**: Modifies your .uproject to include `node_modules` in plugin search paths and sets up validation
- **@uepm/validate**: Runs automatically after `npm install` to check plugin compatibility with your engine version
- **Plugins**: Distributed as normal NPM packages with Unreal plugin structure inside

## Development

### Installation

Install dependencies for all packages:

```bash
npm install
```

### Build

Build all packages:

```bash
npm run build
```

### Test

Run tests for all packages:

```bash
npm run test
```

### Working on a specific package

```bash
cd packages/init
npm run build
npm test
```

## Project Structure

```
uepm/
├── packages/
│   ├── core/                   # Shared utilities
│   ├── init/                   # One-time initialization tool
│   ├── validate/               # Postinstall validation hook
│   ├── example-plugin/         # Example plugin
│   └── dependency-plugin/      # Plugin with dependencies
├── package.json                # Root package.json with workspaces
└── README.md                   # This file
```

## Benefits

- **Lightweight**: Only download what you need (init runs once via npx)
- **Automatic validation**: Compatibility checks on every install
- **Standard workflow**: Use familiar NPM commands
- **Dependency management**: Plugins can depend on other plugins
- **Patch support**: Compatible with patch-package for modifications

## Requirements

- Node.js >= 18.0.0
- NPM >= 7.0.0 (for workspaces support)
- Unreal Engine 5.0+

## License

MIT
