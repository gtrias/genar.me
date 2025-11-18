import type { Command, CommandContext } from './types';
import { box, colors, table } from '../terminal/ui';

/**
 * Achievements command - displays user progress and achievements
 */
export const achievementsCommand: Command = {
  name: 'achievements',
  description: 'View your progress and achievements',
  category: 'system',

  execute: async ({ terminal, shell }: CommandContext) => {
    // Get LiveStore from shell runtime if available
    // For now, we'll need to access it through a different method
    // This is a simplified version - in production, you'd get LiveStore from context
    
    const achievements = [
      { id: 'first_command', name: 'First Command', description: 'Run your first command', earned: true },
      { id: 'explorer', name: 'Explorer', description: 'Visit 10 different directories', earned: false },
      { id: 'reader', name: 'Reader', description: 'Read 5 different files', earned: false },
      { id: 'creator', name: 'Creator', description: 'Create your first file', earned: false },
      { id: 'rtfm', name: 'RTFM', description: 'Read the help documentation', earned: true },
      { id: 'power_user', name: 'Power User', description: 'Run 100 commands', earned: false },
    ];

    let content = '';
    
    for (const achievement of achievements) {
      const status = achievement.earned 
        ? colors.green('✓') 
        : colors.dim('○');
      const name = achievement.earned 
        ? colors.cyan(achievement.name)
        : colors.dim(achievement.name);
      
      content += `  ${status} ${name}\n`;
      content += `    ${colors.dim(achievement.description)}\n\n`;
    }

    const achievementsBox = box(content, {
      title: 'Achievements',
      borderColor: 'purple',
      borderStyle: 'rounded',
      padding: 1
    });

    terminal.writeln(achievementsBox);
    terminal.writeln('');
  }
};

