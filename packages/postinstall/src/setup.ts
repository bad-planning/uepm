import { promises as fs } from 'fs';
import * as path from 'path';
import { PackageJson } from '@uepm/core';

/**
 * Determine whether a package directory is an Unreal Engine plugin by examining its content.
 * A package is considered a plugin if it has a `unreal` field in its package.json or contains
 * a .uplugin file. This avoids fragile name-based heuristics.
 */
async function isUnrealPlugin(packageDir: string): Promise<boolean> {
  try {
    const pkgContent = await fs.readFile(path.join(packageDir, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgContent) as { unreal?: unknown };
    if (pkg.unreal) return true;
  } catch {
    // If package.json is unreadable we can't confirm it's a plugin
    return false;
  }

  try {
    const files = await fs.readdir(packageDir);
    return files.some((f) => f.endsWith('.uplugin'));
  } catch {
    return false;
  }
}

/**
 * Set up UEPM plugin symlinks in UEPMPlugins directory
 * This creates a dedicated folder for Unreal Engine plugins and symlinks them from node_modules
 */
export async function setupPlugins(projectDir: string): Promise<void> {
  const packageJsonPath = path.join(projectDir, 'package.json');

  // Read package.json to find dependencies — errors propagate to runPostinstall's handler
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
  const packageJson: PackageJson = JSON.parse(packageJsonContent);

  const nodeModulesDir = path.join(projectDir, 'node_modules');
  const uepmPluginsDir = path.join(projectDir, 'UEPMPlugins');

  await fs.mkdir(uepmPluginsDir, { recursive: true });

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  let pluginsLinked = 0;
  const linkErrors: string[] = [];

  for (const [packageName, version] of Object.entries(allDeps || {})) {
    // Handle file: dependencies (for local development)
    if (typeof version === 'string' && version.startsWith('file:')) {
      const filePath = version.replace('file:', '');
      const absolutePath = path.resolve(projectDir, filePath);

      // Create symlink in node_modules for NPM workspace compatibility
      const nodeModulesLinkPath = path.join(nodeModulesDir, packageName);

      try {
        // Remove existing symlink/directory if it exists
        try {
          await fs.unlink(nodeModulesLinkPath);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
        }

        // Create symlink in node_modules (relative path)
        const relativePathForNodeModules = path.relative(path.dirname(nodeModulesLinkPath), absolutePath);
        await fs.symlink(relativePathForNodeModules, nodeModulesLinkPath, 'dir');
        console.log(`✓ Linked ${packageName} -> ${filePath} (node_modules)`);
      } catch (error) {
        const msg = `Failed to link ${packageName} in node_modules: ${error}`;
        console.warn(`⚠ ${msg}`);
        linkErrors.push(msg);
      }
    }

    // Resolve source path for this dependency
    let sourcePath: string;
    if (typeof version === 'string' && version.startsWith('file:')) {
      sourcePath = path.resolve(projectDir, version.replace('file:', ''));
    } else {
      sourcePath = path.join(nodeModulesDir, packageName);
    }

    // Check if the package is an Unreal Engine plugin by examining its content
    if (await isUnrealPlugin(sourcePath)) {
      // Check if source exists
      try {
        await fs.access(sourcePath);
      } catch {
        console.warn(`⚠ Plugin source not found: ${sourcePath}`);
        continue;
      }

      // Create symlink in UEPMPlugins directory — use the trailing package name as the folder name
      const pluginName = packageName.includes('/') ? packageName.split('/').pop()! : packageName;
      const uepmLinkPath = path.join(uepmPluginsDir, pluginName);

      try {
        // Remove existing symlink/directory if it exists
        try {
          await fs.unlink(uepmLinkPath);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
        }

        // Create symlink in UEPMPlugins (relative path)
        const relativeSourcePath = path.relative(path.dirname(uepmLinkPath), sourcePath);
        await fs.symlink(relativeSourcePath, uepmLinkPath, 'dir');
        console.log(`✓ Linked ${packageName} -> UEPMPlugins/${pluginName}`);
        pluginsLinked++;
      } catch (error) {
        const msg = `Failed to link ${packageName} in UEPMPlugins: ${error}`;
        console.warn(`⚠ ${msg}`);
        linkErrors.push(msg);
      }
    }
  }

  if (pluginsLinked > 0) {
    console.log(`✓ Successfully linked ${pluginsLinked} UEPM plugin(s) to UEPMPlugins directory`);
  }

  if (linkErrors.length > 0) {
    throw new Error(`${linkErrors.length} symlink(s) failed to create:\n${linkErrors.map(e => `  - ${e}`).join('\n')}`);
  }
}