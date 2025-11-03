# Terminal Core Modules

This directory contains the core terminal functionality that has been extracted from the main terminal component for better separation of concerns.

## Modules

### TerminalInterface
Defines the contract for terminal operations. This is an abstraction layer that allows different terminal implementations to be used interchangeably.

```typescript
interface TerminalInterface {
  write(text: string): void;
  writeln(text: string): void;
  clear(): void;
  onData(callback: (data: string) => void): void;
}
```

### CommandHandler
Handles command execution, validation, and autocomplete functionality.

```typescript
const commandHandler = new CommandHandler(commandRegistry, terminal);
await commandHandler.execute('help', []);
const suggestions = commandHandler.autocomplete('he'); // ['help']
```

### InputManager
Manages keyboard input, command history, and user interactions.

```typescript
const inputManager = new InputManager(terminal, '$ ', commandHandler);
const result = inputManager.handleKey('\r', currentLine);
inputManager.addToHistory('help command');
```

## Integration Example

```typescript
import { TerminalInterface, CommandHandler, InputManager } from './core';
import { getCommandRegistry } from '../commands';

// Create terminal adapter (example for xterm)
class XTermAdapter implements TerminalInterface {
  constructor(private xterm: Terminal) {}
  
  write(text: string) { this.xterm.write(text); }
  writeln(text: string) { this.xterm.writeln(text); }
  clear() { this.xterm.clear(); }
  onData(callback: (data: string) => void) { this.xterm.onData(callback); }
}

// Setup terminal system
async function setupTerminal(xterm: Terminal) {
  const terminal = new XTermAdapter(xterm);
  const commandRegistry = getCommandRegistry();
  const commandHandler = new CommandHandler(commandRegistry, terminal);
  const inputManager = new InputManager(terminal, '$ ', commandHandler);
  
  let currentLine = '';
  
  // Handle input
  terminal.onData((data) => {
    const result = inputManager.handleKey(data, currentLine);
    
    if (result.command && result.args) {
      // Execute command
      commandHandler.execute(result.command, result.args)
        .finally(() => {
          terminal.write(inputManager.getPrompt());
          inputManager.setCommandRunning(false);
        });
    }
    
    currentLine = result.currentLine;
  });
  
  // Show initial prompt
  terminal.write(inputManager.getPrompt());
}
```

## Migration from Terminal.astro

The following functions have been extracted from `Terminal.astro`:

- `executeCommand()` → `CommandHandler.execute()`
- `handleEnterKey()` → `InputManager.handleEnterKey()`
- `handleBackspace()` → `InputManager.handleBackspace()`
- `handleUpArrow()` → `InputManager.handleUpArrow()`
- `handleDownArrow()` → `InputManager.handleDownArrow()`
- `handleTabAutocomplete()` → `InputManager.handleTabAutocomplete()`
- `handleDefaultInput()` → `InputManager.handleDefaultInput()`
- `setupInteractiveTerminal()` → Integration of InputManager + CommandHandler

## Benefits

1. **Separation of Concerns**: Command logic is separated from terminal UI
2. **Testability**: Each module can be tested independently
3. **Reusability**: Components can be used with different terminal implementations
4. **Maintainability**: Clear interfaces and responsibilities
5. **Extensibility**: Easy to add new features without modifying core logic