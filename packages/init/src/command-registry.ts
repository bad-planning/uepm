/**
 * Command interface that all commands must implement
 */
export interface Command {
  name: string;
  description: string;
  execute(args: string[], options: Record<string, any>): Promise<number>;
}

/**
 * Registry for managing CLI commands
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  /**
   * Register a command
   * @param command - The command to register
   */
  register(command: Command): void {
    if (this.commands.has(command.name)) {
      throw new Error(`Command '${command.name}' is already registered`);
    }
    this.commands.set(command.name, command);
  }

  /**
   * Get a command by name
   * @param name - The command name
   * @returns The command or undefined if not found
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Check if a command exists
   * @param name - The command name
   * @returns True if the command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Get all registered commands
   * @returns Array of all commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get all command names
   * @returns Array of command names
   */
  getNames(): string[] {
    return Array.from(this.commands.keys());
  }
}
