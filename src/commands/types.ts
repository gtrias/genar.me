/**
 * Terminal command interface
 * All commands must implement this structure
 */

export interface Terminal {
  write: (text: string) => void;
  writeln: (text: string) => void;
  clear: () => void;
}

export interface CommandContext {
  terminal: Terminal;
  args: string[];
  onComplete?: () => void;
}

export interface Command {
  name: string;
  description: string;
  usage?: string;
  category: 'portfolio' | 'system';
  execute: (context: CommandContext) => void | Promise<void>;
}

/**
 * Utility function for typewriter effect
 */
export async function typewriterEffect(
  terminal: Terminal,
  lines: string[],
  onComplete?: () => void
): Promise<void> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const charDelay = isMobile ? 5 : 10;
  const lineDelay = isMobile ? 20 : 30;

  for (const line of lines) {
    await new Promise<void>((resolve) => {
      let charIndex = 0;

      function typeChar() {
        if (charIndex < line.length) {
          terminal.write(line[charIndex]);
          charIndex++;
          setTimeout(typeChar, charDelay);
        } else {
          terminal.writeln('');
          setTimeout(resolve, lineDelay);
        }
      }

      typeChar();
    });
  }

  if (onComplete) onComplete();
}
