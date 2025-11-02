import type { Command, CommandContext } from './types';

/**
 * Help command - displays all available commands
 */
export const helpCommand: Command = {
  name: 'help',
  description: 'Show all available commands',
  category: 'system',

  execute: ({ terminal }: CommandContext) => {
    terminal.writeln('\x1b[96m╔═══════════════════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[96m║              AVAILABLE COMMANDS                           ║\x1b[0m');
    terminal.writeln('\x1b[96m╚═══════════════════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[92m  Portfolio & Information:\x1b[0m');
    terminal.writeln('    \x1b[93mabout\x1b[0m       - Learn about me');
    terminal.writeln('    \x1b[93mskills\x1b[0m      - View my technical skills');
    terminal.writeln('    \x1b[93mexperience\x1b[0m  - See my work history');
    terminal.writeln('');
    terminal.writeln('\x1b[92m  System Commands:\x1b[0m');
    terminal.writeln('    \x1b[93mhelp\x1b[0m        - Show this help message');
    terminal.writeln('    \x1b[93mclear\x1b[0m       - Clear terminal screen');
    terminal.writeln('    \x1b[93mecho\x1b[0m        - Echo back arguments');
    terminal.writeln('    \x1b[93mdate\x1b[0m        - Show current date and time');
    terminal.writeln('');
    terminal.writeln('\x1b[90m  Navigation Tips:\x1b[0m');
    terminal.writeln('    • Use arrow keys to navigate command history');
    terminal.writeln('    • Use Tab for autocomplete');
    terminal.writeln('');
  }
};
