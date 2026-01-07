import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  findPluginFile,
  readPlugin,
  extractPluginMetadata,
  writePlugin,
  PluginMetadata,
} from './uplugin-manager';
import { upluginArbitrary } from './test-generators';
import { UPluginFile } from './types';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('UPlugin Manager', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-uplugin-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('Unit Tests', () => {
    it('should find a single .uplugin file', async () => {
      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      const upluginContent = { FileVersion: 3, FriendlyName: 'Test Plugin' };
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent));

      const result = await findPluginFile(tempDir);

      expect(result).toBe(upluginPath);
    });

    it('should throw error when no .uplugin file exists', async () => {
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}');

      await expect(findPluginFile(tempDir)).rejects.toThrow('No .uplugin file found');
    });

    it('should throw error when multiple .uplugin files exist', async () => {
      await fs.writeFile(path.join(tempDir, 'Plugin1.uplugin'), JSON.stringify({ FileVersion: 3 }));
      await fs.writeFile(path.join(tempDir, 'Plugin2.uplugin'), JSON.stringify({ FileVersion: 3 }));

      await expect(findPluginFile(tempDir)).rejects.toThrow('Multiple .uplugin files found');
    });

    it('should read and parse a valid .uplugin file', async () => {
      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      const upluginContent = {
        FileVersion: 3,
        Version: 1,
        VersionName: '1.0.0',
        FriendlyName: 'Test Plugin',
        Description: 'A test plugin',
        CreatedBy: 'Test Author',
        DocsURL: 'https://example.com/docs',
      };
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent));

      const result = await readPlugin(upluginPath);

      expect(result).toEqual(upluginContent);
    });

    it('should throw error for invalid JSON in .uplugin file', async () => {
      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      await fs.writeFile(upluginPath, '{ invalid json }');

      await expect(readPlugin(upluginPath)).rejects.toThrow('Failed to parse JSON file');
    });

    it('should extract metadata from .uplugin file', async () => {
      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      const upluginContent = {
        FileVersion: 3,
        Version: 1,
        VersionName: '1.2.3',
        FriendlyName: 'Test Plugin',
        Description: 'A test plugin for testing',
        CreatedBy: 'Test Author',
        DocsURL: 'https://example.com/docs',
        EngineVersion: '5.3',
      };
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent));

      const result = await extractPluginMetadata(upluginPath);

      expect(result).toEqual({
        name: 'TestPlugin',
        version: '1.2.3',
        friendlyName: 'Test Plugin',
        description: 'A test plugin for testing',
        author: 'Test Author',
        homepage: 'https://example.com/docs',
        engineVersion: '5.3',
      });
    });

    it('should handle missing optional metadata fields', async () => {
      const upluginPath = path.join(tempDir, 'MinimalPlugin.uplugin');
      const upluginContent = {
        FileVersion: 3,
      };
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent));

      const result = await extractPluginMetadata(upluginPath);

      expect(result.name).toBe('MinimalPlugin');
      expect(result.version).toBe('1.0.0'); // Default version
      expect(result.friendlyName).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.author).toBeUndefined();
      expect(result.homepage).toBeUndefined();
      expect(result.engineVersion).toBeUndefined();
    });

    it('should format numeric version as semver', async () => {
      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      const upluginContent = {
        FileVersion: 3,
        Version: 2, // Numeric version without VersionName
      };
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent));

      const result = await extractPluginMetadata(upluginPath);

      expect(result.version).toBe('2.0.0');
    });

    it('should prefer VersionName over Version', async () => {
      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      const upluginContent = {
        FileVersion: 3,
        Version: 1,
        VersionName: '2.1.0', // Should use this instead of Version
      };
      await fs.writeFile(upluginPath, JSON.stringify(upluginContent));

      const result = await extractPluginMetadata(upluginPath);

      expect(result.version).toBe('2.1.0');
    });

    it('should write .uplugin file with proper formatting', async () => {
      const upluginPath = path.join(tempDir, 'TestPlugin.uplugin');
      const upluginContent: UPluginFile = {
        FileVersion: 3,
        Version: 1,
        FriendlyName: 'Test Plugin',
      };

      await writePlugin(upluginPath, upluginContent);

      const writtenContent = await fs.readFile(upluginPath, 'utf-8');
      const parsed = JSON.parse(writtenContent);
      
      expect(parsed).toEqual(upluginContent);
      expect(writtenContent).toMatch(/\n$/); // Should end with newline
      expect(writtenContent).toContain('  '); // Should have 2-space indentation
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: init-plugin-support, Property 15: Uplugin metadata round trip
     * Validates: Requirements 5.1, 5.2, 5.3, 5.4
     * 
     * For any valid uplugin file, metadata extraction should correctly parse and utilize 
     * all available fields (FriendlyName, Version, CreatedBy, DocsURL)
     */
    it('Property 15: Uplugin metadata round trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          upluginArbitrary(),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          async (upluginData, pluginName) => {
            // Create a unique temp directory for this iteration
            const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-prop15-test-'));
            
            try {
              // Write the uplugin file
              const upluginPath = path.join(testDir, `${pluginName}.uplugin`);
              await fs.writeFile(upluginPath, JSON.stringify(upluginData, null, 2));
              
              // Extract metadata
              const metadata = await extractPluginMetadata(upluginPath);
              
              // Verify plugin name extraction
              expect(metadata.name).toBe(pluginName);
              
              // Verify version extraction logic
              if (upluginData.VersionName) {
                expect(metadata.version).toBe(upluginData.VersionName);
              } else if (upluginData.Version !== undefined) {
                const expectedVersion = /^\d+$/.test(upluginData.Version.toString()) 
                  ? `${upluginData.Version}.0.0` 
                  : upluginData.Version.toString();
                expect(metadata.version).toBe(expectedVersion);
              } else {
                expect(metadata.version).toBe('1.0.0'); // Default version
              }
              
              // Verify optional field extraction
              expect(metadata.friendlyName).toBe(upluginData.FriendlyName);
              expect(metadata.description).toBe(upluginData.Description);
              expect(metadata.author).toBe(upluginData.CreatedBy);
              expect(metadata.homepage).toBe(upluginData.DocsURL);
              expect(metadata.engineVersion).toBe(upluginData.EngineVersion);
              
              // Verify that undefined fields are preserved as undefined
              if (upluginData.FriendlyName === undefined) {
                expect(metadata.friendlyName).toBeUndefined();
              }
              if (upluginData.Description === undefined) {
                expect(metadata.description).toBeUndefined();
              }
              if (upluginData.CreatedBy === undefined) {
                expect(metadata.author).toBeUndefined();
              }
              if (upluginData.DocsURL === undefined) {
                expect(metadata.homepage).toBeUndefined();
              }
              if (upluginData.EngineVersion === undefined) {
                expect(metadata.engineVersion).toBeUndefined();
              }
              
            } finally {
              // Clean up this iteration's temp directory
              await fs.rm(testDir, { recursive: true, force: true });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: init-plugin-support, Property 16: Invalid JSON error handling
     * Validates: Requirements 5.5
     * 
     * For any uplugin file with invalid JSON, the init command should display 
     * appropriate error messages with file location information
     */
    it('Property 16: Invalid JSON error handling', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          fc.oneof(
            // Various types of invalid JSON that will fail JSON.parse()
            fc.constant('{ invalid json }'),
            fc.constant('{ "FileVersion": 3, }'), // Trailing comma
            fc.constant('{ "FileVersion": 3 "Version": 1 }'), // Missing comma
            fc.constant('{ FileVersion: 3 }'), // Unquoted key
            fc.constant('{ "FileVersion": }'), // Missing value
            fc.constant('{ "FileVersion": 3, "Version": }'), // Missing value
            fc.constant(''), // Empty string
            fc.constant('{'), // Incomplete object
            fc.constant('{"FileVersion": 3'), // Incomplete object
            fc.constant('undefined'), // Invalid literal
            fc.constant('NaN'), // Invalid literal
            fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
              try {
                JSON.parse(s);
                return false; // Skip valid JSON
              } catch {
                return true; // Keep invalid JSON
              }
            })
          ),
          async (pluginName, invalidJson) => {
            // Create a unique temp directory for this iteration
            const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-prop16-test-'));
            
            try {
              // Write the invalid JSON to uplugin file
              const upluginPath = path.join(testDir, `${pluginName}.uplugin`);
              await fs.writeFile(upluginPath, invalidJson);
              
              // Attempt to read the plugin - should throw an error
              let thrownError: any = null;
              try {
                await readPlugin(upluginPath);
              } catch (error) {
                thrownError = error;
              }
              
              // Verify that an error was thrown
              expect(thrownError).toBeDefined();
              expect(thrownError).toBeInstanceOf(Error);
              
              // Verify error message contains file path information
              expect(thrownError.message).toContain(upluginPath);
              
              // Should be a JSON parse error (not schema validation error)
              expect(thrownError.code).toBe('JSON_PARSE_ERROR');
              expect(thrownError.message).toContain('Failed to parse JSON file');
              
              // Test extractPluginMetadata as well - should also throw
              let metadataError: any = null;
              try {
                await extractPluginMetadata(upluginPath);
              } catch (error) {
                metadataError = error;
              }
              
              expect(metadataError).toBeDefined();
              expect(metadataError).toBeInstanceOf(Error);
              expect(metadataError.message).toContain(upluginPath);
              expect(metadataError.code).toBe('JSON_PARSE_ERROR');
              
            } finally {
              // Clean up this iteration's temp directory
              await fs.rm(testDir, { recursive: true, force: true });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});