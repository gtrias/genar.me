export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  crt: {
    glowColor: string;
    shadowColor: string;
    reflectionOpacity: number;
    vignetteOpacity: number;
  };
  scanline: {
    color: string;
    opacity: number;
    animationDuration: number;
  };
}

export const defaultThemeConfig: ThemeConfig = {
  colors: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    accent: '#ffff00',
    success: '#00ff00',
    error: '#ff0000',
    warning: '#ff9900',
    info: '#0099ff',
  },
  crt: {
    glowColor: 'rgba(0, 255, 255, 0.3)',
    shadowColor: 'rgba(227, 72, 128, 0.2)',
    reflectionOpacity: 1,
    vignetteOpacity: 1,
  },
  scanline: {
    color: 'rgba(34, 233, 216, 0.01)',
    opacity: 0.01,
    animationDuration: 8,
  },
};