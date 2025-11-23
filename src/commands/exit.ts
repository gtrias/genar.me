import type { Command } from './types';

const exitCommand: Command = {
  metadata: {
    name: 'exit',
    description: 'Exit the terminal',
    usage: 'exit',
  },

  async execute() {
    return { output: 'Goodbye!\n', exitCode: 0 };
  },
};

export default exitCommand;
