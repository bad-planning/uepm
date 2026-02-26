import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandRegistry, Command } from './command-registry';

describe('CLI Framework', () => {
  describe('CommandRegistry', () => {
    let registry: CommandRegistry;

    beforeEach(() => {
      registry = new CommandRegistry();
    });

    describe('command registration', () => {
      it('should register a command successfully', () => {
        const mockCommand: Command = {
          name: 'test',
          description: 'Test command',
          execute: vi.fn().mockResolvedValue(0),
        };

        registry.register(mockCommand);

        expect(registry.has('test')).toBe(true);
        expect(registry.get('test')).toBe(mockCommand);
      });

      it('should throw error when registering duplicate command', () => {
        const mockCommand1: Command = {
          name: 'test',
          description: 'Test command 1',
          execute: vi.fn().mockResolvedValue(0),
        };

        const mockCommand2: Command = {
          name: 'test',
          description: 'Test command 2',
          execute: vi.fn().mockResolvedValue(0),
        };

        registry.register(mockCommand1);

        expect(() => registry.register(mockCommand2)).toThrow(
          "Command 'test' is already registered"
        );
      });

      it('should register multiple different commands', () => {
        const mockCommand1: Command = {
          name: 'init',
          description: 'Initialize project',
          execute: vi.fn().mockResolvedValue(0),
        };

        const mockCommand2: Command = {
          name: 'validate',
          description: 'Validate project',
          execute: vi.fn().mockResolvedValue(0),
        };

        registry.register(mockCommand1);
        registry.register(mockCommand2);

        expect(registry.has('init')).toBe(true);
        expect(registry.has('validate')).toBe(true);
        expect(registry.getNames()).toEqual(['init', 'validate']);
      });
    });

    describe('command lookup', () => {
      it('should return undefined for non-existent command', () => {
        expect(registry.get('nonexistent')).toBeUndefined();
        expect(registry.has('nonexistent')).toBe(false);
      });

      it('should return all registered commands', () => {
        const mockCommand1: Command = {
          name: 'init',
          description: 'Initialize project',
          execute: vi.fn().mockResolvedValue(0),
        };

        const mockCommand2: Command = {
          name: 'validate',
          description: 'Validate project',
          execute: vi.fn().mockResolvedValue(0),
        };

        registry.register(mockCommand1);
        registry.register(mockCommand2);

        const allCommands = registry.getAll();
        expect(allCommands).toHaveLength(2);
        expect(allCommands).toContain(mockCommand1);
        expect(allCommands).toContain(mockCommand2);
      });

      it('should return all command names', () => {
        const mockCommand1: Command = {
          name: 'init',
          description: 'Initialize project',
          execute: vi.fn().mockResolvedValue(0),
        };

        const mockCommand2: Command = {
          name: 'validate',
          description: 'Validate project',
          execute: vi.fn().mockResolvedValue(0),
        };

        registry.register(mockCommand1);
        registry.register(mockCommand2);

        const names = registry.getNames();
        expect(names).toEqual(['init', 'validate']);
      });
    });

    describe('empty registry', () => {
      it('should return empty arrays for empty registry', () => {
        expect(registry.getAll()).toEqual([]);
        expect(registry.getNames()).toEqual([]);
      });
    });
  });

  describe('InitCommand', () => {
    it('should have correct name and description', async () => {
      const { InitCommand } = await import('./init-command');
      const initCommand = new InitCommand();

      expect(initCommand.name).toBe('init');
      expect(initCommand.description).toBe('Initialize Unreal Engine project or plugin for NPM package management');
    });

    it('should mention both project and plugin support in description', async () => {
      const { InitCommand } = await import('./init-command');
      const initCommand = new InitCommand();

      expect(initCommand.description).toContain('project');
      expect(initCommand.description).toContain('plugin');
    });
  });

  describe('help output', () => {
    it('should display help information when requested', () => {
      // This test verifies that the CommandRegistry can provide
      // information needed for help output
      const registry = new CommandRegistry();
      
      const mockCommand: Command = {
        name: 'init',
        description: 'Initialize Unreal Engine project or plugin for NPM package management',
        execute: vi.fn().mockResolvedValue(0),
      };

      registry.register(mockCommand);

      const allCommands = registry.getAll();
      expect(allCommands).toHaveLength(1);
      expect(allCommands[0].name).toBe('init');
      expect(allCommands[0].description).toBe('Initialize Unreal Engine project or plugin for NPM package management');
    });

    it('should list all available commands for help', () => {
      const registry = new CommandRegistry();
      
      const commands: Command[] = [
        {
          name: 'init',
          description: 'Initialize project',
          execute: vi.fn().mockResolvedValue(0),
        },
        {
          name: 'validate',
          description: 'Validate project',
          execute: vi.fn().mockResolvedValue(0),
        },
        {
          name: 'list',
          description: 'List plugins',
          execute: vi.fn().mockResolvedValue(0),
        },
      ];

      commands.forEach(cmd => registry.register(cmd));

      const names = registry.getNames();
      expect(names).toEqual(['init', 'validate', 'list']);

      const allCommands = registry.getAll();
      expect(allCommands).toHaveLength(3);
      allCommands.forEach((cmd, index) => {
        expect(cmd.name).toBe(commands[index].name);
        expect(cmd.description).toBe(commands[index].description);
      });
    });
  });

  describe('invalid command handling', () => {
    it('should provide available commands when invalid command is used', () => {
      const registry = new CommandRegistry();
      
      const mockCommand: Command = {
        name: 'init',
        description: 'Initialize Unreal Engine project or plugin for NPM package management',
        execute: vi.fn().mockResolvedValue(0),
      };

      registry.register(mockCommand);

      // Verify we can get the list of valid commands for error messages
      expect(registry.has('invalid')).toBe(false);
      expect(registry.has('init')).toBe(true);
      
      const availableCommands = registry.getNames();
      expect(availableCommands).toContain('init');
      expect(availableCommands).not.toContain('invalid');
    });

    it('should handle checking for non-existent commands gracefully', () => {
      const registry = new CommandRegistry();
      
      expect(registry.has('nonexistent')).toBe(false);
      expect(registry.get('nonexistent')).toBeUndefined();
      expect(registry.getNames()).toEqual([]);
    });
  });
});
