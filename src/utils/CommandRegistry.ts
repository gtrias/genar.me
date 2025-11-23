import type { Command, CommandContext, CommandResult } from '../commands/types';

export class CommandRegistry {
  private commands = new Map<string, Command>();

  constructor() {
    this.registerCommands();
  }

  private registerCommands() {
    // Auto-import all command files using Vite's import.meta.glob
    const commandModules = import.meta.glob<{ default: Command }>(
      '../commands/*.ts',
      { eager: true }
    );

    Object.values(commandModules).forEach((module) => {
      const command = module.default;
      if (command && command.metadata) {
        this.commands.set(command.metadata.name, command);
      }
    });

    console.log(`✓ Registered ${this.commands.size} commands`);
  }

  get(commandName: string): Command | undefined {
    return this.commands.get(commandName);
  }

  has(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  async execute(
    commandName: string,
    args: string[],
    context: CommandContext
  ): Promise<CommandResult> {
    const command = this.get(commandName);

    if (!command) {
      return {
        output: `Command not found: ${commandName}. Type 'help' for available commands.\n`,
        exitCode: 1,
      };
    }

    try {
      return await command.execute(args, context);
    } catch (error) {
      return {
        output: `Error executing ${commandName}: ${error}\n`,
        exitCode: 1,
      };
    }
  }

  // For future auto-completion
  async getSuggestions(
    commandName: string,
    args: string[],
    currentArg: string,
    context: CommandContext
  ): Promise<string[]> {
    const command = this.get(commandName);

    if (!command?.metadata.getSuggestions) {
      return [];
    }

    return command.metadata.getSuggestions(args, currentArg, context);
  }
}
