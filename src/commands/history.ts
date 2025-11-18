import type { Command, CommandContext } from './types';

export const historyCommand: Command = {
  name: 'history',
  description: 'Show command history',
  usage: 'history',
  category: 'system',

  execute: ({ terminal, shell }: CommandContext) => {
    if (!shell) {
      terminal.writeln('\x1b[91mhistory: shell runtime not available\x1b[0m');
      return;
    }

    const history = shell.getHistory();
    
    if (history.length === 0) {
      terminal.writeln('No command history');
      return;
    }

    terminal.writeln('');
    history.forEach((cmd, index) => {
      const num = (index + 1).toString().padStart(4);
      terminal.writeln(`  ${num}  ${cmd}`);
    });
    terminal.writeln('');
  }
};

