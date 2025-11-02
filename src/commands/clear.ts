import type { Command, CommandContext } from './types';

/**
 * Clear command - clears the terminal screen
 */
export const clearCommand: Command = {
  name: 'clear',
  description: 'Clear terminal screen',
  category: 'system',

  execute: ({ terminal }: CommandContext) => {
    terminal.clear();
  }
};
