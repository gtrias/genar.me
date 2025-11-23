import type { Command } from './types';

const catCommand: Command = {
  metadata: {
    name: 'cat',
    description: 'Display file contents',
    usage: 'cat [file]',
    getSuggestions: async (args, currentArg, { shell }) => {
      if (args.length === 0) {
        const dir = shell.getCurrentDirectory();
        return Array.from(dir.children?.values() || [])
          .filter((n) => n.type === 'file')
          .filter((n) => n.name.startsWith(currentArg))
          .map((n) => n.name);
      }
      return [];
    },
  },

  async execute(args, { shell }) {
    if (args.length === 0) {
      return { output: 'cat: missing file operand\n', exitCode: 1 };
    }

    const filename = args[0];
    const currentDir = shell.getCurrentDirectory();
    const file = currentDir.children?.get(filename);

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
