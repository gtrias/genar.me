// Text area inside the glass, shown by the WebGL canvas, measured on the approved mock: the banner's
// longest line spans it and 19 rows of 31.75px fill its height, with the prompt row's top at y 427.
export const SCREEN_INSET = {
  top: '9.21%',
  right: '4.19%',
  bottom: '5.34%',
  left: '6%',
} as const;

// xterm keeps a scrollbar's width (15px, even when hidden) inside its container
export const XTERM_SCROLLBAR = 15;

// The hidden xterm container is that much wider than the text area, so the scrollbar sits outside
// the part that receives clicks on the text.
export const XTERM_INSET = {
  ...SCREEN_INSET,
  right: `calc(${SCREEN_INSET.right} - ${XTERM_SCROLLBAR}px)`,
} as const;
