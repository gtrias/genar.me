import type { Command, CommandContext } from './types';

export const mkdirCommand: Command = {
  name: 'mkdir',
  description: 'Create directory',
  usage: 'mkdir <directory>',
  category: 'system',

  execute: ({ terminal, args, getFileSystem }: CommandContext) => {
    if (args.length === 0) {
      terminal.writeln('\x1b[91mmkdir: missing directory operand\x1b[0m');
      terminal.writeln('\x1b[90mUsage: mkdir <directory>\x1b[0m');
      return;
    }

    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mmkdir: file system not available\x1b[0m');
      return;
    }

    const dirPath = fs.resolvePath(args[0]);
    
    if (fs.createDirectoryAtPath(dirPath)) {
      // Success - no output needed for successful mkdir
      return;
    }

    terminal.writeln(`\x1b[91mmkdir: ${args[0]}: File already exists or invalid path\x1b[0m`);
  }
};
