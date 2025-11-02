import type { Command, CommandContext } from './types';

export const hackCommand: Command = {
  name: 'hack',
  description: 'Hack the mainframe',
  category: 'system',

  execute: async ({ terminal, onComplete }: CommandContext) => {
    const steps = [
      { text: '\x1b[92m[*] Initializing hack sequence...\x1b[0m', delay: 500 },
      { text: '\x1b[93m[*] Connecting to mainframe...\x1b[0m', delay: 800 },
      { text: '\x1b[92m[✓] Connection established: 192.168.1.337\x1b[0m', delay: 600 },
      { text: '\x1b[93m[*] Bypassing firewall...\x1b[0m', delay: 1000 },
      { text: '\x1b[92m[✓] Firewall bypassed\x1b[0m', delay: 500 },
      { text: '\x1b[93m[*] Cracking encryption...\x1b[0m', delay: 1200 },
      { text: '\x1b[92m[✓] Encryption key found: 0xDEADBEEF\x1b[0m', delay: 600 },
      { text: '\x1b[93m[*] Accessing database...\x1b[0m', delay: 800 },
      { text: '\x1b[92m[✓] Database unlocked\x1b[0m', delay: 500 },
      { text: '\x1b[93m[*] Downloading files...\x1b[0m', delay: 1000 },
    ];

    terminal.writeln('');

    // Execute hacking steps
    for (const step of steps) {
      terminal.writeln(step.text);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    // Progress bar animation
    terminal.write('\x1b[96m[');
    for (let i = 0; i < 30; i++) {
      terminal.write('█');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    terminal.writeln('] 100%\x1b[0m');

    await new Promise(resolve => setTimeout(resolve, 300));

    terminal.writeln('\x1b[92m[✓] Download complete!\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[95m    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\x1b[0m');
    terminal.writeln('\x1b[95m    █ ACCESS GRANTED █\x1b[0m');
    terminal.writeln('\x1b[95m    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[90m    You\'re in. 😎\x1b[0m');
    terminal.writeln('');

    if (onComplete) onComplete();
  }
};
