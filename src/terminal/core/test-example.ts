/**
 * Example usage and test of the command handler system
 * This file demonstrates how to use the new modular terminal components
 */

import type { TerminalInterface } from './TerminalInterface';
import { CommandHandler } from './CommandHandler';
import { InputManager } from './InputManager';
import type { Command } from '../../commands/types';

// Mock terminal for testing
class MockTerminal implements TerminalInterface {
  private output: string[] = [];

  write(text: string): void {
    process.stdout.write(text);
    this.output.push(text);
  }

  writeln(text: string): void {
    console.log(text);
    this.output.push(text + '\n');
  }

  clear(): void {
    console.clear();
    this.output = [];
  }

  onData(callback: (data: string) => void): void {
    // In a real implementation, this would attach to terminal events
    // For testing, we'll call the callback directly
    void callback; // Suppress unused parameter warning
  }

  getOutput(): string[] {
    return this.output;
  }
}

// Example command for testing
const testCommand: Command = {
  name: 'test',
  description: 'Test command',
  category: 'system',
  execute: (context) => {
    context.terminal.writeln('Test command executed!');
    if (context.args.length > 0) {
      context.terminal.writeln(`Args: ${context.args.join(', ')}`);
    }
  }
};

// Example usage
async function demonstrateCommandHandler() {
  console.log('=== Command Handler System Demo ===\n');

  // Create mock terminal
  const terminal = new MockTerminal();

  // Create command registry with test command
  const commandRegistry = new Map<string, Command>();
  commandRegistry.set('test', testCommand);

  // Create command handler
  const commandHandler = new CommandHandler(commandRegistry, terminal);

  // Create input manager
  const inputManager = new InputManager(terminal, '$ ', commandHandler);

  console.log('1. Testing command execution:');
  await commandHandler.execute('test', ['arg1', 'arg2']);

  console.log('\n2. Testing autocomplete:');
  const suggestions = commandHandler.autocomplete('te');
  console.log(`Autocomplete suggestions for 'te': ${suggestions.join(', ')}`);

  console.log('\n3. Testing input handling:');
  let currentLine = 'test';
  
  // Simulate Enter key
  const enterResult = inputManager.handleKey('\r', currentLine);
  console.log(`Enter result - Command: ${enterResult.command}, Args: ${enterResult.args?.join(', ')}`);

  // Simulate backspace
  currentLine = 'test';
  const backspaceResult = inputManager.handleKey('\u007F', currentLine);
  console.log(`Backspace result - Current line: '${backspaceResult.currentLine}'`);

  // Simulate tab autocomplete
  currentLine = 'te';
  const tabResult = inputManager.handleKey('\t', currentLine);
  console.log(`Tab autocomplete result - Current line: '${tabResult.currentLine}'`);

  console.log('\n4. Testing history:');
  inputManager.addToHistory('help');
  inputManager.addToHistory('clear');
  inputManager.addToHistory('test');
  console.log(`Command history: ${inputManager.getHistory().join(', ')}`);

  console.log('\n5. Testing history navigation:');
  currentLine = '';
  const upResult = inputManager.handleKey('\u001b[A', currentLine);
  console.log(`Up arrow result - Current line: '${upResult.currentLine}'`);

  const downResult = inputManager.handleKey('\u001b[B', upResult.currentLine);
  console.log(`Down arrow result - Current line: '${downResult.currentLine}'`);

  console.log('\n=== Demo Complete ===');
}

// Export for potential use in tests
export { MockTerminal, demonstrateCommandHandler };

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateCommandHandler().catch(console.error);
}