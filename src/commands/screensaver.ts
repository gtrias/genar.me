import { SCREENSAVERS, type SaverName } from '../config/screensavers';
import { startScreensaver } from '../state/screensaver';
import type { Command } from './types';

// The easter egg's trigger: not in help, not in tab completion
const screensaverCommand: Command = {
  metadata: {
    name: 'screensaver',
    description: 'Start a screensaver',
    usage: `screensaver [${SCREENSAVERS.join('|')}]`,
    hidden: true,
  },

  async execute(args) {
    const name = args[0];
    if (name && !SCREENSAVERS.includes(name as SaverName)) {
      return { output: `Usage: ${screensaverCommand.metadata.usage}\n`, exitCode: 1 };
    }
    startScreensaver(name as SaverName | undefined);
    return { output: '', exitCode: 0 };
  },
};

export default screensaverCommand;
