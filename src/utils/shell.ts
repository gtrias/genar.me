export interface CommandResult {
  output: string;
  exitCode: number;
  websocketUrl?: string; // If set, indicates WebSocket connection should be initiated
}

/**
 * Creates a clickable hyperlink in the terminal using OSC 8 escape sequences
 * This is the official xterm.js way to create clickable links
 */
function createHyperlink(url: string, text: string): string {
  return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Map<string, FileSystemNode>;
}

class Shell {
  private currentPath: string[] = ['home', 'genar'];
  private history: string[] = [];
  private historyIndex: number = -1;
  private fileSystem: FileSystemNode;

  constructor() {
    this.fileSystem = this.createDefaultFileSystem();
  }

  private createDefaultFileSystem(): FileSystemNode {
    const root: FileSystemNode = {
      name: '/',
      type: 'directory',
      children: new Map(),
    };

    // Create some example directories and files
    const home: FileSystemNode = { name: 'home', type: 'directory', children: new Map() };
    const genar: FileSystemNode = { name: 'genar', type: 'directory', children: new Map() };
    const projects: FileSystemNode = { name: 'projects', type: 'directory', children: new Map() };
    const work: FileSystemNode = { name: 'work', type: 'directory', children: new Map() };
    const articles: FileSystemNode = { name: 'articles', type: 'directory', children: new Map() };

    if (genar.children) {
      genar.children.set('projects', projects);
      genar.children.set('work', work);
      genar.children.set('articles', articles);
    }
    if (home.children) {
      home.children.set('genar', genar);
    }
    if (root.children) {
      root.children.set('home', home);
      root.children.set('etc', {
        name: 'etc',
        type: 'directory',
        children: new Map(),
      });
      root.children.set('usr', {
        name: 'usr',
        type: 'directory',
        children: new Map(),
      });
    }

    return root;
  }

  private getCurrentDirectory(): FileSystemNode {
    let current = this.fileSystem;
    for (const segment of this.currentPath) {
      const next = current.children?.get(segment);
      if (!next || next.type !== 'directory') {
        return this.fileSystem; // Fallback to root if path invalid
      }
      current = next;
    }
    return current;
  }

  getPrompt(): string {
    const path = this.currentPath.length === 0 ? '/' : '/' + this.currentPath.join('/');
    return `genar@terminal:${path}$ `;
  }

  addToHistory(command: string): void {
    if (command.trim() && command !== this.history[this.history.length - 1]) {
      this.history.push(command);
    }
    this.historyIndex = this.history.length;
  }

  getHistory(direction: 'up' | 'down'): string | null {
    if (this.history.length === 0) return null;

    if (direction === 'up') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        return this.history[this.historyIndex];
      }
      return this.history[this.historyIndex];
    } else {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        return this.history[this.historyIndex];
      }
      this.historyIndex = this.history.length;
      return '';
    }
  }

  executeCommand(input: string): CommandResult {
    const trimmed = input.trim();
    if (!trimmed) {
      return { output: '', exitCode: 0 };
    }

    this.addToHistory(trimmed);
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        return this.help();
      case 'clear':
        return { output: '\x1b[2J\x1b[H', exitCode: 0 }; // ANSI clear screen
      case 'ls':
        return this.ls(args);
      case 'cd':
        return this.cd(args);
      case 'pwd':
        return this.pwd();
      case 'cat':
        return this.cat(args);
      case 'echo':
        return this.echo(args);
      case 'whoami':
        return { output: 'genar\n', exitCode: 0 };
      case 'date':
        return { output: new Date().toString() + '\n', exitCode: 0 };
      case 'history':
        return this.showHistory();
      case 'ssh':
        return this.ssh(args);
      case 'exit':
        return { output: 'Goodbye!\n', exitCode: 0 };
      default:
        return {
          output: `Command not found: ${command}. Type 'help' for available commands.\n`,
          exitCode: 1,
        };
    }
  }

  private help(): CommandResult {
    const helpText = `
Available commands:
  help          - Show this help message
  clear         - Clear the terminal screen
  ls [dir]      - List directory contents
  cd [dir]      - Change directory
  pwd           - Print working directory
  cat [file]    - Display file contents
  echo [text]   - Print text to terminal
  whoami        - Display current user
  date          - Display current date and time
  history       - Show command history
  ssh [url]     - Connect to SSH server via WebSocket
  exit          - Exit the terminal

Use arrow keys to navigate command history.
`;
    return { output: helpText, exitCode: 0 };
  }

  private ls(args: string[]): CommandResult {
    const targetPath = args[0];
    let targetDir = this.getCurrentDirectory();

    if (targetPath) {
      const resolved = this.resolvePath(targetPath);
      if (!resolved || resolved.type !== 'directory') {
        return { output: `ls: cannot access '${targetPath}': No such file or directory\n`, exitCode: 1 };
      }
      targetDir = resolved;
    }

    if (!targetDir.children || targetDir.children.size === 0) {
      return { output: '', exitCode: 0 };
    }

    const entries = Array.from(targetDir.children.values())
      .map(node => {
        const suffix = node.type === 'directory' ? '/' : '';
        return node.name + suffix;
      })
      .sort()
      .join('  ');

    return { output: entries + '\n', exitCode: 0 };
  }

  private cd(args: string[]): CommandResult {
    const target = args[0] || '/';
    
    if (target === '/') {
      this.currentPath = [];
      return { output: '', exitCode: 0 };
    }

    if (target === '..') {
      if (this.currentPath.length > 0) {
        this.currentPath.pop();
      }
      return { output: '', exitCode: 0 };
    }

    if (target.startsWith('/')) {
      // Absolute path
      const segments = target.split('/').filter(s => s);
      this.currentPath = [];
      for (const segment of segments) {
        const result = this.cd([segment]);
        if (result.exitCode !== 0) {
          return result;
        }
      }
      return { output: '', exitCode: 0 };
    }

    // Relative path
    const currentDir = this.getCurrentDirectory();
    const targetNode = currentDir.children?.get(target);
    
    if (!targetNode) {
      return { output: `cd: no such file or directory: ${target}\n`, exitCode: 1 };
    }

    if (targetNode.type !== 'directory') {
      return { output: `cd: not a directory: ${target}\n`, exitCode: 1 };
    }

    this.currentPath.push(target);
    return { output: '', exitCode: 0 };
  }

  private resolvePath(path: string): FileSystemNode | null {
    if (path === '/') {
      return this.fileSystem;
    }

    const segments = path.startsWith('/')
      ? path.split('/').filter(s => s)
      : [...this.currentPath, ...path.split('/').filter(s => s)];

    let current = this.fileSystem;
    for (const segment of segments) {
      if (segment === '..') {
        if (this.currentPath.length > 0) {
          // This is a simplified version - in a real implementation, we'd track the path
          return null;
        }
        continue;
      }
      if (segment === '.') {
        continue;
      }
      const next = current.children?.get(segment);
      if (!next) {
        return null;
      }
      current = next;
    }
    return current;
  }

  private pwd(): CommandResult {
    const path = this.currentPath.length === 0 ? '/' : '/' + this.currentPath.join('/');
    return { output: path + '\n', exitCode: 0 };
  }

  private cat(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'cat: missing file operand\n', exitCode: 1 };
    }

    const filename = args[0];
    const currentDir = this.getCurrentDirectory();
    const file = currentDir.children?.get(filename);

    if (!file) {
      return { output: `cat: ${filename}: No such file or directory\n`, exitCode: 1 };
    }

    if (file.type !== 'file') {
      return { output: `cat: ${filename}: Is a directory\n`, exitCode: 1 };
    }

    return { output: (file.content || '') + '\n', exitCode: 0 };
  }

  private echo(args: string[]): CommandResult {
    return { output: args.join(' ') + '\n', exitCode: 0 };
  }

  private showHistory(): CommandResult {
    if (this.history.length === 0) {
      return { output: '', exitCode: 0 };
    }
    const historyText = this.history
      .map((cmd, idx) => `${idx + 1}  ${cmd}`)
      .join('\n');
    return { output: historyText + '\n', exitCode: 0 };
  }

  private ssh(args: string[]): CommandResult {
    // Default production WebSocket URL (to be set manually)
    const DEFAULT_WS_URL = 'ws://localhost:8080/ws';
    
    // Parse URL from arguments or use default
    const url = args.length > 0 ? args[0] : DEFAULT_WS_URL;
    
    // Validate URL format
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      return {
        output: `ssh: Invalid WebSocket URL. Must start with ws:// or wss://\n`,
        exitCode: 1,
      };
    }
    
    return {
      output: `Connecting to ${url}...\n`,
      exitCode: 0,
      websocketUrl: url,
    };
  }

  getBanner(): string {
    const github = createHyperlink('https://www.github.com/gtrias', 'GitHub');
    const gitlab = createHyperlink('https://gitlab.com/gtrias', 'GitLab');
    const linkedin = createHyperlink('http://www.linkedin.com/pub/genar-trias-ortiz/9/592/b90', 'LinkedIn');
    const twitter = createHyperlink('https://twitter.com/genar_tr', '@genar_tr');
    const docker = createHyperlink('https://hub.docker.com/u/gtrias/', 'Docker Hub');
    const stackoverflow = createHyperlink('https://stackoverflow.com/users/865222/genar', 'StackOverflow');
    const steam = createHyperlink('http://steamcommunity.com/id/genar_tr/', 'Steam');

    return `
╔═══════════════════════════════════════════════════╗
║                                                   ║
║      ██████╗ ███████╗███╗   ██╗ █████╗ ██████╗    ║
║     ██╔════╝ ██╔════╝████╗  ██║██╔══██╗██╔══██╗   ║
║     ██║  ███╗█████╗  ██╔██╗ ██║███████║██████╔╝   ║
║     ██║   ██║██╔══╝  ██║╚██╗██║██╔══██║██╔══██╗   ║
║     ╚██████╔╝███████╗██║ ╚████║██║  ██║██║  ██║   ║
║      ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝   ║
║                                                   ║
║         Welcome to My personal computer           ║
║                                                   ║
║  Type 'help' to see available commands            ║
║  Use arrow keys to navigate command history       ║
║                                                   ║
║  Links:                                           ║
║    • ${github}                                       ║
║    • ${gitlab}                                       ║
║    • ${linkedin}                                     ║
║    • ${twitter}                                    ║
║    • ${docker}                                   ║
║    • ${stackoverflow}                                ║
║    • ${steam}                                        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝

`;
  }
}

export default Shell;

