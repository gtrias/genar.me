import type { Command, CommandContext } from './types';

export const cdCommand: Command = {
  name: 'cd',
  description: 'Change current directory',
  usage: 'cd [directory]',
  category: 'system',

  execute: ({ terminal, args, getFileSystem }: CommandContext) => {
    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mcd: file system not available\x1b[0m');
      return;
    }

    const targetPath = args.length > 0 ? args[0] : '/home/dev';
    const resolvedPath = fs.resolvePath(targetPath);

    if (fs.setCurrentPath(resolvedPath)) {
      // Success - no output needed for successful cd
      return;
    }

    terminal.writeln(`\x1b[91mcd: ${targetPath}: No such file or directory\x1b[0m`);
  }
};
