// Screensavers on the glass: the easter egg. Names are what the hidden `screensaver` command accepts.
export const SCREENSAVERS = [
  'starfield',
  'logo',
  'scope',
  'matrix',
  'pipes',
  'maze',
  'life',
  'clock',
  'fire',
  'snake',
  'pong',
  'mystify',
  'marquee',
] as const;
export type SaverName = (typeof SCREENSAVERS)[number];

// Without input for this long, the screen starts a screensaver
export const IDLE_MS = 60_000;
// Input right after a screensaver starts (the Enter that ran the command, its key repeat) doesn't wake it
export const WAKE_GRACE_MS = 250;
