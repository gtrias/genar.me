import type { Command } from './types';

const clearCommand: Command = {
  metadata: {
    name: 'clear',
    description: 'Clear the terminal screen',
    usage: 'clear',
  },

  async execute(args, context) {
    // Special handling: uses terminal directly
    if (context.terminal) {
      context.terminal.clear();
    }
    return { output: '\x1b[2J\x1b[H', exitCode: 0 };
  },
};

export default clearCommand;
