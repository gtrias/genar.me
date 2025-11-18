import type { Command, CommandContext } from './types';

export const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print working directory',
  usage: 'pwd',
  category: 'system',

  execute: ({ terminal, getFileSystem, shell, getCWD }: CommandContext) => {
    // Prefer ShellRuntime CWD if available
    if (shell && getCWD) {
      terminal.writeln(getCWD());
      return;
    }

    // Fallback to filesystem
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mpwd: file system not available\x1b[0m');
      return;
    }

    const currentPath = fs.getCurrentPath();
    terminal.writeln(currentPath);
  }
};
