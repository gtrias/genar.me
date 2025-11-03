import type { Command, CommandContext } from './types';
import { typewriterEffect } from './types';
import { personalLinks, getDisplayName } from '../data/links';

/**
 * Links command - displays personal and social links
 */
export const linksCommand: Command = {
  name: 'links',
  description: 'Show personal and social links',
  category: 'portfolio',

  execute: async ({ terminal, onComplete }: CommandContext) => {
    const linksText = [
      '\x1b[96m╔═══════════════════════════════════════════════════════════╗\x1b[0m',
      '\x1b[96m║                    PERSONAL LINKS                         ║\x1b[0m',
      '\x1b[96m╚═══════════════════════════════════════════════════════════╝\x1b[0m',
      '',
      '\x1b[93mConnect with me on:\x1b[0m',
      '',
    ];

    // Add each link
    personalLinks.forEach((link) => {
      const displayName = getDisplayName(link);
      linksText.push(`\x1b[92m▸ ${link.name}:\x1b[0m \x1b[96m${link.url}\x1b[0m`);
    });

    linksText.push('');
    linksText.push('\x1b[90mClick any link or copy to visit!\x1b[0m');
    linksText.push('');

    await typewriterEffect(terminal, linksText, onComplete);
  }
};
