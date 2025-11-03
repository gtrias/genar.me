export { BootSequence } from './BootSequence';
export { SkipHandler } from './SkipHandler';
export { DEFAULT_BOOT_MESSAGES, MINIMAL_BOOT_MESSAGES, getBootMessages } from './BootMessages';

/*
Usage Example:

import { BootSequence } from './boot/BootSequence';
import { TimeoutManager } from './utils/TimeoutManager';
import { defaultBootConfig } from './config/BootConfig';

const timeoutManager = new TimeoutManager();
const bootSequence = new BootSequence(terminal, defaultBootConfig, timeoutManager);

// Start boot sequence
bootSequence.start(() => {
  console.log('Boot completed');
});

// Skip boot sequence if needed
bootSequence.skip();
*/