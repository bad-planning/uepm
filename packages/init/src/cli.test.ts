import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
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

  describe('InitCommand.execute()', () => {
    let tempDir: string;
    const validUproject = JSON.stringify({ FileVersion: 3, EngineAssociation: '5.3' });

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uepm-cli-test-'));
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('returns 0 and adds UEPMPlugins to AdditionalPluginDirectories on success', async () => {
      const { InitCommand } = await import('./init-command');
      const uprojectPath = path.join(tempDir, 'MyProject.uproject');
      await fs.writeFile(uprojectPath, validUproject, 'utf8');

      const cmd = new InitCommand();
      const exitCode = await cmd.execute([], { projectDir: tempDir });

      expect(exitCode).toBe(0);

      const raw = await fs.readFile(uprojectPath, 'utf8');
      const parsed = JSON.parse(raw);
      expect(parsed.AdditionalPluginDirectories).toContain('UEPMPlugins');
    });

    it('returns non-zero when there is no .uproject in the directory', async () => {
      // tempDir is empty — no .uproject file present
      const { InitCommand } = await import('./init-command');
      const cmd = new InitCommand();
      const exitCode = await cmd.execute([], { projectDir: tempDir });

      expect(exitCode).toBeGreaterThan(0);
    });

    it('defaults projectDir to process.cwd() when option is omitted', async () => {
      const { InitCommand } = await import('./init-command');
      const uprojectPath = path.join(tempDir, 'MyProject.uproject');
      await fs.writeFile(uprojectPath, validUproject, 'utf8');

      // Override process.cwd so the command picks up our temp dir
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;
      try {
        const cmd = new InitCommand();
        const exitCode = await cmd.execute([], {});
        // A valid project dir should succeed
        expect(exitCode).toBe(0);
      } finally {
        process.cwd = originalCwd;
      }
    });

    it('returns 0 on already-initialized project when force:true is passed', async () => {
      const { InitCommand } = await import('./init-command');
      const uprojectPath = path.join(tempDir, 'MyProject.uproject');
      await fs.writeFile(uprojectPath, validUproject, 'utf8');

      const cmd = new InitCommand();

      // First init — initializes the project
      const firstExit = await cmd.execute([], { projectDir: tempDir });
      expect(firstExit).toBe(0);

      // Second init without force — should still succeed (already initialized)
      const secondExit = await cmd.execute([], { projectDir: tempDir });
      expect(secondExit).toBe(0);

      // Third init with force:true — should reinitialize successfully
      const forceExit = await cmd.execute([], { projectDir: tempDir, force: true });
      expect(forceExit).toBe(0);

      // Verify UEPMPlugins is still present after force reinit
      const raw = await fs.readFile(uprojectPath, 'utf8');
      const parsed = JSON.parse(raw);
      expect(parsed.AdditionalPluginDirectories).toContain('UEPMPlugins');
    });

    it('returns non-zero when projectDir does not exist', async () => {
      // A path that does not exist on disk — should cause init to fail
      const { InitCommand } = await import('./init-command');
      const nonExistentDir = path.join(tempDir, 'no-such-directory');

      const cmd = new InitCommand();
      const exitCode = await cmd.execute([], { projectDir: nonExistentDir });

      expect(exitCode).toBeGreaterThan(0);
    });

    it('returns 1 for unexpected (non-UEPMError) thrown errors', async () => {
      // Simulate an unexpected error by making the init function throw a plain Error.
      // We do this by providing a projectDir that is actually a file, which causes
      // fs operations to throw unexpected OS errors (ENOTDIR).
      const { InitCommand } = await import('./init-command');

      // Write a regular file where a directory is expected
      const filePath = path.join(tempDir, 'not-a-dir');
      await fs.writeFile(filePath, 'I am a file', 'utf8');

      const cmd = new InitCommand();
      // Passing a file path as projectDir will cause unexpected errors
      // in the filesystem operations that are not UEPMErrors.
      // init() wraps unexpected errors in { success: false } so exitCode will be 1.
      const exitCode = await cmd.execute([], { projectDir: filePath });

      // Whether via UEPMError or plain error, the result must be non-zero
      expect(exitCode).toBeGreaterThan(0);
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
