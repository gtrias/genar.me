import type { Command, CommandContext } from './types';
import { typewriterEffect } from './types';

/**
 * About command - displays personal bio with typewriter effect
 */
export const aboutCommand: Command = {
  name: 'about',
  description: 'Learn about me',
  category: 'portfolio',

  execute: async ({ terminal, onComplete }: CommandContext) => {
    const aboutText = [
      '\x1b[96m╔═══════════════════════════════════════════════════════════╗\x1b[0m',
      '\x1b[96m║                      ABOUT ME                             ║\x1b[0m',
      '\x1b[96m╚═══════════════════════════════════════════════════════════╝\x1b[0m',
      '',
      '\x1b[92mName:\x1b[0m John Doe',
      '\x1b[92mRole:\x1b[0m Full Stack Developer & Tech Enthusiast',
      '\x1b[92mLocation:\x1b[0m San Francisco, CA',
      '',
      '\x1b[93mHello! I\'m a passionate developer who loves building',
      'innovative web applications and exploring cutting-edge',
      'technologies. With expertise in both frontend and backend',
      'development, I create seamless digital experiences that',
      'make a difference.\x1b[0m',
      '',
      '\x1b[95mWhen I\'m not coding, you\'ll find me contributing to open',
      'source projects, mentoring aspiring developers, or diving',
      'into the latest tech trends.\x1b[0m',
      '',
      '\x1b[90mType \'skills\' or \'experience\' to learn more about my background.\x1b[0m',
      ''
    ];

    await typewriterEffect(terminal, aboutText, onComplete);
  }
};
