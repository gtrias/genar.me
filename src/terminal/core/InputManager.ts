/**
 * Input handling and history management
 * Handles keyboard input, command history, and navigation
 */

import type { TerminalInterface } from './TerminalInterface';
import type { CommandHandler } from './CommandHandler';

export interface InputResult {
  handled: boolean;
  currentLine: string;
  historyIndex: number;
  commandRunning?: boolean;
  command?: string;
  args?: string[];
}

export interface HistoryResult {
  currentLine: string;
  historyIndex: number;
}

export class InputManager {
  private history: string[] = [];
  private historyIndex: number = -1;
  private commandRunning: boolean = false;

  constructor(
    private terminal: TerminalInterface,
    private prompt: string = '$ ',
    private commandHandler?: CommandHandler
  ) {}

  /**
   * Handle keyboard input data
   */
  handleKey(data: string, currentLine: string): InputResult {
    if (this.commandRunning) {
      return { handled: false, currentLine, historyIndex: this.historyIndex };
    }

    switch (data) {
      case '\r': // Enter
        return this.handleEnterKey(currentLine);
        
      case '\u007F': // Backspace
        return { handled: true, currentLine: this.handleBackspace(currentLine), historyIndex: this.historyIndex };
        
      case '\u001b[A': // Up arrow
        const upResult = this.handleUpArrow();
        return { handled: true, currentLine: upResult.currentLine, historyIndex: upResult.historyIndex };
        
      case '\u001b[B': // Down arrow
        const downResult = this.handleDownArrow();
        return { handled: true, currentLine: downResult.currentLine, historyIndex: downResult.historyIndex };
        
      case '\t': // Tab autocomplete
        return { handled: true, currentLine: this.handleTabAutocomplete(currentLine), historyIndex: this.historyIndex };
        
      default:
        return { handled: true, currentLine: this.handleDefaultInput(data, currentLine), historyIndex: this.historyIndex };
    }
  }

  /**
   * Handle Enter key - execute command
   */
  private handleEnterKey(currentLine: string): InputResult {
    this.terminal.writeln('');

    if (currentLine.trim()) {
      this.addToHistory(currentLine);
    }

    const commandInput = currentLine.trim();
    const [cmd, ...args] = commandInput.split(' ');

    if (cmd === '') {
      this.terminal.write(this.prompt);
      return { handled: true, currentLine: '', historyIndex: this.historyIndex };
    }

    return { 
      handled: true, 
      currentLine: '', 
      historyIndex: this.historyIndex,
      commandRunning: true,
      command: cmd,
      args
    };
  }

  /**
   * Handle backspace key
   */
  private handleBackspace(currentLine: string): string {
    if (currentLine.length > 0) {
      const newLine = currentLine.slice(0, -1);
      this.terminal.write('\b \b');
      return newLine;
    }
    return currentLine;
  }

  /**
   * Handle up arrow - navigate history up
   */
  private handleUpArrow(): HistoryResult {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const cmd = this.history[this.history.length - 1 - this.historyIndex];
      this.terminal.write('\r\x1b[K' + this.prompt + cmd);
      return { currentLine: cmd, historyIndex: this.historyIndex };
    }
    return { currentLine: '', historyIndex: this.historyIndex };
  }

  /**
   * Handle down arrow - navigate history down
   */
  private handleDownArrow(): HistoryResult {
    if (this.historyIndex > -1) {
      this.historyIndex--;
      if (this.historyIndex === -1) {
        this.terminal.write('\r\x1b[K' + this.prompt);
        return { currentLine: '', historyIndex: this.historyIndex };
      } else {
        const cmd = this.history[this.history.length - 1 - this.historyIndex];
        this.terminal.write('\r\x1b[K' + this.prompt + cmd);
        return { currentLine: cmd, historyIndex: this.historyIndex };
      }
    }
    return { currentLine: '', historyIndex: this.historyIndex };
  }

  /**
   * Handle tab autocomplete
   */
  private handleTabAutocomplete(currentLine: string): string {
    const input = currentLine.trim();

    if (input && this.commandHandler) {
      const matches = this.commandHandler.autocomplete(input);
      if (matches.length === 1) {
        const completion = matches[0].slice(input.length);
        const newLine = currentLine + completion;
        this.terminal.write(completion);
        return newLine;
      } else if (matches.length > 1) {
        this.terminal.writeln('');
        matches.forEach(cmd => this.terminal.writeln(`  \x1b[93m${cmd}\x1b[0m`));
        this.terminal.write(this.prompt + currentLine);
      }
    }
    return currentLine;
  }

  /**
   * Handle default character input
   */
  private handleDefaultInput(data: string, currentLine: string): string {
    if (data >= ' ' && data <= '~') {
      const newLine = currentLine + data;
      this.terminal.write(data);
      return newLine;
    }
    return currentLine;
  }

  /**
   * Add command to history
   */
  addToHistory(command: string): void {
    this.history.push(command);
    this.historyIndex = -1;
  }

  /**
   * Get command history
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Set command running state
   */
  setCommandRunning(running: boolean): void {
    this.commandRunning = running;
  }

  /**
   * Get command running state
   */
  isCommandRunning(): boolean {
    return this.commandRunning;
  }

  /**
   * Set prompt
   */
  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  /**
   * Get prompt
   */
  getPrompt(): string {
    return this.prompt;
  }

  /**
   * Set command handler for autocomplete
   */
  setCommandHandler(commandHandler: CommandHandler): void {
    this.commandHandler = commandHandler;
  }

  /**
   * Get command handler
   */
  getCommandHandler(): CommandHandler | undefined {
    return this.commandHandler;
  }
}