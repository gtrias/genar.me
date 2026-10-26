import type { Terminal } from '@xterm/xterm';
import type Shell from '../utils/shell';

export interface CommandResult {
  output: string;
  exitCode: number;
}

export interface CommandContext {
  shell: Shell;
  terminal?: Terminal; // Optional: for commands that need direct terminal access
}

export interface CommandMetadata {
  name: string;
  description: string;
  usage: string;

  // Tab completion: candidates replacing currentArg (directories end in '/')
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
