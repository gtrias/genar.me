/**
 * Command execution logic
 * Handles command execution, validation, and autocomplete
 */

import type { TerminalInterface } from './TerminalInterface';
import type { Command } from '../../commands/types';
import { FileSystemManager } from '../filesystem';

export class CommandHandler {
  constructor(
    private commandRegistry: Map<string, Command>,
    private terminal: TerminalInterface,
    private fileSystemManager?: FileSystemManager
  ) {}

  /**
   * Execute a command with given arguments
   */
  async execute(command: string, args: string[]): Promise<void> {
    const cmd = this.commandRegistry.get(command);
    if (cmd) {
      try {
        const context = {
          terminal: this.terminal,
          args,
          onComplete: () => {
            // Command completion handled by InputManager
          },
          getFileSystem: () => this.fileSystemManager?.getFileSystem()
        };

        const result = cmd.execute(context);

        if (result instanceof Promise) {
          await result.catch(err => {
            console.error(`Error executing command ${command}:`, err);
            this.terminal.writeln('\x1b[91mError executing command\x1b[0m');
          });
        }
      } catch (err) {
        console.error(`Error executing command ${command}:`, err);
        this.terminal.writeln('\x1b[91mError executing command\x1b[0m');
      }
    } else {
      this.terminal.writeln(`\x1b[91mCommand not found: ${command}\x1b[0m`);
      this.terminal.writeln('\x1b[90mType "help" for available commands.\x1b[0m');
    }
  }

  /**
   * Get autocomplete suggestions for input
   */
  autocomplete(input: string): string[] {
    if (!input.trim()) {
      return [];
    }

    const matches = Array.from(this.commandRegistry.keys())
      .filter(cmd => cmd.startsWith(input.trim()));
    
    return matches;
  }

  /**
   * Get all available command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commandRegistry.keys());
  }

  /**
   * Get command by name
   */
  getCommand(name: string): Command | undefined {
    return this.commandRegistry.get(name);
  }

  /**
   * Check if command exists
   */
  hasCommand(name: string): boolean {
    return this.commandRegistry.has(name);
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(category: 'portfolio' | 'system'): Command[] {
    return Array.from(this.commandRegistry.values())
      .filter(cmd => cmd.category === category);
  }

  /**
   * Update command registry
   */
  updateRegistry(registry: Map<string, Command>): void {
    this.commandRegistry = registry;
  }

  /**
   * Add a single command to registry
   */
  addCommand(command: Command): void {
    this.commandRegistry.set(command.name, command);
  }

  /**
   * Remove a command from registry
   */
  removeCommand(name: string): boolean {
    return this.commandRegistry.delete(name);
  }
}
