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
