import type { Command, CommandContext } from './types';

export const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print working directory',
  usage: 'pwd',
  category: 'system',

  execute: ({ terminal, getFileSystem }: CommandContext) => {
    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mpwd: file system not available\x1b[0m');
      return;
    }

    const currentPath = fs.getCurrentPath();
    terminal.writeln(currentPath);
  }
};
