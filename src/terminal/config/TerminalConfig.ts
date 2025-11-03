export interface ThemeColors {
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  brightWhite: string;
  brightCyan: string;
  brightGreen: string;
  brightMagenta: string;
  brightYellow: string;
}

export interface TerminalConfig {
  cursorBlinkRate: number;
  fontSize: number;
  fontFamily: string;
  cols?: number; // Optional - FitAddon will calculate optimal size if not provided
  rows?: number; // Optional - FitAddon will calculate optimal size if not provided
  allowTransparency: boolean;
  theme: ThemeColors;
}

export const defaultTerminalConfig: TerminalConfig = {
  cursorBlinkRate: 500,
  fontSize: 18,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  cols: 100,
  rows: 30,
  allowTransparency: true,
  theme: {
    background: 'transparent',
    foreground: '#00ffff',
    cursor: '#00ffff',
    selection: '#00ffff30',
    brightWhite: '#ffffff',
    brightCyan: '#00ffff',
    brightGreen: '#00ff00',
    brightMagenta: '#ff00ff',
    brightYellow: '#ffff00',
  },
};