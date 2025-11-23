import type { Terminal } from '@xterm/xterm';
import type Shell from '../utils/shell';

export interface CommandResult {
  output: string;
  exitCode: number;
  websocketUrl?: string; // Special case for SSH-like commands
}

export interface CommandContext {
  shell: Shell;
  terminal?: Terminal; // Optional: for commands that need direct terminal access
}

export interface CommandMetadata {
  name: string;
  description: string;
  usage: string;

  // Optional: for future auto-completion
  getSuggestions?: (
    args: string[],
    currentArg: string,
    ctx: CommandContext
  ) => Promise<string[]>;
}

export interface Command {
  metadata: CommandMetadata;
  execute(args: string[], context: CommandContext): Promise<CommandResult>;
}
