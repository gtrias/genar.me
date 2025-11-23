import linksConfig from '../config/links.json';
import { CommandRegistry } from './CommandRegistry';
import type { CommandResult, CommandContext } from '../commands/types';
import type { Terminal } from '@xterm/xterm';

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
  private commandRegistry: CommandRegistry;

  constructor() {
    this.fileSystem = this.createDefaultFileSystem();
    this.commandRegistry = new CommandRegistry();
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

  // Public API for commands to access shell state
  getCurrentDirectory(): FileSystemNode {
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

  getCurrentPath(): string[] {
    return [...this.currentPath]; // Return copy for safety
  }

  setCurrentPath(path: string[]): void {
    this.currentPath = path;
  }

  getFileSystem(): FileSystemNode {
    return this.fileSystem;
  }

  getHistoryList(): string[] {
    return [...this.history]; // Return copy
  }

  getCommandRegistry(): CommandRegistry {
    return this.commandRegistry;
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

  async executeCommand(input: string, terminal?: Terminal): Promise<CommandResult> {
    const trimmed = input.trim();
    if (!trimmed) {
      return { output: '', exitCode: 0 };
    }

    this.addToHistory(trimmed);
    const parts = trimmed.split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const context: CommandContext = {
      shell: this,
      terminal,
    };

    return this.commandRegistry.execute(commandName, args, context);
  }

  async getCompletions(input: string): Promise<string[]> {
    const parts = input.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();

    // Command name completion
    if (parts.length === 1) {
      return this.commandRegistry
        .getCommandNames()
        .filter((name) => name.startsWith(commandName));
    }

    // Argument completion
    const args = parts.slice(1, -1);
    const currentArg = parts[parts.length - 1];

    const context: CommandContext = {
      shell: this,
    };

    return this.commandRegistry.getSuggestions(commandName, args, currentArg, context);
  }

  resolvePath(path: string): FileSystemNode | null {
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


  getBanner(): string {
    // Generate social links dynamically from config
    const socialLinks = linksConfig.social.map((link) => {
      const displayText = link.username || link.name;
      return `║    • ${createHyperlink(link.url, displayText)}`;
    }).join('\n');

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
║  Type 'ssh' to connect to SSH server              ║
║  Use arrow keys to navigate command history       ║
║                                                   ║
║  Links:                                           ║
${socialLinks}
║                                                   ║
╚═══════════════════════════════════════════════════╝

`;
  }
}

export default Shell;

