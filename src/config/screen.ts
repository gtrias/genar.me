// Text area inside the glass, shown by the WebGL canvas. Margins measured on the approved mock: text
// starts ~6% in from the left glass edge and the logo sits ~16% below the top edge. Left and right
// move together so the text area keeps the width the font size is fitted to.
export const SCREEN_INSET = {
  top: '7.9%',
  right: '3.2%',
  bottom: '6%',
  left: '5.6%',
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
