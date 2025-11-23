import type { Command } from './types';

const echoCommand: Command = {
  metadata: {
    name: 'echo',
    description: 'Print text to terminal',
    usage: 'echo [text...]',
  },

  async execute(args) {
    return { output: args.join(' ') + '\n', exitCode: 0 };
  },
};

export default echoCommand;
