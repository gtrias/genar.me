import type { Command } from './types';

const dateCommand: Command = {
  metadata: {
    name: 'date',
    description: 'Display current date and time',
    usage: 'date',
  },

  async execute() {
    return { output: new Date().toString() + '\n', exitCode: 0 };
  },
};

export default dateCommand;
