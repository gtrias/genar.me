import type { Command, CommandContext } from './types';

export const coffeeCommand: Command = {
  name: 'coffee',
  description: 'Grab a cup of coffee',
  category: 'system',

  execute: ({ terminal }: CommandContext) => {
    terminal.writeln('');
    terminal.writeln('\x1b[93m        (  )   (   )  )\x1b[0m');
    terminal.writeln('\x1b[93m         ) (   )  (  (\x1b[0m');
    terminal.writeln('\x1b[93m         ( )  (    ) )\x1b[0m');
    terminal.writeln('\x1b[93m         _____________\x1b[0m');
    terminal.writeln('\x1b[93m        ╱             ╲\x1b[0m');
    terminal.writeln('\x1b[97m       ╱               ╲\x1b[0m');
    terminal.writeln('\x1b[97m      ╱                 ╲\x1b[0m');
    terminal.writeln('\x1b[97m     │  \x1b[38;5;94m▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[97m  │\x1b[0m');
    terminal.writeln('\x1b[97m     │  \x1b[38;5;94m▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[97m  │\x1b[0m');
    terminal.writeln('\x1b[97m     │  \x1b[38;5;94m▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[97m  │\x1b[0m');
    terminal.writeln('\x1b[97m     │                 │\x1b[0m');
    terminal.writeln('\x1b[97m      ╲               ╱\x1b[0m');
    terminal.writeln('\x1b[97m       ╲_____________╱\x1b[0m');
    terminal.writeln('\x1b[90m        ───────────────\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[96m    ☕ Fresh brew ready!\x1b[0m');
    terminal.writeln('');

    const quotes = [
      'Code is best served with coffee.',
      'Debugging powered by caffeine.',
      'Java? I prefer JavaScript with coffee.',
      'Coffee: Turning code into reality since forever.',
      'First coffee, then code.',
      '// TODO: Add more coffee'
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    terminal.writeln(`\x1b[90m    "${randomQuote}"\x1b[0m`);
    terminal.writeln('');
  }
};
