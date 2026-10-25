// Text area inside the glass, shown by the WebGL canvas. Margins measured on the approved mock: text
// starts ~5% in from the left glass edge, ends ~4% before the right one, and the banner sits ~16%
// below the top edge.
export const SCREEN_INSET = {
  top: '9%',
  right: '3.6%',
  bottom: '6%',
  left: '5.2%',
} as const;

// FitAddon always reserves a scrollbar's width on the right (xterm falls back to 15px even when the
// scrollbar is hidden).
export const XTERM_SCROLLBAR = 15;

// The hidden xterm container is that much wider than the text area, so its canvas comes out exactly
// as wide as the WebGL view that shows it instead of being stretched to fit.
export const XTERM_INSET = {
  ...SCREEN_INSET,
  right: `calc(${SCREEN_INSET.right} - ${XTERM_SCROLLBAR}px)`,
} as const;
