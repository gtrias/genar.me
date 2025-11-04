import type { Command, CommandContext } from './types';

export const lsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [-la]',
  category: 'system',

  execute: ({ terminal, args, getFileSystem }: CommandContext) => {
    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mls: file system not available\x1b[0m');
      return;
    }

    const showAll = args.includes('-la') || args.includes('-a') || args.includes('-l');
    const items = fs.listDirectory();

    if (showAll) {
      // Detailed listing with permissions, size, date
      terminal.writeln('');
      terminal.writeln('\x1b[90mtotal ' + (items.length * 42) + '\x1b[0m');
      
      // Add . and .. directories
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m  12 dev  dev   4096 Jan  3 2025 \x1b[94m.\x1b[0m');
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m   8 dev  dev   4096 Jan  1 2025 \x1b[94m..\x1b[0m');
      
      // List items with details
      for (const item of items) {
        const date = item.modified.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }).replace(',', '');
        
        if (item.type === 'directory') {
          terminal.writeln(`\x1b[94mdrwxr-xr-x\x1b[0m  3 dev  dev   4096 ${date} \x1b[94m${item.name}\x1b[0m`);
        } else {
          const size = item.size.toString().padStart(5);
          const color = item.permissions.includes('x') ? '\x1b[92m' : '\x1b[90m';
          terminal.writeln(`${color}-${item.permissions.substring(1)}\x1b[0m  1 dev  dev   ${size} ${date} ${color}${item.name}\x1b[0m`);
        }
      }
      terminal.writeln('');
    } else {
      // Simple listing
      const directories = items.filter(item => item.type === 'directory').map(item => `\x1b[94m${item.name}\x1b[0m`);
      const files = items.filter(item => item.type === 'file').map(item => {
        const color = item.permissions.includes('x') ? '\x1b[92m' : '\x1b[0m';
        return `${color}${item.name}\x1b[0m`;
      });
      
      const allItems = [...directories, ...files];
      
      if (allItems.length > 0) {
        terminal.writeln('');
        // Format in columns
        const maxNameLength = Math.max(...allItems.map(item => item.replace(/\x1b\[[0-9;]*m/g, '').length));
        const columnWidth = maxNameLength + 2;
        const columns = Math.floor(80 / columnWidth);
        
        for (let i = 0; i < allItems.length; i += columns) {
          const row = allItems.slice(i, i + columns);
          const paddedRow = row.map(item => {
            const cleanLength = item.replace(/\x1b\[[0-9;]*m/g, '').length;
            const padding = ' '.repeat(columnWidth - cleanLength);
            return item + padding;
          });
          terminal.writeln(paddedRow.join(''));
        }
        terminal.writeln('');
      }
    }
  }
};
