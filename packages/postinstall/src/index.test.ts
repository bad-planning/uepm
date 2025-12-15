import { describe, it, expect } from 'vitest';
import { setupPlugins, validatePlugins } from './index';

describe('Postinstall Package', () => {
  it('should export setupPlugins function', () => {
    expect(typeof setupPlugins).toBe('function');
  });

  it('should export validatePlugins function', () => {
    expect(typeof validatePlugins).toBe('function');
  });
});