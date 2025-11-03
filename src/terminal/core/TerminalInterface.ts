/**
 * Terminal interface abstraction
 * Defines the contract for terminal operations
 */

export interface TerminalInterface {
  /**
   * Write text to the terminal without newline
   */
  write(text: string): void;
  
  /**
   * Write text to the terminal with newline
   */
  writeln(text: string): void;
  
  /**
   * Clear the terminal screen
   */
  clear(): void;
  
  /**
   * Register callback for data input events
   */
  onData(callback: (data: string) => void): void;
}