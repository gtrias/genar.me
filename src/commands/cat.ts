import type { Command } from './types';

const catCommand: Command = {
  metadata: {
    name: 'cat',
    description: 'Display file contents',
    usage: 'cat [file]',
    getSuggestions: async (args, currentArg, { shell }) =>
      args.length === 0 ? shell.completePath(currentArg, 'file') : [],
  },

  async execute(args, { shell }) {
    if (args.length === 0) {
      return { output: 'cat: missing file operand\n', exitCode: 1 };
    }

    const filename = args[0];
    const file = shell.resolvePath(filename);

    if (!file) {
      return { output: `cat: ${filename}: No such file or directory\n`, exitCode: 1 };
    }

    if (file.type !== 'file') {
      return { output: `cat: ${filename}: Is a directory\n`, exitCode: 1 };
    }

    return { output: (file.content || '') + '\n', exitCode: 0 };
  },
};

export default catCommand;
