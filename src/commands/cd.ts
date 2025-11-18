import type { Command, CommandContext } from './types';

export const cdCommand: Command = {
  name: 'cd',
  description: 'Change current directory',
  usage: 'cd [directory]',
  category: 'system',

  execute: ({ terminal, args, getFileSystem, shell }: CommandContext) => {
    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mcd: file system not available\x1b[0m');
      return;
    }

    // Default to home directory if no argument
    const targetPath = args.length > 0 ? args[0] : (shell?.getEnvironment().get('HOME') || '/home/guest');
    
    // Expand ~ to home directory
    const expandedPath = targetPath.startsWith('~') 
      ? targetPath.replace('~', shell?.getEnvironment().get('HOME') || '/home/guest')
      : targetPath;
    
    const resolvedPath = fs.resolvePath(expandedPath);

    if (fs.setCurrentPath(resolvedPath)) {
      // Update shell runtime CWD
      if (shell) {
        const newPath = fs.getCurrentPath();
        shell.setCWD(newPath);
      }
      // Success - no output needed for successful cd
      return;
    }

    terminal.writeln(`\x1b[91mcd: ${targetPath}: No such file or directory\x1b[0m`);
  }
};
