import type { Command, CommandContext } from './types';

export const matrixCommand: Command = {
  name: 'matrix',
  description: 'Enter the Matrix',
  category: 'system',

  execute: async ({ terminal, onComplete }: CommandContext) => {
    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01234567890';
    const columns = 80;
    const rows = 15;

    // Create initial matrix display
    terminal.writeln('');
    terminal.write('\x1b[92m'); // Green color

    // Animate for a few frames
    for (let frame = 0; frame < 12; frame++) {
      let output = '';
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          // Random chance to show a character
          if (Math.random() > 0.85) {
            output += chars[Math.floor(Math.random() * chars.length)];
          } else {
            output += ' ';
          }
        }
        output += '\r\n';
      }

      terminal.write('\x1b[H'); // Move cursor to home
      terminal.write(output);

      // Wait between frames
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clear and show final message
    terminal.write('\x1b[0m'); // Reset color
    terminal.clear();
    terminal.writeln('');
    terminal.writeln('\x1b[92m    ╔══════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[92m    ║                                      ║\x1b[0m');
    terminal.writeln('\x1b[92m    ║        WELCOME TO THE MATRIX         ║\x1b[0m');
    terminal.writeln('\x1b[92m    ║                                      ║\x1b[0m');
    terminal.writeln('\x1b[92m    ║      \x1b[97mFollow the white rabbit...\x1b[92m      ║\x1b[0m');
    terminal.writeln('\x1b[92m    ║                                      ║\x1b[0m');
    terminal.writeln('\x1b[92m    ╚══════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[90m    "There is no spoon."\x1b[0m');
    terminal.writeln('');

    if (onComplete) onComplete();
  }
};
