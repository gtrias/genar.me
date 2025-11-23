import type { Command } from './types';

const helpCommand: Command = {
  metadata: {
    name: 'help',
    description: 'Show available commands',
    usage: 'help [command]',
    getSuggestions: async (args, currentArg, { shell }) => {
      if (args.length === 0) {
        const registry = shell.getCommandRegistry();
        return registry.getCommandNames().filter((name) => name.startsWith(currentArg));
      }
      return [];
    },
  },

  async execute(args, { shell }) {
    const commandName = args[0];

    // Show help for specific command
    if (commandName) {
      const registry = shell.getCommandRegistry();
      const command = registry.get(commandName);

      if (!command) {
        return {
          output: `Unknown command: ${commandName}\n`,
          exitCode: 1,
        };
      }

      return {
        output: `
${command.metadata.name} - ${command.metadata.description}

Usage: ${command.metadata.usage}
`,
        exitCode: 0,
      };
    }

    // Show all commands
    const registry = shell.getCommandRegistry();
    const commands = registry.getAll();

    const helpText = `
Available commands:
${commands.map((cmd) => `  ${cmd.metadata.name.padEnd(12)} - ${cmd.metadata.description}`).join('\n')}

Use arrow keys to navigate command history.
`;

    return { output: helpText, exitCode: 0 };
  },
};

export default helpCommand;
