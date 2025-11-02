# Terminal Commands

This directory contains all terminal commands in a modular architecture. Each command is a separate file, making it easy to add, modify, or remove commands.

## Architecture Overview

```
src/commands/
├── types.ts          # Command interface and shared utilities
├── index.ts          # Command registry (add/remove commands here)
├── README.md         # This file
│
├── help.ts           # Portfolio commands
├── about.ts
├── skills.ts
├── experience.ts
│
└── clear.ts          # System commands
    echo.ts
    date.ts
```

## Adding a New Command

### Step 1: Create a Command File

Create a new file in `src/commands/`, for example `projects.ts`:

```typescript
import type { Command, CommandContext } from './types';

export const projectsCommand: Command = {
  name: 'projects',
  description: 'View my projects',
  category: 'portfolio', // or 'system'

  execute: ({ terminal }: CommandContext) => {
    terminal.writeln('My Projects:');
    terminal.writeln('1. Terminal Portfolio - Interactive terminal website');
    terminal.writeln('2. Task Manager - Productivity app');
    terminal.writeln('');
  }
};
```

### Step 2: Register the Command

Open `src/commands/index.ts` and:

1. Import your command:
```typescript
import { projectsCommand } from './projects';
```

2. Add it to the commands array:
```typescript
const commands: Command[] = [
  // Portfolio
  helpCommand,
  aboutCommand,
  skillsCommand,
  experienceCommand,
  projectsCommand,  // ← Add here

  // System
  clearCommand,
  echoCommand,
  dateCommand,
];
```

3. Export it (optional, for direct access):
```typescript
export {
  // Portfolio
  helpCommand,
  aboutCommand,
  skillsCommand,
  experienceCommand,
  projectsCommand,  // ← Add here

  // System
  clearCommand,
  echoCommand,
  dateCommand,
};
```

That's it! Your command is now available in the terminal with autocomplete support.

## Command with Typewriter Effect

For commands with animated text output:

```typescript
import type { Command, CommandContext } from './types';
import { typewriterEffect } from './types';

export const bioCommand: Command = {
  name: 'bio',
  description: 'Extended biography',
  category: 'portfolio',

  execute: async ({ terminal, onComplete }: CommandContext) => {
    const lines = [
      'This is line 1',
      'This is line 2',
      'This is line 3',
    ];

    await typewriterEffect(terminal, lines, onComplete);
  }
};
```

**Important:** Async commands must call `onComplete()` when finished to re-enable user input.

## Command with Arguments

```typescript
export const greetCommand: Command = {
  name: 'greet',
  description: 'Greet someone',
  usage: 'greet [name]',
  category: 'system',

  execute: ({ terminal, args }: CommandContext) => {
    const name = args[0] || 'stranger';
    terminal.writeln(`Hello, ${name}!`);
  }
};
```

## Removing a Command

To remove a command:

1. Open `src/commands/index.ts`
2. Remove the import
3. Remove it from the `commands` array
4. Remove it from the exports (if present)
5. (Optional) Delete the command file

The command will immediately be unavailable in the terminal.

## Modifying a Command

Simply edit the command file directly. Changes will hot-reload in development mode.

For example, to update the skills list, edit `src/commands/skills.ts`.

## Command Interface

```typescript
interface Command {
  name: string;              // Command name (used to invoke it)
  description: string;       // Short description (shown in help)
  usage?: string;            // Optional usage string
  category: 'portfolio' | 'system';  // Command category
  execute: (context: CommandContext) => void | Promise<void>;
}

interface CommandContext {
  terminal: Terminal;        // Terminal API (write, writeln, clear)
  args: string[];           // Command arguments
  onComplete?: () => void;  // Call when async command finishes
}
```

## Terminal API

```typescript
terminal.write(text)    // Write text without newline
terminal.writeln(text)  // Write text with newline
terminal.clear()        // Clear the terminal screen
```

## ANSI Color Codes

Use ANSI escape codes for colored output:

```typescript
'\x1b[96m'  // Bright Cyan (headers)
'\x1b[92m'  // Bright Green (categories)
'\x1b[93m'  // Bright Yellow (highlights)
'\x1b[95m'  // Bright Magenta (special)
'\x1b[91m'  // Bright Red (errors)
'\x1b[90m'  // Bright Black/Gray (hints)
'\x1b[0m'   // Reset color
```

Example:
```typescript
terminal.writeln('\x1b[96mHello\x1b[0m World');  // "Hello" in cyan
```

## Tips

- **Synchronous commands** return `void` - prompt returns automatically
- **Asynchronous commands** return `Promise<void>` and must call `onComplete()`
- Use the `typewriterEffect()` helper for animated text
- Commands are automatically available for tab autocomplete
- The `clear` command is special - it doesn't print the prompt after execution

## Examples

See existing commands for examples:
- `help.ts` - Simple synchronous command
- `about.ts` - Async command with typewriter effect
- `skills.ts` - ASCII table formatting
- `echo.ts` - Command with arguments
