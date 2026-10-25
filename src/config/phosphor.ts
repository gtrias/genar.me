// Green-phosphor screen palette, shared by xterm, the screen backdrop and the WebGL clear colour
// so the three layers never show a seam.
export const PHOSPHOR = {
  background: '#082510',
  foreground: '#d2ffe6',
  // The logo's long strokes bloom more than text, so they start a little greener to end up alike
  logo: '#b2fac0',
  cursor: '#b8ffc9',
  // How the text looks once on the glass, after the shader's bloom: for HTML drawn over the screen
  glass: '#b4f8cc',
  dim: '#3e8a5c',
} as const;
