import { identity } from '../brand/identity.js';
import { projects as brandProjects } from '../brand/projects.js';
import { writingLink } from '../config/links';
import { workFiles } from '../config/workFiles';
import { LOGO } from '../config/logo';
import { CommandRegistry } from './CommandRegistry';
import type { CommandResult, CommandContext } from '../commands/types';
import type { Terminal } from '@xterm/xterm';

interface FileSystemNode {
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

    // Work history files live with the other static config
    for (const [name, content] of Object.entries(workFiles)) {
      work.children?.set(name, { name, type: 'file', content });
    }

    // projects/ and articles/ come from genar-brand, so they match the GitHub profile
    for (const project of brandProjects) {
      const lines = [`# ${project.name}`, '', project.tagline, '', project.url];
      if (project.repo && project.repo !== project.url) lines.push(`Source: ${project.repo}`);
      projects.children?.set(`${project.id}.md`, { name: `${project.id}.md`, type: 'file', content: lines.join('\n') });
    }
    if (writingLink) {
      articles.children?.set('README.md', {
        name: 'README.md',
        type: 'file',
        content: `# Articles\n\nI write at ${writingLink.url}`,
      });
    }

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
    // Show the home directory as ~, like a real shell
    return `genar@terminal:${path.replace(/^\/home\/genar(?=\/|$)/, '~')}$ `;
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

  // Completions for the word before the cursor; each one replaces that whole word.
  // Directories end in '/' so the user can keep completing inside them.
  async getCompletions(input: string): Promise<string[]> {
    const parts = input.trimStart().split(/\s+/);
    const currentArg = parts[parts.length - 1];

    if (parts.length === 1) {
      const prefix = currentArg.toLowerCase();
      return this.commandRegistry.getCommandNames().filter((name) => name.startsWith(prefix));
    }

    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1, -1);
    const context: CommandContext = { shell: this };
    return this.commandRegistry.getSuggestions(commandName, args, currentArg, context);
  }

  completePath(partial: string, want: 'file' | 'directory'): string[] {
    const slash = partial.lastIndexOf('/');
    const dirPart = partial.slice(0, slash + 1);
    const namePart = partial.slice(slash + 1);
    const dir = this.resolvePath(dirPart === '' ? '.' : dirPart);
    if (!dir || dir.type !== 'directory') return [];
    return Array.from(dir.children?.values() || [])
      // Directories always qualify: a file may sit inside one
      .filter((n) => n.name.startsWith(namePart) && (n.type === 'directory' || want === 'file'))
      .map((n) => dirPart + n.name + (n.type === 'directory' ? '/' : ''));
  }

  // Absolute segments for a path typed by the user: handles '/', '.', '..' and trailing slashes
  normalizePath(path: string): string[] {
    const segments = path.startsWith('/') ? [] : [...this.currentPath];
    for (const segment of path.split('/')) {
      if (segment === '..') segments.pop();
      else if (segment && segment !== '.') segments.push(segment);
    }
    return segments;
  }

  resolvePath(path: string): FileSystemNode | null {
    let current = this.fileSystem;
    for (const segment of this.normalizePath(path)) {
      const next = current.children?.get(segment);
      if (!next) return null;
      current = next;
    }
    return current;
  }

  getBanner(): string {
    // Links live on the side panel; the screen only introduces me
    return `
${LOGO.join('\n')}

${identity.intro.join('\n')}

`;
  }
}

export default Shell;

