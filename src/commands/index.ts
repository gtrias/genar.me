/**
 * Command Registry
 * Automatically loads and registers all available commands
 *
 * To add a new command:
 * 1. Create a new file in src/commands/ (e.g., mycommand.ts)
 * 2. Export a command object following the Command interface
 * 3. Import and register it here
 *
 * To remove a command:
 * 1. Simply remove the import and registration from this file
 */

import type { Command } from './types';

// Portfolio commands
import { helpCommand } from './help';
import { aboutCommand } from './about';
import { skillsCommand } from './skills';
import { experienceCommand } from './experience';

// System commands
import { clearCommand } from './clear';
import { echoCommand } from './echo';
import { dateCommand } from './date';

/**
 * All registered commands
 * Commands are automatically available in the terminal
 */
const commands: Command[] = [
  // Portfolio
  helpCommand,
  aboutCommand,
  skillsCommand,
  experienceCommand,

  // System
  clearCommand,
  echoCommand,
  dateCommand,
];

/**
 * Get all registered commands as a Map for quick lookup
 */
export function getCommandRegistry(): Map<string, Command> {
  const registry = new Map<string, Command>();

  for (const command of commands) {
    registry.set(command.name, command);
  }

  return registry;
}

/**
 * Get list of all command names (useful for autocomplete)
 */
export function getCommandNames(): string[] {
  return commands.map(cmd => cmd.name);
}

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: 'portfolio' | 'system'): Command[] {
  return commands.filter(cmd => cmd.category === category);
}

/**
 * Export individual commands for direct access if needed
 */
export {
  // Portfolio
  helpCommand,
  aboutCommand,
  skillsCommand,
  experienceCommand,

  // System
  clearCommand,
  echoCommand,
  dateCommand,
};
