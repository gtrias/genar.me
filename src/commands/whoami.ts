import type { Command, CommandContext } from './types';

export const whoamiCommand: Command = {
  name: 'whoami',
  description: 'Display current user',
  category: 'system',

  execute: ({ terminal }: CommandContext) => {
    const responses = [
      {
        user: 'root',
        message: 'You\'re the superuser! Unlimited power! 💪',
        color: '\x1b[91m' // Red
      },
      {
        user: 'neo',
        message: 'The One. The Matrix has you...',
        color: '\x1b[92m' // Green
      },
      {
        user: 'hacker',
        message: 'Elite level: 1337 🔐',
        color: '\x1b[95m' // Magenta
      },
      {
        user: 'developer',
        message: 'Turning caffeine into code ☕',
        color: '\x1b[96m' // Cyan
      },
      {
        user: 'visitor',
        message: 'Welcome to my digital domain! 👋',
        color: '\x1b[93m' // Yellow
      },
      {
        user: 'codewizard',
        message: 'Master of the arcane arts of programming 🧙',
        color: '\x1b[94m' // Blue
      }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    terminal.writeln('');
    terminal.writeln(`${response.color}${response.user}\x1b[0m`);
    terminal.writeln('');
    terminal.writeln(`\x1b[90m${response.message}\x1b[0m`);
    terminal.writeln('');

    // Add some flavor text
    const flavorTexts = [
      'uid=1337(awesome) gid=1337(awesome) groups=1337(awesome),100(users)',
      'Security clearance: MAXIMUM',
      'Access level: Unlimited',
      'Privileges: All of them',
      'Status: Authenticated and authorized'
    ];

    const flavor = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];
    terminal.writeln(`\x1b[90m${flavor}\x1b[0m`);
    terminal.writeln('');
  }
};
