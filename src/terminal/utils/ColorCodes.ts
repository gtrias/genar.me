export interface ColorCode {
  code: string;
  reset: string;
}

export interface ColorPalette {
  black: ColorCode;
  red: ColorCode;
  green: ColorCode;
  yellow: ColorCode;
  blue: ColorCode;
  magenta: ColorCode;
  cyan: ColorCode;
  white: ColorCode;
  brightBlack: ColorCode;
  brightRed: ColorCode;
  brightGreen: ColorCode;
  brightYellow: ColorCode;
  brightBlue: ColorCode;
  brightMagenta: ColorCode;
  brightCyan: ColorCode;
  brightWhite: ColorCode;
}

export interface StyleCodes {
  reset: string;
  bold: string;
  dim: string;
  italic: string;
  underline: string;
  blink: string;
  inverse: string;
  hidden: string;
  strikethrough: string;
}

export class ColorCodes {
  static readonly RESET = '\x1b[0m';
  
  static readonly COLORS: ColorPalette = {
    black: { code: '\x1b[30m', reset: '\x1b[39m' },
    red: { code: '\x1b[31m', reset: '\x1b[39m' },
    green: { code: '\x1b[32m', reset: '\x1b[39m' },
    yellow: { code: '\x1b[33m', reset: '\x1b[39m' },
    blue: { code: '\x1b[34m', reset: '\x1b[39m' },
    magenta: { code: '\x1b[35m', reset: '\x1b[39m' },
    cyan: { code: '\x1b[36m', reset: '\x1b[39m' },
    white: { code: '\x1b[37m', reset: '\x1b[39m' },
    brightBlack: { code: '\x1b[90m', reset: '\x1b[39m' },
    brightRed: { code: '\x1b[91m', reset: '\x1b[39m' },
    brightGreen: { code: '\x1b[92m', reset: '\x1b[39m' },
    brightYellow: { code: '\x1b[93m', reset: '\x1b[39m' },
    brightBlue: { code: '\x1b[94m', reset: '\x1b[39m' },
    brightMagenta: { code: '\x1b[95m', reset: '\x1b[39m' },
    brightCyan: { code: '\x1b[96m', reset: '\x1b[39m' },
    brightWhite: { code: '\x1b[97m', reset: '\x1b[39m' }
  };

  static readonly STYLES: StyleCodes = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    blink: '\x1b[5m',
    inverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m'
  };

  static readonly BACKGROUND = {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    brightBlack: '\x1b[100m',
    brightRed: '\x1b[101m',
    brightGreen: '\x1b[102m',
    brightYellow: '\x1b[103m',
    brightBlue: '\x1b[104m',
    brightMagenta: '\x1b[105m',
    brightCyan: '\x1b[106m',
    brightWhite: '\x1b[107m'
  };

  static colorize(text: string, colorCode: ColorCode): string {
    return `${colorCode.code}${text}${colorCode.reset}`;
  }

  static style(text: string, styleCode: string): string {
    return `${styleCode}${text}${this.RESET}`;
  }

  static combine(text: string, ...codes: string[]): string {
    const combinedCode = codes.join('');
    return `${combinedCode}${text}${this.RESET}`;
  }

  static stripColors(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  static hasColors(text: string): boolean {
    return /\x1b\[[0-9;]*m/.test(text);
  }

  static getRGB(r: number, g: number, b: number): string {
    return `\x1b[38;2;${r};${g};${b}m`;
  }

  static getBackgroundRGB(r: number, g: number, b: number): string {
    return `\x1b[48;2;${r};${g};${b}m`;
  }

  static rgb(text: string, r: number, g: number, b: number): string {
    return `${this.getRGB(r, g, b)}${text}${this.RESET}`;
  }

  static backgroundRGB(text: string, r: number, g: number, b: number): string {
    return `${this.getBackgroundRGB(r, g, b)}${text}${this.RESET}`;
  }
}