import type { Command, CommandContext } from './types';

export const catCommand: Command = {
  name: 'cat',
  description: 'Read and display file contents',
  usage: 'cat <file>',
  category: 'system',

  execute: ({ terminal, args, getFileSystem }: CommandContext) => {
    if (args.length === 0) {
      terminal.writeln('\x1b[91mcat: missing file operand\x1b[0m');
      terminal.writeln('\x1b[90mUsage: cat <file>\x1b[0m');
      return;
    }

    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mcat: file system not available\x1b[0m');
      return;
    }

    const filePath = fs.resolvePath(args[0]);
    const content = fs.readFile(filePath);

    if (content === null) {
      terminal.writeln(`\x1b[91mcat: ${args[0]}: No such file or directory\x1b[0m`);
      return;
    }

    // Display file content
    terminal.writeln(content);
  }
};
