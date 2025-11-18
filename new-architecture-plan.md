# Local-First Virtual Terminal Architecture Plan

## Vision

Create a fully-functional virtual bash terminal experience that runs entirely in the browser, featuring:
- Real bash-like shell with proper filesystem
- Mix of JavaScript and WASM commands
- Persistent local storage using OPFS + LiveStore
- Charm.land-inspired beautiful UI components
- Progressive enhancement toward multi-device sync and SSH access

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Pure Local-First)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Terminal Layer (xterm.js)                  │    │
│  │  - CRT effects (current aesthetic)                      │    │
│  │  - Input handling & command parsing                     │    │
│  │  - ANSI rendering                                       │    │
│  └──────────────┬─────────────────────────────────────────┘    │
│                 │                                                │
│  ┌──────────────▼──────────────────────────────────────────┐   │
│  │           Command Router & Shell Runtime                 │   │
│  │  - Bash-like prompt (PS1, PWD, ENV vars)                │   │
│  │  - Command parsing (pipes, redirects, globs)            │   │
│  │  - Process management (background jobs, Ctrl+C)         │   │
│  │  - History & autocomplete                               │   │
│  └──────────┬────────────────────────┬─────────────────────┘   │
│             │                        │                          │
│    ┌────────▼────────┐      ┌───────▼──────────┐              │
│    │  JS Commands    │      │  WASM Commands   │              │
│    │  (Built-in)     │      │  (wasm-webterm)  │              │
│    ├─────────────────┤      ├──────────────────┤              │
│    │ cd, pwd, echo   │      │ ls, cat, vim     │              │
│    │ help, about     │      │ python, git      │              │
│    │ portfolio       │      │ make, grep       │              │
│    │ fortune         │      │ (future)         │              │
│    └────────┬────────┘      └───────┬──────────┘              │
│             │                       │                          │
│  ┌──────────▼───────────────────────▼─────────────────────┐   │
│  │              Virtual Filesystem (VFS)                    │   │
│  │  - Path resolution (/home/guest, /usr/bin, etc.)       │   │
│  │  - File operations (read, write, stat, chmod)          │   │
│  │  - Directory tree navigation                            │   │
│  │  - Symlinks, permissions (simulated)                   │   │
│  └──────────┬───────────────────────────────────────────────┘  │
│             │                                                   │
│  ┌──────────▼────────────────────────────────────────────┐    │
│  │                Storage Layer (Dual)                    │    │
│  │                                                         │    │
│  │  ┌─────────────────┐       ┌─────────────────────┐   │    │
│  │  │ OPFS (File Data)│       │ LiveStore (Metadata)│   │    │
│  │  ├─────────────────┤       ├─────────────────────┤   │    │
│  │  │ - Actual file   │       │ - Event log         │   │    │
│  │  │   contents      │       │ - User progress     │   │    │
│  │  │ - Binary data   │       │ - Command history   │   │    │
│  │  │ - Fast I/O      │       │ - Achievements      │   │    │
│  │  │                 │       │ - Sessions          │   │    │
│  │  └─────────────────┘       └─────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              UI Components (Charm-inspired)               │  │
│  │  - ANSI formatters (boxes, colors, tables)               │  │
│  │  - Interactive widgets (forms, menus, progress)          │  │
│  │  - Typewriter effects                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Shell Runtime (Core Brain)

The shell runtime manages the entire terminal session state and execution context.

```typescript
class ShellRuntime {
  // Environment
  env: Map<string, string>          // PATH, HOME, USER, etc.
  cwd: string                       // Current directory
  history: string[]                 // Command history
  aliases: Map<string, string>      // Bash aliases

  // State
  lastExitCode: number              // $?
  processes: Process[]              // Background jobs

  // Filesystem
  vfs: VirtualFileSystem

  // Execution
  async execute(commandLine: string): Promise<void>
  parseCommand(line: string): Command // Handle pipes, redirects
  resolveCommand(name: string): Command | null
}
```

**Key Features:**
- Environment variable support (`$HOME`, `$PATH`, `$USER`)
- Command history with persistence
- Exit code tracking (`$?`)
- Alias support
- Path resolution
- Process management (future: background jobs)

### 2. Virtual Filesystem (OPFS + LiveStore)

A complete POSIX-like filesystem that persists to browser storage.

```typescript
interface VirtualFileSystem {
  // Core operations
  readFile(path: string): Promise<Uint8Array>
  writeFile(path: string, data: Uint8Array): Promise<void>
  mkdir(path: string): Promise<void>
  readdir(path: string): Promise<DirEntry[]>
  stat(path: string): Promise<FileStat>
  chmod(path: string, mode: number): Promise<void>

  // Advanced
  symlink(target: string, path: string): Promise<void>
  resolve(path: string): string // Handle ~, ., .., symlinks
}
```

**Directory Structure:**
```
/
├── home/
│   └── guest/
│       ├── .bashrc              # Shell configuration
│       ├── .bash_history        # Command history
│       ├── welcome.txt          # Welcome message
│       ├── projects/            # Portfolio projects
│       │   ├── project1/
│       │   │   ├── README.md
│       │   │   └── src/
│       │   └── project2/
│       └── achievements.json    # User progress
├── usr/
│   ├── bin/                     # WASM binaries
│   │   ├── ls.wasm
│   │   ├── cat.wasm
│   │   └── vim.wasm
│   └── share/
│       └── fortunes/            # Fortune quotes
└── tmp/                         # Ephemeral (not persisted)
```

**Storage Strategy:**
- **Small files (<1MB)**: Store in LiveStore SQLite
- **Large files (>1MB)**: Store in OPFS
- **Metadata**: Always in LiveStore for queryability
- **Temp files**: In-memory only (not persisted)

### 3. LiveStore Schema

Event-sourced data model for tracking all user interactions and state.

```typescript
// Events (append-only log)
events:
  - command_executed    { cmd, args, cwd, timestamp, exit_code }
  - file_created        { path, size, timestamp }
  - file_modified       { path, timestamp }
  - file_deleted        { path, timestamp }
  - directory_changed   { from, to, timestamp }
  - achievement_earned  { id, name, timestamp }
  - session_started     { timestamp, user_agent }
  - session_ended       { timestamp, duration }
  - help_viewed         { section, timestamp }
  - portfolio_viewed    { project, timestamp }

// Materialized views (derived from events)
user_progress:
  - total_commands: number
  - unique_commands: string[]
  - files_created: number
  - files_modified: number
  - achievements: Achievement[]
  - first_visit: timestamp
  - last_visit: timestamp
  - total_sessions: number

filesystem_metadata:
  - path: string
  - type: 'file' | 'directory' | 'symlink'
  - size: number
  - created: timestamp
  - modified: timestamp
  - permissions: string
  - storage_backend: 'livestore' | 'opfs' | 'memory'
  - mime_type: string

command_history:
  - id: number
  - command: string
  - timestamp: timestamp
  - cwd: string
  - exit_code: number
  - duration_ms: number

achievements:
  - id: string
  - name: string
  - description: string
  - earned: boolean
  - earned_at: timestamp | null
  - category: string
```

**Achievement Examples:**
- `first_command` - Run your first command
- `explorer` - Visit 10 different directories
- `reader` - Read 5 different files
- `creator` - Create your first file
- `rtfm` - Read the help documentation
- `portfolio_viewer` - View all projects
- `power_user` - Run 100 commands
- `vim_warrior` - Use vim (future)

### 4. Command System (Hybrid JS + WASM)

Dual command system supporting both built-in JavaScript commands and WASM binaries.

```typescript
interface Command {
  name: string
  type: 'builtin' | 'wasm'
  description?: string
  usage?: string
  category: 'system' | 'portfolio' | 'filesystem' | 'utility'
  execute(args: string[], context: CommandContext): Promise<number>
}

interface CommandContext {
  terminal: Terminal          // xterm.js instance
  shell: ShellRuntime        // Runtime environment
  vfs: VirtualFileSystem     // Filesystem access
  livestore: LiveStore       // Database access
  stdin: ReadableStream      // Standard input
  stdout: WritableStream     // Standard output
  stderr: WritableStream     // Standard error
}
```

**Built-in JavaScript Commands:**

```typescript
const builtins: Record<string, Command> = {
  // Navigation
  cd: {
    name: 'cd',
    type: 'builtin',
    description: 'Change directory',
    usage: 'cd [directory]',
    category: 'filesystem',
    execute: async (args, ctx) => {
      // Change current working directory
      // Support: ~, -, .., relative/absolute paths
    }
  },

  pwd: {
    name: 'pwd',
    description: 'Print working directory',
    execute: async (args, ctx) => {
      ctx.stdout.write(ctx.shell.cwd + '\n')
      return 0
    }
  },

  // Output
  echo: {
    name: 'echo',
    description: 'Display text',
    usage: 'echo [text...]',
    execute: async (args, ctx) => {
      ctx.stdout.write(args.join(' ') + '\n')
      return 0
    }
  },

  // Portfolio commands
  help: {
    name: 'help',
    description: 'Show available commands',
    category: 'system',
    execute: async (args, ctx) => {
      // Beautiful Charm-inspired help menu
      // Show commands grouped by category
      // Interactive navigation if args.length === 0
    }
  },

  about: {
    name: 'about',
    description: 'Learn about Genar',
    category: 'portfolio',
    execute: async (args, ctx) => {
      // Show bio, skills, experience
      // Charm-inspired formatting
    }
  },

  portfolio: {
    name: 'portfolio',
    description: 'View projects',
    category: 'portfolio',
    execute: async (args, ctx) => {
      // Interactive project browser
      // Arrow keys to navigate
      // Enter to view details
    }
  },

  contact: {
    name: 'contact',
    description: 'Get in touch',
    category: 'portfolio',
    execute: async (args, ctx) => {
      // Display contact information
      // Email, GitHub, LinkedIn, etc.
    }
  },

  fortune: {
    name: 'fortune',
    description: 'Display random quote',
    category: 'utility',
    execute: async (args, ctx) => {
      // Random quote from /usr/share/fortunes
    }
  },

  achievements: {
    name: 'achievements',
    description: 'View your achievements',
    category: 'system',
    execute: async (args, ctx) => {
      // Query LiveStore for user progress
      // Display earned achievements with timestamps
      // Show locked achievements
    }
  },

  history: {
    name: 'history',
    description: 'Show command history',
    category: 'system',
    execute: async (args, ctx) => {
      // Display numbered command history
    }
  },

  clear: {
    name: 'clear',
    description: 'Clear the terminal',
    category: 'system',
    execute: async (args, ctx) => {
      ctx.terminal.clear()
      return 0
    }
  },

  uname: {
    name: 'uname',
    description: 'Print system information',
    usage: 'uname [-a]',
    category: 'system',
    execute: async (args, ctx) => {
      if (args.includes('-a')) {
        ctx.stdout.write(
          'Linux genar-terminal 6.1.0-charm #1 SMP PREEMPT_DYNAMIC ' +
          new Date().toISOString().split('T')[0] + '\n' +
          'Architecture: wasm64\n'
        )
      } else {
        ctx.stdout.write('Linux\n')
      }
      return 0
    }
  }
}
```

**WASM Commands (via wasm-webterm):**

```typescript
const wasmCommands: Record<string, string> = {
  ls: '/usr/bin/ls.wasm',           // List directory contents
  cat: '/usr/bin/cat.wasm',         // Concatenate and display files
  grep: '/usr/bin/grep.wasm',       // Search text patterns (future)
  vim: '/usr/bin/vim.wasm',         // Text editor (future)
  nano: '/usr/bin/nano.wasm',       // Simple text editor (future)
  python: '/usr/bin/python.wasm',   // Python interpreter (future)
  node: '/usr/bin/node.wasm',       // Node.js runtime (future)
  git: '/usr/bin/git.wasm',         // Version control (future)
}
```

### 5. Charm-Inspired UI Library

Beautiful ANSI-based UI components inspired by Charm's Lip Gloss and Bubble Tea.

```typescript
// ANSI color helpers
const colors = {
  // Cyberpunk palette
  cyan: (text: string) => `\x1b[38;2;34;233;216m${text}\x1b[0m`,
  pink: (text: string) => `\x1b[38;2;227;72;128m${text}\x1b[0m`,
  purple: (text: string) => `\x1b[38;2;139;92;246m${text}\x1b[0m`,

  // Standard colors
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,

  // Styles
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
  italic: (text: string) => `\x1b[3m${text}\x1b[0m`,
  underline: (text: string) => `\x1b[4m${text}\x1b[0m`,
}

// Box drawing (Lip Gloss inspired)
interface BoxOptions {
  title?: string
  borderColor?: string
  borderStyle?: 'single' | 'double' | 'rounded' | 'bold'
  padding?: number
  width?: number
}

function box(content: string, options: BoxOptions = {}): string {
  const { borderStyle = 'rounded', borderColor = 'cyan' } = options

  const borders = {
    rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
    single:  { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
    double:  { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
    bold:    { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  }

  // Build bordered box with content
  // Apply colors and padding
  // Return formatted string
}

// Table rendering
interface TableOptions {
  headers: string[]
  rows: string[][]
  columnWidths?: number[]
  headerColor?: string
  borderColor?: string
}

function table(options: TableOptions): string {
  // Render formatted table with headers
  // Auto-calculate column widths
  // Support colored headers
}

// Progress bar
function progress(current: number, total: number, width: number = 40): string {
  const percent = Math.floor((current / total) * 100)
  const filled = Math.floor((current / total) * width)
  const empty = width - filled

  return `[${colors.cyan('█'.repeat(filled))}${'░'.repeat(empty)}] ${percent}%`
}

// Interactive menu (Bubble Tea inspired)
interface MenuOptions {
  title?: string
  items: MenuItem[]
  onSelect: (item: MenuItem) => void
  onCancel?: () => void
}

interface MenuItem {
  label: string
  description?: string
  value: any
}

class InteractiveMenu {
  // Arrow key navigation
  // Enter to select
  // ESC to cancel
  // Render with highlighted selection
}

// Form input
interface FormField {
  name: string
  label: string
  type: 'text' | 'password' | 'select' | 'confirm'
  required?: boolean
  options?: string[] // For select type
  validate?: (value: string) => boolean
}

class InteractiveForm {
  // Multi-field input
  // Tab to navigate fields
  // Validation
  // Submit callback
}

// Spinner/Loading
const spinners = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['|', '/', '-', '\\'],
  arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
}

class Spinner {
  // Animated loading indicator
  // async operation support
}
```

## Initial User Experience Flow

```bash
# 1. BIOS Boot Sequence (existing)
POST: Memory Test............... [  OK  ]
POST: CPU Check................. [  OK  ]
POST: Storage................... [  OK  ]
Initializing kernel...
Loading modules...
Starting services...

# 2. System Banner
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        ██████╗ ███████╗███╗   ██╗ █████╗ ██████╗        ║
║       ██╔════╝ ██╔════╝████╗  ██║██╔══██╗██╔══██╗       ║
║       ██║  ███╗█████╗  ██╔██╗ ██║███████║██████╔╝       ║
║       ██║   ██║██╔══╝  ██║╚██╗██║██╔══██║██╔══██╗       ║
║       ╚██████╔╝███████╗██║ ╚████║██║  ██║██║  ██║       ║
║        ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

Linux genar-terminal 6.1.0-charm #1 SMP PREEMPT_DYNAMIC 2025-11-18
Architecture: wasm64

# 3. Fortune/Quote
┌──────────────────────────────────────────────────────────┐
│ "The best way to predict the future is to invent it."   │
│                                        - Alan Kay        │
└──────────────────────────────────────────────────────────┘

# 4. First-time welcome
Welcome to Genar's interactive portfolio terminal!

This is a fully-functional bash-like shell running in your browser.
Your session is private and all data is stored locally.

Type 'help' to see available commands or start exploring!

# 5. Interactive Prompt
guest@genar:~$ █

# User types 'help'
guest@genar:~$ help

╔══════════════════════════════════════════════════════════╗
║              Available Commands                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Portfolio:                                              ║
║    about          Learn about me                         ║
║    portfolio      View my projects                       ║
║    contact        Get in touch                           ║
║                                                          ║
║  Navigation:                                             ║
║    cd [dir]       Change directory                       ║
║    ls [path]      List directory contents                ║
║    pwd            Print working directory                ║
║    cat [file]     Display file contents                  ║
║                                                          ║
║  System:                                                 ║
║    help           Show this message                      ║
║    clear          Clear the screen                       ║
║    history        Show command history                   ║
║    achievements   View your progress                     ║
║    fortune        Random inspirational quote             ║
║                                                          ║
║  Try:                                                    ║
║    cd projects && ls                                     ║
║    cat welcome.txt                                       ║
║    about                                                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

# User explores filesystem
guest@genar:~$ ls
projects/  welcome.txt  achievements.json

guest@genar:~$ cat welcome.txt
[Beautiful formatted welcome message with your bio]

guest@genar:~$ cd projects

guest@genar:~/projects$ ls
project1/  project2/  project3/

guest@genar:~/projects$ cd project1

guest@genar:~/projects/project1$ cat README.md
[Project description and details]

# Interactive portfolio command
guest@genar:~$ portfolio

╔══════════════════════════════════════════════════════════╗
║                    My Projects                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  > Project 1 - Description here                          ║
║    Project 2 - Description here                          ║
║    Project 3 - Description here                          ║
║                                                          ║
║  Use ↑↓ arrows to navigate, Enter to view details       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Working bash-like shell with basic filesystem

- [ ] **Shell Runtime**
  - [ ] Create `ShellRuntime` class
  - [ ] Environment variables (HOME, USER, PATH, PWD)
  - [ ] Command history storage
  - [ ] Exit code tracking ($?)
  - [ ] Basic command parsing

- [ ] **Virtual Filesystem**
  - [ ] In-memory VFS implementation
  - [ ] Path resolution (absolute, relative, ~)
  - [ ] Basic operations: readFile, writeFile, mkdir, readdir, stat
  - [ ] Pre-populated directory structure

- [ ] **Basic Commands**
  - [ ] cd - Change directory
  - [ ] pwd - Print working directory
  - [ ] ls - List directory (JS implementation)
  - [ ] cat - Display file contents
  - [ ] echo - Output text
  - [ ] clear - Clear screen
  - [ ] help - Show help

- [ ] **OPFS Integration**
  - [ ] Persist filesystem to OPFS
  - [ ] Load filesystem on startup
  - [ ] Save on file modifications

- [ ] **LiveStore Setup**
  - [ ] Initialize LiveStore
  - [ ] Define event schema
  - [ ] Log command_executed events
  - [ ] Basic materialized views

**Deliverable:** Working terminal with persistent filesystem and basic commands

### Phase 2: UI Enhancement (Week 2-3)

**Goal:** Beautiful Charm-inspired interface

- [ ] **ANSI UI Library**
  - [ ] Color helpers (cyberpunk palette)
  - [ ] Box drawing function
  - [ ] Table renderer
  - [ ] Progress bar component
  - [ ] Text formatting utilities

- [ ] **Enhanced Commands**
  - [ ] help - Beautiful formatted help with boxes
  - [ ] about - Formatted bio with colors
  - [ ] portfolio - Interactive project browser
  - [ ] contact - Formatted contact info
  - [ ] fortune - Random quotes from file
  - [ ] achievements - Progress display

- [ ] **LiveStore Events**
  - [ ] Track all event types
  - [ ] Achievement system logic
  - [ ] Command history with metadata
  - [ ] User progress tracking

- [ ] **Interactive Components**
  - [ ] Arrow key navigation for menus
  - [ ] Interactive menu component
  - [ ] Form input component (future)

- [ ] **Content Population**
  - [ ] Create portfolio content files
  - [ ] Write bio/about content
  - [ ] Add project READMEs
  - [ ] Fortune quotes database

**Deliverable:** Beautiful, interactive portfolio terminal with rich content

### Phase 3: WASM Integration (Week 3-4)

**Goal:** Real Unix commands via WebAssembly

- [ ] **wasm-webterm Setup**
  - [ ] Integrate wasm-webterm addon
  - [ ] Configure WASM binary loading
  - [ ] Connect to VFS

- [ ] **WASM Commands**
  - [ ] Compile/obtain ls.wasm
  - [ ] Compile/obtain cat.wasm
  - [ ] Test WASM execution
  - [ ] Handle WASI filesystem mapping

- [ ] **Command Router Update**
  - [ ] Detect WASM vs JS commands
  - [ ] Route to appropriate executor
  - [ ] Handle stdin/stdout properly

- [ ] **Text Editor** (stretch goal)
  - [ ] Integrate nano.wasm or vim.wasm
  - [ ] Test file editing
  - [ ] Persist changes to VFS

**Deliverable:** Hybrid shell with both JS and WASM commands

### Phase 4: Advanced Shell Features (Week 4+)

**Goal:** Full bash-like functionality

- [ ] **Command Parsing**
  - [ ] Pipes: `ls | grep foo`
  - [ ] Redirects: `echo "hello" > file.txt`
  - [ ] Command chaining: `cd projects && ls`
  - [ ] Background jobs: `long-command &`

- [ ] **Tab Completion**
  - [ ] Command name completion
  - [ ] Filepath completion
  - [ ] Smart context-aware completion

- [ ] **Process Management**
  - [ ] Ctrl+C to interrupt
  - [ ] Ctrl+Z to suspend
  - [ ] bg/fg commands
  - [ ] jobs command

- [ ] **Advanced Commands**
  - [ ] grep (search in files)
  - [ ] find (search filesystem)
  - [ ] alias (command aliases)
  - [ ] export (environment variables)

- [ ] **Shell Scripts**
  - [ ] .bashrc execution on startup
  - [ ] Execute .sh files
  - [ ] Basic bash scripting support

**Deliverable:** Feature-complete bash-like shell

### Phase 5: Multi-Device Sync (Future)

**Goal:** Optional cloud sync for multi-device access

- [ ] **Cloudflare Worker Backend**
  - [ ] WebSocket server with Durable Objects
  - [ ] Session management
  - [ ] Event log sync
  - [ ] Conflict resolution

- [ ] **Sync Protocol**
  - [ ] LiveStore event replication
  - [ ] Filesystem sync
  - [ ] Offline-first operation
  - [ ] Merge strategies

- [ ] **Authentication** (optional)
  - [ ] Guest mode (default, local-only)
  - [ ] Sign in (email, OAuth)
  - [ ] Multi-device session management

**Deliverable:** Sync-enabled terminal accessible across devices

### Phase 6: SSH Access (Future)

**Goal:** Native SSH access to same terminal

- [ ] **SSH Server**
  - [ ] Dedicated VPS or Cloudflare tunnel
  - [ ] SSH daemon setup
  - [ ] Connect to same backend as web

- [ ] **Unified Backend**
  - [ ] Share VFS/LiveStore between web and SSH
  - [ ] Session management
  - [ ] User isolation

- [ ] **Cool Factor**
  - [ ] `ssh genar.me` works!
  - [ ] Same experience in terminal and browser
  - [ ] Business card with SSH command

**Deliverable:** Full SSH access to portfolio terminal

## Technical Stack

### Core Technologies
- **Astro 5.15+** - Static site framework (existing)
- **xterm.js** - Terminal emulator (existing)
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Styling (existing)

### New Libraries
- **LiveStore** - Event-sourced SQLite database for browser
- **wasm-webterm** - WASM execution in xterm.js
- **OPFS** - Origin Private File System API (native browser)

### Future Backend (Optional)
- **Cloudflare Workers + Durable Objects** - WebSocket sync server
- **Hono** - Lightweight web framework for Workers

## File Structure

```
src/
├── terminal/
│   ├── runtime/
│   │   ├── ShellRuntime.ts        # Main shell runtime
│   │   ├── CommandParser.ts       # Parse command lines
│   │   ├── Environment.ts         # Environment variables
│   │   └── ProcessManager.ts      # Process management
│   ├── filesystem/
│   │   ├── VirtualFileSystem.ts   # VFS interface
│   │   ├── OPFSBackend.ts        # OPFS storage backend
│   │   ├── LiveStoreBackend.ts   # LiveStore storage backend
│   │   ├── MemoryBackend.ts      # In-memory storage
│   │   └── FileTree.ts           # Directory tree structure
│   ├── commands/
│   │   ├── types.ts              # Command interfaces
│   │   ├── index.ts              # Command registry
│   │   ├── builtins/             # JS built-in commands
│   │   │   ├── cd.ts
│   │   │   ├── ls.ts
│   │   │   ├── cat.ts
│   │   │   ├── help.ts
│   │   │   ├── about.ts
│   │   │   ├── portfolio.ts
│   │   │   └── ...
│   │   └── wasm/                 # WASM command wrappers
│   │       ├── ls.ts
│   │       └── cat.ts
│   ├── ui/
│   │   ├── ansi.ts               # ANSI escape codes
│   │   ├── colors.ts             # Color helpers
│   │   ├── box.ts                # Box drawing
│   │   ├── table.ts              # Table rendering
│   │   ├── progress.ts           # Progress bars
│   │   ├── menu.ts               # Interactive menus
│   │   ├── form.ts               # Interactive forms
│   │   └── spinner.ts            # Loading spinners
│   ├── storage/
│   │   ├── LiveStoreSchema.ts    # LiveStore schema definition
│   │   ├── LiveStoreClient.ts    # LiveStore wrapper
│   │   └── achievements.ts       # Achievement logic
│   └── wasm/
│       ├── WasmRunner.ts         # WASM execution wrapper
│       └── binaries/             # WASM binary files
│           ├── ls.wasm
│           └── cat.wasm
├── components/
│   └── Terminal.astro            # Main terminal component (enhanced)
├── pages/
│   └── index.astro               # Homepage
└── content/
    ├── about.md                  # About content
    ├── projects/                 # Project descriptions
    │   ├── project1.md
    │   └── project2.md
    └── fortunes.txt              # Fortune quotes
```

## Open Questions

### 1. Content
- [ ] What content should be in the `about` command?
- [ ] What projects should be showcased?
- [ ] What contact information to display?
- [ ] What fortune quotes to include?

### 2. Design
- [ ] Should Charm-inspired UI use cyberpunk colors (cyan/pink) or different palette?
- [ ] Should we mix current CRT aesthetic with new UI components?
- [ ] How much color vs monochrome?

### 3. Scope
- [ ] Start with prototype (Phase 1) or build full architecture?
- [ ] Which WASM tools are must-haves for v1?
- [ ] Should we plan for SSH from the start or add later?

### 4. User Experience
- [ ] First-time user tutorial?
- [ ] Achievement notifications?
- [ ] Keyboard shortcuts guide?
- [ ] Mobile support level?

## Success Metrics

**Phase 1:**
- [ ] Terminal boots and shows bash prompt
- [ ] User can navigate filesystem
- [ ] Data persists across page reloads
- [ ] Basic commands work (cd, ls, cat, pwd)

**Phase 2:**
- [ ] Beautiful help command with boxes
- [ ] Interactive portfolio browser
- [ ] Achievement system tracking progress
- [ ] All content populated

**Phase 3:**
- [ ] At least 2 WASM commands working
- [ ] WASM and JS commands coexist
- [ ] File editing possible (stretch)

**Phase 4:**
- [ ] Pipes work: `ls | grep foo`
- [ ] Tab completion functional
- [ ] Shell scripts can execute
- [ ] Feels like real bash

## Next Steps

1. **Answer open questions** (content, design, scope)
2. **Start Phase 1 implementation**
   - Create ShellRuntime class
   - Build in-memory VFS
   - Implement basic commands
3. **Test and iterate**
4. **Move to Phase 2** (UI enhancement)

---

**Note:** This is a living document. Update as architecture evolves and decisions are made.
