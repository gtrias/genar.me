import type { Command } from './types';

const cdCommand: Command = {
  metadata: {
    name: 'cd',
    description: 'Change directory',
    usage: 'cd [directory]',
    getSuggestions: async (args, currentArg, { shell }) =>
      args.length === 0 ? shell.completePath(currentArg, 'directory') : [],
  },

  async execute(args, { shell }) {
    const target = args[0] || '/';
    const node = shell.resolvePath(target);

    if (!node) {
      return { output: `cd: no such file or directory: ${target}\n`, exitCode: 1 };
    }
    if (node.type !== 'directory') {
      return { output: `cd: not a directory: ${target}\n`, exitCode: 1 };
    }

    shell.setCurrentPath(shell.normalizePath(target));
    return { output: '', exitCode: 0 };
  },
};

export default cdCommand;
