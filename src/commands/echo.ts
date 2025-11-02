import type { Command, CommandContext } from './types';

/**
 * Echo command - echoes back the arguments
 */
export const echoCommand: Command = {
  name: 'echo',
  description: 'Echo back arguments',
  usage: 'echo [text...]',
  category: 'system',

  execute: ({ terminal, args }: CommandContext) => {
    terminal.writeln(args.join(' '));
  }
};
