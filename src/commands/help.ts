import type { Command, CommandContext } from './types';
import { box, colors } from '../terminal/ui';
import { getCommandsByCategory } from './index';

/**
 * Help command - displays all available commands with beautiful formatting
 */
export const helpCommand: Command = {
  name: 'help',
  description: 'Show all available commands',
  category: 'system',

  execute: ({ terminal }: CommandContext) => {
    const portfolioCommands = getCommandsByCategory('portfolio');
    const systemCommands = getCommandsByCategory('system');

    let content = '';
    
    // Portfolio commands
    if (portfolioCommands.length > 0) {
      content += colors.bold(colors.green('Portfolio:')) + '\n';
      for (const cmd of portfolioCommands) {
        const usage = cmd.usage ? ` ${cmd.usage}` : '';
        content += `  ${colors.yellow(cmd.name.padEnd(12))} ${cmd.description}${usage}\n`;
      }
      content += '\n';
    }

    // System commands
    if (systemCommands.length > 0) {
      content += colors.bold(colors.green('System:')) + '\n';
      for (const cmd of systemCommands) {
        const usage = cmd.usage ? ` ${cmd.usage}` : '';
        content += `  ${colors.yellow(cmd.name.padEnd(12))} ${cmd.description}${usage}\n`;
      }
      content += '\n';
    }

    // Navigation tips
    content += colors.dim('Navigation Tips:') + '\n';
    content += '  • Use ↑↓ arrows to navigate command history\n';
    content += '  • Use Tab for autocomplete\n';
    content += '  • Type \'history\' to see command history\n';

    const helpBox = box(content, {
      title: 'Available Commands',
      borderColor: 'cyan',
      borderStyle: 'rounded',
      padding: 1
    });

    // Split box output into lines and write each line separately
    // This ensures proper handling of multi-line output
    const boxLines = helpBox.split('\n');
    for (const line of boxLines) {
      terminal.writeln(line);
    }
    terminal.writeln('');
  }
};
