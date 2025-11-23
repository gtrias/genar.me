import type { Command } from './types';

const cdCommand: Command = {
  metadata: {
    name: 'cd',
    description: 'Change directory',
    usage: 'cd [directory]',
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
    const target = args[0] || '/';

    if (target === '/') {
      shell.setCurrentPath([]);
      return { output: '', exitCode: 0 };
    }

    if (target === '..') {
      const currentPath = shell.getCurrentPath();
      if (currentPath.length > 0) {
        currentPath.pop();
        shell.setCurrentPath(currentPath);
      }
      return { output: '', exitCode: 0 };
    }

    if (target.startsWith('/')) {
      // Absolute path
      const segments = target.split('/').filter((s) => s);
      shell.setCurrentPath([]);
      for (const segment of segments) {
        const result = await cdCommand.execute([segment], { shell });
        if (result.exitCode !== 0) {
          return result;
        }
      }
      return { output: '', exitCode: 0 };
    }

    // Relative path
    const currentDir = shell.getCurrentDirectory();
    const targetNode = currentDir.children?.get(target);

    if (!targetNode) {
      return { output: `cd: no such file or directory: ${target}\n`, exitCode: 1 };
    }

    if (targetNode.type !== 'directory') {
      return { output: `cd: not a directory: ${target}\n`, exitCode: 1 };
    }

    const currentPath = shell.getCurrentPath();
    currentPath.push(target);
    shell.setCurrentPath(currentPath);
    return { output: '', exitCode: 0 };
  },
};

export default cdCommand;
