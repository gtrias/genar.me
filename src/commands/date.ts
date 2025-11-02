import type { Command, CommandContext } from './types';

/**
 * Date command - displays current date and time
 */
export const dateCommand: Command = {
  name: 'date',
  description: 'Show current date and time',
  category: 'system',

  execute: ({ terminal }: CommandContext) => {
    const now = new Date();
    terminal.writeln('\x1b[96m' + now.toString() + '\x1b[0m');
  }
};
