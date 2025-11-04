import type { Command, CommandContext } from './types';

export const touchCommand: Command = {
  name: 'touch',
  description: 'Create empty file',
  usage: 'touch <file>',
  category: 'system',

  execute: ({ terminal, args, getFileSystem }: CommandContext) => {
    if (args.length === 0) {
      terminal.writeln('\x1b[91mtouch: missing file operand\x1b[0m');
      terminal.writeln('\x1b[90mUsage: touch <file>\x1b[0m');
      return;
    }

    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mtouch: file system not available\x1b[0m');
      return;
    }

    const filePath = fs.resolvePath(args[0]);
    
    if (fs.createFileAtPath(filePath, '')) {
      // Success - no output needed for successful touch
      return;
    }

    terminal.writeln(`\x1b[91mtouch: ${args[0]}: File already exists or invalid path\x1b[0m`);
  }
};
