import type { Command, CommandContext } from './types';

/**
 * Skills command - displays technical skills in ASCII table format
 */
export const skillsCommand: Command = {
  name: 'skills',
  description: 'View my technical skills',
  category: 'portfolio',

  execute: ({ terminal }: CommandContext) => {
    terminal.writeln('\x1b[96m╔═══════════════════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[96m║                   TECHNICAL SKILLS                        ║\x1b[0m');
    terminal.writeln('\x1b[96m╚═══════════════════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[93m┌────────────────────────┬──────────────────────────────────┐\x1b[0m');
    terminal.writeln('\x1b[93m│ Category               │ Technologies                     │\x1b[0m');
    terminal.writeln('\x1b[93m├────────────────────────┼──────────────────────────────────┤\x1b[0m');
    terminal.writeln('\x1b[92m│ Frontend               │\x1b[0m React, Vue.js, TypeScript      \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[92m│                        │\x1b[0m Next.js, Astro, Tailwind CSS   \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[93m├────────────────────────┼──────────────────────────────────┤\x1b[0m');
    terminal.writeln('\x1b[92m│ Backend                │\x1b[0m Node.js, Python, Go            \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[92m│                        │\x1b[0m Express, FastAPI, PostgreSQL   \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[93m├────────────────────────┼──────────────────────────────────┤\x1b[0m');
    terminal.writeln('\x1b[92m│ DevOps & Tools         │\x1b[0m Docker, Kubernetes, AWS        \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[92m│                        │\x1b[0m Git, CI/CD, Terraform          \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[93m├────────────────────────┼──────────────────────────────────┤\x1b[0m');
    terminal.writeln('\x1b[92m│ Databases              │\x1b[0m PostgreSQL, MongoDB, Redis     \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[92m│                        │\x1b[0m GraphQL, REST APIs             \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[93m├────────────────────────┼──────────────────────────────────┤\x1b[0m');
    terminal.writeln('\x1b[92m│ Other                  │\x1b[0m WebSockets, WebAssembly        \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[92m│                        │\x1b[0m Testing, Agile, TDD            \x1b[93m│\x1b[0m');
    terminal.writeln('\x1b[93m└────────────────────────┴──────────────────────────────────┘\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[95m★ Proficiency Level: Expert ████████░░ (80%)\x1b[0m');
    terminal.writeln('');
  }
};
