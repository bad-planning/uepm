# Plugin Init Interactive Prompts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `npm init`-style interactive prompts to `npx @uepm/init` in plugin context, with smart defaults derived from `.uplugin` metadata and a `--yes` flag for non-interactive use.

**Architecture:** Prompts live entirely in `packages/init` so `@uepm/core` stays headless and testable. `InitOptions` gains five new optional fields (`packageName`, `description`, `author`, `license`, `yes`); the generator prefers these over extracted metadata when present. A new `plugin-prompts.ts` handles default derivation and user interaction. The call site in `index.ts` runs prompts before handing off to `PluginInitializationStrategy`.

**Tech Stack:** TypeScript, `prompts` npm package (zero transitive deps), Vitest.

---

### Task 1: Extend `InitOptions` and update the generator

**Files:**
- Modify: `packages/core/src/plugin-initialization-strategy.ts` (lines 9–14, `InitOptions` interface)
- Modify: `packages/core/src/plugin-package-json-generator.ts` (`PluginPackageJsonOptions` interface + `generatePluginPackageJson` function)
- Test: `packages/core/src/plugin-package-json-generator.test.ts`

- [ ] **Step 1: Write failing tests**

Add a new `describe('Options override metadata', ...)` block inside the existing `describe('Plugin Package.json Generator', ...)` in `packages/core/src/plugin-package-json-generator.test.ts`:

```typescript
import { generatePluginPackageJson } from './plugin-package-json-generator';

describe('Options override metadata', () => {
  const baseMetadata = {
    name: 'MyPlugin',
    version: '1.0.0',
    description: 'From metadata',
    author: 'MetadataAuthor',
    engineVersion: '5.3.0',
  };
  const upluginPath = '/fake/MyPlugin.uplugin';

  it('uses options.packageName over derived metadata name', () => {
    const pkg = generatePluginPackageJson(baseMetadata, upluginPath, {
      packageName: '@acme/my-plugin',
    });
    expect(pkg.name).toBe('@acme/my-plugin');
  });

  it('uses options.description over metadata description', () => {
    const pkg = generatePluginPackageJson(baseMetadata, upluginPath, {
      description: 'Override description',
    });
    expect(pkg.description).toBe('Override description');
  });

  it('uses options.author over metadata author', () => {
    const pkg = generatePluginPackageJson(baseMetadata, upluginPath, {
      author: 'Override Author',
    });
    expect(pkg.author).toBe('Override Author');
  });

  it('uses options.license over default MIT', () => {
    const pkg = generatePluginPackageJson(baseMetadata, upluginPath, {
      license: 'Apache-2.0',
    });
    expect(pkg.license).toBe('Apache-2.0');
  });

  it('uses options.engineVersion over metadata engineVersion', () => {
    const pkg = generatePluginPackageJson(baseMetadata, upluginPath, {
      engineVersion: '^5.0.0',
    });
    expect(pkg.unreal?.engineVersion).toBe('^5.0.0');
  });
});
```

- [ ] **Step 2: Run the tests — verify they fail**

```bash
cd packages/core && npx vitest --run src/plugin-package-json-generator.test.ts
```

Expected: 5 new tests fail.

- [ ] **Step 3: Extend `PluginPackageJsonOptions` in the generator**

In `packages/core/src/plugin-package-json-generator.ts`, replace the existing `PluginPackageJsonOptions` interface (lines 9–12):

```typescript
export interface PluginPackageJsonOptions {
  force?: boolean;
  engineVersion?: string;
  packageName?: string;
  description?: string;
  author?: string;
  license?: string;
}
```

- [ ] **Step 4: Update `generatePluginPackageJson` to prefer options fields**

In `packages/core/src/plugin-package-json-generator.ts`, replace the package name derivation and the `packageJson` construction block (from line 175 to the `license` line):

```typescript
  // Generate package name — prefer explicit override, else derive from plugin name
  const packageName = options.packageName ?? (
    metadata.name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
  );

  // ... (pluginFiles and pluginKeywords blocks stay unchanged) ...

  const packageJson: PackageJson = {
    name: packageName,
    version: metadata.version,
    description: options.description ?? metadata.description ?? metadata.friendlyName ?? `Unreal Engine plugin: ${metadata.name}`,
    main: upluginFileName,
    files: pluginFiles,
    keywords: pluginKeywords,
    scripts: {
      test: 'vitest --run',
      'test:watch': 'vitest'
    },
    unreal: {
      engineVersion: engineVersion,
      pluginName: metadata.name
    },
    engines: {
      node: '>=16.0.0'
    },
    license: options.license ?? 'MIT'
  };

  // Add optional metadata if available
  const resolvedAuthor = options.author ?? metadata.author;
  if (resolvedAuthor) {
    packageJson.author = resolvedAuthor;
  }
```

- [ ] **Step 5: Extend `InitOptions` in `plugin-initialization-strategy.ts`**

Replace the `InitOptions` interface (lines 9–14):

```typescript
export interface InitOptions {
  projectDir?: string;
  force?: boolean;
  pluginName?: string;
  engineVersion?: string;
  packageName?: string;
  description?: string;
  author?: string;
  license?: string;
  yes?: boolean;
}
```

- [ ] **Step 6: Run the tests — verify they pass**

```bash
cd packages/core && npm run build && npx vitest --run src/plugin-package-json-generator.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/plugin-package-json-generator.ts packages/core/src/plugin-initialization-strategy.ts packages/core/src/plugin-package-json-generator.test.ts
git commit -m "feat(core): Extend InitOptions and generator to prefer prompted values over metadata"
```

---

### Task 2: Create `plugin-prompts.ts` with `derivePluginDefaults` and `promptPluginOptions`

**Files:**
- Create: `packages/init/src/plugin-prompts.ts`
- Create: `packages/init/src/plugin-prompts.test.ts`
- Modify: `packages/init/package.json` (add `prompts` dep)

- [ ] **Step 1: Add `prompts` dependency**

In `packages/init/package.json`, add to `dependencies`:

```json
"prompts": "^2.4.2"
```

Install it:

```bash
cd packages/init && npm install
```

- [ ] **Step 2: Write failing tests for `derivePluginDefaults`**

Create `packages/init/src/plugin-prompts.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { derivePluginDefaults } from './plugin-prompts';
import type { PluginMetadata } from '@uepm/core';

const base: PluginMetadata = {
  name: 'ExamplePlugin',
  version: '1.0.1',
  description: 'A plugin',
  friendlyName: 'Example Plugin',
  author: 'UEPM',
  engineVersion: '5.3.0',
};

describe('derivePluginDefaults', () => {
  describe('packageName', () => {
    it('derives scope from CreatedBy and name from plugin filename', () => {
      const d = derivePluginDefaults(base, 'ExamplePlugin');
      expect(d.packageName).toBe('@uepm/example-plugin');
    });

    it('handles multi-word CreatedBy with spaces', () => {
      const d = derivePluginDefaults({ ...base, author: 'Epic Games' }, 'MyPlugin');
      expect(d.packageName).toBe('@epic-games/my-plugin');
    });

    it('omits scope when CreatedBy is empty', () => {
      const d = derivePluginDefaults({ ...base, author: '' }, 'MyPlugin');
      expect(d.packageName).toBe('my-plugin');
    });

    it('omits scope when CreatedBy is absent', () => {
      const d = derivePluginDefaults({ ...base, author: undefined }, 'MyPlugin');
      expect(d.packageName).toBe('my-plugin');
    });

    it('converts PascalCase plugin name to kebab-case', () => {
      const d = derivePluginDefaults({ ...base, author: '' }, 'MyAwesomePlugin');
      expect(d.packageName).toBe('my-awesome-plugin');
    });
  });

  describe('version', () => {
    it('uses metadata.version', () => {
      const d = derivePluginDefaults(base, 'ExamplePlugin');
      expect(d.version).toBe('1.0.1');
    });

    it('falls back to 1.0.0 when version is absent', () => {
      const d = derivePluginDefaults({ ...base, version: '' }, 'ExamplePlugin');
      expect(d.version).toBe('1.0.0');
    });
  });

  describe('description', () => {
    it('uses metadata.description', () => {
      const d = derivePluginDefaults(base, 'ExamplePlugin');
      expect(d.description).toBe('A plugin');
    });

    it('falls back to friendlyName when description is absent', () => {
      const d = derivePluginDefaults({ ...base, description: undefined }, 'ExamplePlugin');
      expect(d.description).toBe('Example Plugin');
    });

    it('falls back to empty string when both are absent', () => {
      const d = derivePluginDefaults({ ...base, description: undefined, friendlyName: undefined }, 'ExamplePlugin');
      expect(d.description).toBe('');
    });
  });

  describe('author', () => {
    it('uses metadata.author', () => {
      const d = derivePluginDefaults(base, 'ExamplePlugin');
      expect(d.author).toBe('UEPM');
    });

    it('falls back to empty string when absent', () => {
      const d = derivePluginDefaults({ ...base, author: undefined }, 'ExamplePlugin');
      expect(d.author).toBe('');
    });
  });

  describe('license', () => {
    it('always defaults to MIT', () => {
      const d = derivePluginDefaults(base, 'ExamplePlugin');
      expect(d.license).toBe('MIT');
    });
  });

  describe('engineVersion', () => {
    it('uses metadata.engineVersion when present', () => {
      const d = derivePluginDefaults(base, 'ExamplePlugin');
      expect(d.engineVersion).toBe('5.3.0');
    });

    it('falls back to ^5.0.0 when absent', () => {
      const d = derivePluginDefaults({ ...base, engineVersion: undefined }, 'ExamplePlugin');
      expect(d.engineVersion).toBe('^5.0.0');
    });
  });
});
```

- [ ] **Step 3: Run the tests — verify they fail**

```bash
cd packages/init && npx vitest --run src/plugin-prompts.test.ts
```

Expected: error — module not found.

- [ ] **Step 4: Create `packages/init/src/plugin-prompts.ts`**

```typescript
import prompts from 'prompts';
import type { PluginMetadata } from '@uepm/core';

export interface PluginPromptDefaults {
  packageName: string;
  version: string;
  description: string;
  author: string;
  license: string;
  engineVersion: string;
}

function toNpmScope(createdBy: string): string {
  const cleaned = createdBy
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned ? `@${cleaned}` : '';
}

function toKebabCase(name: string): string {
  return name
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

export function derivePluginDefaults(
  metadata: PluginMetadata,
  pluginName: string
): PluginPromptDefaults {
  const scope = metadata.author ? toNpmScope(metadata.author) : '';
  const kebabName = toKebabCase(pluginName);
  const packageName = scope ? `${scope}/${kebabName}` : kebabName;

  return {
    packageName,
    version: metadata.version || '1.0.0',
    description: metadata.description ?? metadata.friendlyName ?? '',
    author: metadata.author ?? '',
    license: 'MIT',
    engineVersion: metadata.engineVersion ?? '^5.0.0',
  };
}

export async function promptPluginOptions(
  defaults: PluginPromptDefaults
): Promise<PluginPromptDefaults> {
  const response = await prompts(
    [
      { type: 'text', name: 'packageName',   message: 'package name',              initial: defaults.packageName },
      { type: 'text', name: 'version',        message: 'version',                   initial: defaults.version },
      { type: 'text', name: 'description',    message: 'description',               initial: defaults.description },
      { type: 'text', name: 'author',         message: 'author',                    initial: defaults.author },
      { type: 'text', name: 'license',        message: 'license',                   initial: defaults.license },
      { type: 'text', name: 'engineVersion',  message: 'engine version (semver range)', initial: defaults.engineVersion },
    ],
    { onCancel: () => process.exit(1) }
  );

  return response as PluginPromptDefaults;
}
```

- [ ] **Step 5: Run the tests — verify they pass**

```bash
cd packages/init && npx vitest --run src/plugin-prompts.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/init/src/plugin-prompts.ts packages/init/src/plugin-prompts.test.ts packages/init/package.json package-lock.json
git commit -m "feat(init): Add plugin prompt defaults derivation and interactive prompts"
```

---

### Task 3: Add `--yes` flag to the CLI

**Files:**
- Modify: `packages/init/src/cli.ts`

- [ ] **Step 1: Add `--yes` / `-y` option and thread it into `InitOptions`**

In `packages/init/src/cli.ts`, replace the `.option` block and `initOptions` construction:

```typescript
  program
    .name('uepm-init')
    .description('Initialize Unreal Engine project or plugin for NPM package management')
    .version('0.1.0')
    .option('-f, --force', 'Force reinitialization even if already initialized')
    .option('-d, --project-dir <path>', 'Project or plugin directory (defaults to current directory)')
    .option('-y, --yes', 'Accept all defaults without prompting (plugin context only)')
    .action(async (options) => {
      const initOptions: InitOptions = {
        projectDir: options.projectDir || process.cwd(),
        force: options.force || false,
        yes: options.yes || false,
      };
```

- [ ] **Step 2: Update the help text to mention `--yes`**

Replace the `.addHelpText` call:

```typescript
    .addHelpText('after', `
Examples:
  $ uepm-init                          Initialize project or plugin in current directory
  $ uepm-init -d ./MyPlugin            Initialize an Unreal Engine plugin for NPM distribution
  $ uepm-init --yes                    Initialize plugin using derived defaults (no prompts)
  $ uepm-init --force                  Force reinitialization of project or plugin

The command automatically detects whether the directory contains a .uproject (project)
or .uplugin (plugin) file and performs the appropriate initialization.

In plugin context, you will be prompted to confirm six fields (name, version,
description, author, license, engine version). Use --yes to skip prompts and
accept the derived defaults.`);
```

- [ ] **Step 3: Run the existing CLI tests — verify no regressions**

```bash
cd packages/init && npm run build && npx vitest --run src/cli.test.ts
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/init/src/cli.ts
git commit -m "feat(init): Add --yes flag to skip interactive prompts"
```

---

### Task 4: Wire prompts into `index.ts` and handle non-TTY

**Files:**
- Modify: `packages/init/src/index.ts`
- Modify: `packages/init/src/index.test.ts`

- [ ] **Step 1: Write failing tests**

Add a new `describe('plugin context — interactive prompts', ...)` block at the bottom of `packages/init/src/index.test.ts`, before the final closing `});`:

```typescript
import * as path from 'path';
// (imports already present — no new imports needed)

  describe('plugin context — interactive prompts', () => {
    it('returns error when stdin is not a TTY and --yes is not set', async () => {
      const upluginPath = path.join(tempDir, 'MyPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify({ FileVersion: 3, Version: 1 }));

      // Simulate non-TTY: process.stdin.isTTY is undefined in the test runner
      const result = await init({ projectDir: tempDir });

      expect(result.success).toBe(false);
      expect(result.message).toContain('interactive terminal');
      expect(result.message).toContain('--yes');
    });

    it('uses derived defaults and skips prompts when yes: true', async () => {
      const upluginPath = path.join(tempDir, 'CoolPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify({
        FileVersion: 3,
        Version: 1,
        VersionName: '2.0.0',
        FriendlyName: 'Cool Plugin',
        CreatedBy: 'Acme',
      }));

      const result = await init({ projectDir: tempDir, yes: true });

      expect(result.success).toBe(true);
      const pkg = JSON.parse(
        await fs.readFile(path.join(tempDir, 'package.json'), 'utf-8')
      );
      expect(pkg.name).toBe('@acme/cool-plugin');
      expect(pkg.version).toBe('2.0.0');
      expect(pkg.author).toBe('Acme');
    });

    it('passes explicitly set packageName through to the generated package.json', async () => {
      const upluginPath = path.join(tempDir, 'MyPlugin.uplugin');
      await fs.writeFile(upluginPath, JSON.stringify({ FileVersion: 3, Version: 1 }));

      const result = await init({
        projectDir: tempDir,
        yes: true,
        packageName: '@custom-scope/my-plugin',
      });

      expect(result.success).toBe(true);
      const pkg = JSON.parse(
        await fs.readFile(path.join(tempDir, 'package.json'), 'utf-8')
      );
      expect(pkg.name).toBe('@custom-scope/my-plugin');
    });
  });
```

- [ ] **Step 2: Run the tests — verify they fail**

```bash
cd packages/init && npx vitest --run src/index.test.ts
```

Expected: the 3 new tests fail (non-TTY test may currently pass accidentally since prompts aren't called yet — that's fine; the `yes: true` tests will fail because the prompt flow isn't wired up).

- [ ] **Step 3: Update imports in `packages/init/src/index.ts`**

Add to the existing import from `@uepm/core`:

```typescript
import {
  findProjectFile,
  readProject,
  writeProject,
  addPluginDirectory,
  hasPluginDirectory,
  UEPMError,
  ExitCode,
  detectContext,
  PluginInitializationStrategy,
  InitOptions,
  InitResult,
  extractPluginMetadata,
} from '@uepm/core';
```

Add a new import for the prompt helpers:

```typescript
import { derivePluginDefaults, promptPluginOptions, PluginPromptDefaults } from './plugin-prompts';
```

- [ ] **Step 4: Replace the plugin context block in `init()` in `packages/init/src/index.ts`**

Replace from `if (context.type === 'plugin') {` through the closing `}` of that branch (currently lines 51–70):

```typescript
    if (context.type === 'plugin') {
      // Derive prompt defaults from .uplugin metadata
      const metadata = await extractPluginMetadata(context.primaryFile);
      const defaults = derivePluginDefaults(metadata, context.pluginName);

      let resolved: PluginPromptDefaults;
      if (options.yes) {
        resolved = defaults;
      } else if (process.stdin.isTTY) {
        console.log('\nThis utility will walk you through setting up your plugin for NPM distribution.');
        console.log('Press ^C at any time to quit.\n');
        resolved = await promptPluginOptions(defaults);
      } else {
        throw new UEPMError(
          'INTERACTIVE_REQUIRED',
          'uepm-init requires an interactive terminal for plugin initialization.',
          ExitCode.INVALID_ARGUMENTS,
          undefined,
          'Run with --yes to accept derived defaults and skip prompts.'
        );
      }

      const pluginStrategy = new PluginInitializationStrategy();
      const coreOptions: InitOptions = {
        projectDir: options.projectDir,
        force: options.force,
        pluginName: options.pluginName,
        packageName: resolved.packageName,
        version: resolved.version,
        description: resolved.description,
        author: resolved.author,
        license: resolved.license,
        engineVersion: resolved.engineVersion,
      };

      const result = await pluginStrategy.initialize(context, coreOptions);

      return {
        success: result.success,
        message: warningMessage + result.message,
        alreadyInitialized: result.alreadyInitialized,
        context: result.context,
        filesCreated: result.filesCreated,
        filesModified: result.filesModified,
      };
```

- [ ] **Step 5: Add `version` to `InitOptions` in `plugin-initialization-strategy.ts`**

The resolved object includes `version` but `InitOptions` doesn't have that field yet. Add it:

```typescript
export interface InitOptions {
  projectDir?: string;
  force?: boolean;
  pluginName?: string;
  engineVersion?: string;
  packageName?: string;
  version?: string;
  description?: string;
  author?: string;
  license?: string;
  yes?: boolean;
}
```

Then in `generatePluginPackageJson`, prefer `options.version` when set:

```typescript
  const packageJson: PackageJson = {
    name: packageName,
    version: options.version ?? metadata.version,
    // ... rest unchanged
  };
```

Add a test for this in `plugin-package-json-generator.test.ts`:

```typescript
  it('uses options.version over metadata version', () => {
    const pkg = generatePluginPackageJson(baseMetadata, upluginPath, {
      version: '3.0.0',
    });
    expect(pkg.version).toBe('3.0.0');
  });
```

- [ ] **Step 6: Run the tests — verify they pass**

```bash
cd packages/init && npm run build && npx vitest --run src/index.test.ts
```

Expected: all tests pass including the 3 new ones.

- [ ] **Step 7: Run the full test suite**

```bash
cd /Users/adamschlesinger/repos/uepm && npm run build && npm test
```

Expected: all tests pass across all packages.

- [ ] **Step 8: Commit**

```bash
git add packages/init/src/index.ts packages/init/src/index.test.ts packages/core/src/plugin-initialization-strategy.ts packages/core/src/plugin-package-json-generator.ts packages/core/src/plugin-package-json-generator.test.ts
git commit -m "feat(init): Wire interactive prompts into plugin init flow"
```

---

### Task 5: End-to-end manual test

**Files:** No file changes — verification only.

- [ ] **Step 1: Remove the sample plugin's `package.json`**

```bash
rm samples/plugins/example-plugin/package.json
```

- [ ] **Step 2: Run init and walk through the prompts**

```bash
cd samples/plugins/example-plugin && node ../../../packages/init/bin/uepm-init.js
```

Expected: the intro message appears, then six prompts with pre-filled values. Defaults should be:
- `package name:` → `@uepm/example-plugin` (from `CreatedBy: "UEPM"` + filename)
- `version:` → `1.0.1` (from `VersionName: "1.0.1"`)
- `description:` → `An example Unreal Engine plugin demonstrating NPM distribution pattern`
- `author:` → `UEPM`
- `license:` → `MIT`
- `engine version (semver range):` → `^5.0.0`

Hit enter on all six. Verify `package.json` is written with exactly those values.

- [ ] **Step 3: Test `--yes` flag**

```bash
rm samples/plugins/example-plugin/package.json
node ../../../packages/init/bin/uepm-init.js --yes
```

Expected: no prompts shown, `package.json` created with derived defaults.

- [ ] **Step 4: Test non-TTY error**

```bash
rm samples/plugins/example-plugin/package.json
echo "" | node ../../../packages/init/bin/uepm-init.js
```

Expected: prints the interactive terminal error with the `--yes` suggestion, exits 1.

- [ ] **Step 5: Restore the sample plugin's canonical `package.json`**

```bash
cat > samples/plugins/example-plugin/package.json << 'EOF'
{
  "name": "@uepm/example-plugin",
  "version": "1.0.5",
  "description": "Example Unreal Engine plugin distributed via NPM",
  "main": "ExamplePlugin.uplugin",
  "scripts": {
    "test": "vitest --run",
    "test:watch": "vitest"
  },
  "unreal": {
    "engineVersion": ">=5.0.0 <6.0.0",
    "pluginName": "ExamplePlugin"
  },
  "files": [
    "ExamplePlugin.uplugin",
    "Source/**/*",
    "Resources/**/*",
    "Content/**/*"
  ],
  "keywords": [
    "unreal",
    "unreal-engine",
    "plugin",
    "uepm"
  ],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
```

- [ ] **Step 6: Run full test suite — confirm clean**

```bash
cd /Users/adamschlesinger/repos/uepm && npm run build && npm test
```

Expected: all tests pass.

- [ ] **Step 7: Push**

```bash
git push
```
