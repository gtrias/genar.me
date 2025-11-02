import type { Command, CommandContext } from './types';
import { typewriterEffect } from './types';

/**
 * Experience command - displays work history with typewriter effect
 */
export const experienceCommand: Command = {
  name: 'experience',
  description: 'See my work history',
  category: 'portfolio',

  execute: async ({ terminal, onComplete }: CommandContext) => {
    const experienceText = [
      '\x1b[96m╔═══════════════════════════════════════════════════════════╗\x1b[0m',
      '\x1b[96m║                   WORK EXPERIENCE                         ║\x1b[0m',
      '\x1b[96m╚═══════════════════════════════════════════════════════════╝\x1b[0m',
      '',
      '\x1b[92m▸ Senior Full Stack Developer\x1b[0m',
      '  \x1b[93mTechCorp Inc.\x1b[0m | 2021 - Present',
      '  • Led development of microservices architecture serving 1M+ users',
      '  • Improved application performance by 40% through optimization',
      '  • Mentored team of 5 junior developers',
      '',
      '\x1b[92m▸ Full Stack Developer\x1b[0m',
      '  \x1b[93mStartup Ventures\x1b[0m | 2019 - 2021',
      '  • Built and deployed 10+ production web applications',
      '  • Implemented CI/CD pipelines reducing deployment time by 60%',
      '  • Collaborated with cross-functional teams in agile environment',
      '',
      '\x1b[92m▸ Frontend Developer\x1b[0m',
      '  \x1b[93mDigital Solutions Ltd.\x1b[0m | 2017 - 2019',
      '  • Developed responsive user interfaces using React and Vue.js',
      '  • Reduced page load times by 50% through code optimization',
      '  • Worked closely with UX designers to implement pixel-perfect designs',
      '',
      '\x1b[95m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m',
      '\x1b[90mTotal Experience: 8+ years in software development\x1b[0m',
      ''
    ];

    await typewriterEffect(terminal, experienceText, onComplete);
  }
};
