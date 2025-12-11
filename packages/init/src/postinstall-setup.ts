import { promises as fs } from 'fs';
import * as path from 'path';
import { PackageJson } from '@uepm/core';

/**
 * Set up local plugin symlinks for file: dependencies
 * This ensures plugins are available in node_modules even in monorepo workspaces
 */
export async function setupLocalPlugins(projectDir: string): Promise<void> {
  const packageJsonPath = path.join(projectDir, 'package.json');
  
  try {
    // Read package.json to find file: dependencies
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson: PackageJson = JSON.parse(packageJsonContent);
    
    const nodeModulesDir = path.join(projectDir, 'node_modules');
    const uepmDir = path.join(nodeModulesDir, '@uepm');
    
    // Ensure directories exist
    await fs.mkdir(nodeModulesDir, { recursive: true });
    await fs.mkdir(uepmDir, { recursive: true });
    
    // Process dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    for (const [packageName, version] of Object.entries(allDeps || {})) {
      if (typeof version === 'string' && version.startsWith('file:')) {
        // Extract the file path
        const filePath = version.replace('file:', '');
        const absolutePath = path.resolve(projectDir, filePath);
        
        // Create symlink in node_modules
        const linkPath = path.join(nodeModulesDir, packageName);
        
        try {
          // Remove existing symlink/directory if it exists
          try {
            await fs.unlink(linkPath);
          } catch {
            // Ignore if doesn't exist
          }
          
          // Create symlink
          await fs.symlink(absolutePath, linkPath, 'dir');
          console.log(`✓ Linked ${packageName} -> ${filePath}`);
        } catch (error) {
          console.warn(`⚠ Failed to link ${packageName}: ${error}`);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠ Failed to setup local plugins: ${error}`);
  }
}