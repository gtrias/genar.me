import type { Command } from './types';

const whoamiCommand: Command = {
  metadata: {
    name: 'whoami',
    description: 'Display current user',
    usage: 'whoami',
  },

  async execute() {
    return { output: 'genar\n', exitCode: 0 };
  },
};

export default whoamiCommand;
