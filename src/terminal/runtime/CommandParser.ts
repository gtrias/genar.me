/**
 * Command Parser
 * Parses command lines into commands, arguments, and handles basic shell features
 */

export interface ParsedCommand {
  command: string;
  args: string[];
  raw: string;
}

export class CommandParser {
  /**
   * Parse a command line string into command and arguments
   * Handles quoted strings and basic escaping
   */
  static parse(line: string): ParsedCommand {
    const trimmed = line.trim();
    if (!trimmed) {
      return { command: '', args: [], raw: trimmed };
    }

    const parts = this.tokenize(trimmed);
    if (parts.length === 0) {
      return { command: '', args: [], raw: trimmed };
    }

    const command = parts[0];
    const args = parts.slice(1);

    return {
      command,
      args,
      raw: trimmed
    };
  }

  /**
   * Tokenize a command line, handling quotes and escaping
   */
  private static tokenize(line: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escapeNext = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (escapeNext) {
        current += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        continue;
      }

      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }

      if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Check if a command line contains pipes
   */
  static hasPipes(line: string): boolean {
    // Simple check - doesn't handle pipes in quotes
    return line.includes('|');
  }

  /**
   * Check if a command line contains redirects
   */
  static hasRedirects(line: string): boolean {
    // Simple check - doesn't handle redirects in quotes
    return /[<>]/.test(line);
  }

  /**
   * Check if a command line contains command chaining
   */
  static hasChaining(line: string): boolean {
    // Check for && or || operators
    return /&&|\|\|/.test(line);
  }
}

