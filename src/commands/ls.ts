import type { Command } from './types';

const lsCommand: Command = {
  metadata: {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls [directory]',
    getSuggestions: async (args, currentArg, { shell }) => {
      if (args.length === 0) {
        const dir = shell.getCurrentDirectory();
        return Array.from(dir.children?.values() || [])
          .filter((n) => n.type === 'directory')
          .filter((n) => n.name.startsWith(currentArg))
          .map((n) => n.name);
      }
      return [];
    },
  },

  async execute(args, { shell }) {
    const targetPath = args[0];
    let targetDir = shell.getCurrentDirectory();

    if (targetPath) {
      const resolved = shell.resolvePath(targetPath);
      if (!resolved || resolved.type !== 'directory') {
        return {
          output: `ls: cannot access '${targetPath}': No such file or directory\n`,
          exitCode: 1,
        };
      }
      targetDir = resolved;
    }

    if (!targetDir.children || targetDir.children.size === 0) {
      return { output: '', exitCode: 0 };
    }

    const entries = Array.from(targetDir.children.values())
      .map((node) => {
        const suffix = node.type === 'directory' ? '/' : '';
        return node.name + suffix;
      })
      .sort()
      .join('  ');

    return { output: entries + '\n', exitCode: 0 };
  },
};

export default lsCommand;
