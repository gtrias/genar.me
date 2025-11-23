import type { Command } from './types';

const pwdCommand: Command = {
  metadata: {
    name: 'pwd',
    description: 'Print working directory',
    usage: 'pwd',
  },

  async execute(args, { shell }) {
    const currentPath = shell.getCurrentPath();
    const path = currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
    return { output: path + '\n', exitCode: 0 };
  },
};

export default pwdCommand;
