/**
 * Shell Runtime
 * Main shell runtime that manages environment, history, exit codes, and command execution context
 */

import { Environment } from './Environment';
import { CommandParser } from './CommandParser';
import type { ParsedCommand } from './CommandParser';
import type { VirtualFileSystem } from '../filesystem/VirtualFileSystem';

export interface Process {
  id: number;
  command: string;
  args: string[];
  startTime: Date;
  exitCode?: number;
}

export class ShellRuntime {
  private environment: Environment;
  private history: string[] = [];
  private lastExitCode: number = 0;
  private processes: Process[] = [];
  private nextProcessId: number = 1;
  private aliases: Map<string, string> = new Map();

  constructor(
    private vfs: VirtualFileSystem,
    initialCWD: string = '/home/guest'
  ) {
    this.environment = new Environment();
    this.environment.setPWD(initialCWD);
    
    // Set up default aliases
    this.aliases.set('ll', 'ls -la');
    this.aliases.set('la', 'ls -a');
  }

  /**
   * Get environment manager
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Get current working directory
   */
  getCWD(): string {
    return this.environment.getPWD();
  }

  /**
   * Set current working directory
   */
  setCWD(path: string): void {
    this.environment.setPWD(path);
  }

  /**
   * Get last exit code
   */
  getLastExitCode(): number {
    return this.lastExitCode;
  }

  /**
   * Set last exit code
   */
  setLastExitCode(code: number): void {
    this.lastExitCode = code;
  }

  /**
   * Parse a command line
   */
  parseCommand(line: string): ParsedCommand {
    // Expand environment variables first
    const expanded = this.environment.expand(line);
    
    // Check for aliases
    const parsed = CommandParser.parse(expanded);
    if (this.aliases.has(parsed.command)) {
      const aliasValue = this.aliases.get(parsed.command)!;
      const aliasParsed = CommandParser.parse(aliasValue);
      return {
        command: aliasParsed.command,
        args: [...aliasParsed.args, ...parsed.args],
        raw: line
      };
    }
    
    return parsed;
  }

  /**
   * Add command to history
   */
  addToHistory(command: string): void {
    if (command.trim() && command !== this.history[this.history.length - 1]) {
      this.history.push(command);
      // Limit history to last 1000 commands
      if (this.history.length > 1000) {
        this.history.shift();
      }
    }
  }

  /**
   * Get command history
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Set command history (for loading from storage)
   */
  setHistory(history: string[]): void {
    this.history = [...history];
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Create a new process
   */
  createProcess(command: string, args: string[]): Process {
    const process: Process = {
      id: this.nextProcessId++,
      command,
      args,
      startTime: new Date()
    };
    this.processes.push(process);
    return process;
  }

  /**
   * Complete a process with exit code
   */
  completeProcess(processId: number, exitCode: number): void {
    const process = this.processes.find(p => p.id === processId);
    if (process) {
      process.exitCode = exitCode;
      this.lastExitCode = exitCode;
    }
  }

  /**
   * Get all processes
   */
  getProcesses(): Process[] {
    return [...this.processes];
  }

  /**
   * Get active processes (not yet completed)
   */
  getActiveProcesses(): Process[] {
    return this.processes.filter(p => p.exitCode === undefined);
  }

  /**
   * Set an alias
   */
  setAlias(name: string, value: string): void {
    this.aliases.set(name, value);
  }

  /**
   * Get an alias
   */
  getAlias(name: string): string | undefined {
    return this.aliases.get(name);
  }

  /**
   * Remove an alias
   */
  unsetAlias(name: string): void {
    this.aliases.delete(name);
  }

  /**
   * Get all aliases
   */
  getAliases(): Map<string, string> {
    return new Map(this.aliases);
  }

  /**
   * Resolve a command path using PATH environment variable
   */
  resolveCommand(commandName: string): string | null {
    // Check if it's an absolute path
    if (commandName.startsWith('/')) {
      return commandName;
    }

    // Check if it's a relative path (contains /)
    if (commandName.includes('/')) {
      const cwd = this.getCWD();
      const resolved = this.vfs.resolvePath(commandName);
      const fullPath = resolved.length > 0 ? '/' + resolved.join('/') : '/';
      return fullPath;
    }

    // Search in PATH
    const pathDirs = this.environment.getPATH();
    for (const dir of pathDirs) {
      const testPath = dir + '/' + commandName;
      // In a real system, we'd check if the file exists and is executable
      // For now, we'll return the first path that matches our command structure
      // This will be enhanced when we add WASM command support
      if (dir === '/usr/bin' || dir === '/bin') {
        return testPath;
      }
    }

    return null;
  }

  /**
   * Get virtual filesystem
   */
  getVFS(): VirtualFileSystem {
    return this.vfs;
  }

  /**
   * Generate prompt string
   */
  generatePrompt(): string {
    const user = this.environment.getUSER();
    const hostname = this.environment.get('HOSTNAME') || 'genar-terminal';
    const cwd = this.getCWD();
    
    // Shorten home directory to ~
    const home = this.environment.getHOME();
    const displayPath = cwd.startsWith(home) 
      ? '~' + cwd.slice(home.length)
      : cwd;
    
    return `\x1b[32m${user}\x1b[0m@\x1b[36m${hostname}\x1b[0m:\x1b[34m${displayPath}\x1b[0m$ `;
  }
}

