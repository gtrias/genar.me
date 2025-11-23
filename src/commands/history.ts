import type { Command } from './types';

const historyCommand: Command = {
  metadata: {
    name: 'history',
    description: 'Show command history',
    usage: 'history',
  },

  async execute(args, { shell }) {
    const history = shell.getHistoryList();
    if (history.length === 0) {
      return { output: '', exitCode: 0 };
    }
    const historyText = history.map((cmd, idx) => `${idx + 1}  ${cmd}`).join('\n');
    return { output: historyText + '\n', exitCode: 0 };
  },
};

export default historyCommand;
