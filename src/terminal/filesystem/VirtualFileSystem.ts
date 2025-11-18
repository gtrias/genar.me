/**
 * Virtual File System
 * Provides a realistic file system structure for the terminal
 */

export interface VirtualFile {
  name: string;
  type: 'file';
  content: string;
  size: number;
  modified: Date;
  permissions: string;
}

export interface VirtualDirectory {
  name: string;
  type: 'directory';
  children: Map<string, VirtualFile | VirtualDirectory>;
  modified: Date;
  permissions: string;
}

export type VirtualNode = VirtualFile | VirtualDirectory;

export class VirtualFileSystem {
  private root: VirtualDirectory;
  private currentPath: string[];

  constructor() {
    this.root = this.createRootDirectory();
    // Start in home directory
    this.currentPath = ['home', 'guest'];
  }

  private createRootDirectory(): VirtualDirectory {
    const root: VirtualDirectory = {
      name: '/',
      type: 'directory',
      children: new Map(),
      modified: new Date('2025-01-01'),
      permissions: 'rwxr-xr-x'
    };

    // Create home directory structure
    const home = this.createDirectory('home');
    const user = this.createDirectory('guest');
    
    // Add user files and directories
    this.addDirectory(user, 'Documents', this.createDocuments());
    this.addDirectory(user, 'Projects', this.createProjects());
    this.addDirectory(user, 'website', this.createWebsite());
    this.addFile(user, this.createFile('awesome_app', '#!/bin/bash\n\necho "Hello from awesome app!"\necho "This is a cool portfolio application"\n', 'rwxr-xr-x'));
    this.addFile(user, this.createFile('portfolio.json', JSON.stringify({
      name: "Genar",
      role: "Full Stack Developer",
      skills: ["TypeScript", "React", "Node.js", "Astro"],
      projects: [
        { name: "Portfolio Site", tech: ["Astro", "TypeScript"] },
        { name: "Terminal Interface", tech: ["React", "xterm.js"] }
      ]
    }, null, 2), 'rw-r--r--'));
    this.addFile(user, this.createFile('README.md', '# Genar\'s Portfolio\n\nWelcome to my interactive terminal portfolio!\n\n## Available Commands\n- `ls` - List files\n- `cat <file>` - Read file contents\n- `cd <dir>` - Change directory\n- `pwd` - Show current directory\n- `help` - Show all commands\n\n## About\nThis is a virtual terminal showcasing my skills and projects.\n', 'rw-r--r--'));
    this.addFile(user, this.createFile('resume.pdf', '%PDF-1.4\n%Fake PDF content for display purposes\n', 'rw-r--r--'));
    this.addFile(user, this.createFile('todo.txt', '- Finish portfolio terminal\n- Add more interactive features\n- Implement easter eggs\n- Write blog posts\n', 'rw-r--r--'));

    this.addDirectory(home, user);
    this.addDirectory(root, home);

    // Add system files
    this.addFile(root, this.createFile('.bash_logout', '# ~/.bash_logout: executed by bash(1) when login shell exits.\n', 'rw-r--r--'));
    this.addFile(root, this.createFile('.bashrc', '# ~/.bashrc: executed by bash(1) for non-login shells.\n\nexport PS1="\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ "\n', 'rw-r--r--'));
    this.addFile(root, this.createFile('.profile', '# ~/.profile: executed by the command interpreter for login shells.\n', 'rw-r--r--'));
    this.addFile(root, this.createFile('.secret_projects', 'TOP SECRET PROJECTS:\n1. AI-powered coffee maker\n2. Time-traveling debugger\n3. Self-writing code generator\n', 'rw-------'));

    return root;
  }

  private createDocuments(): VirtualDirectory {
    const docs = this.createDirectory('Documents');
    this.addFile(docs, this.createFile('resume.txt', 'GENAR - Full Stack Developer\n\nExperience:\n- 5+ years in web development\n- Expert in TypeScript/JavaScript\n- Strong background in React, Node.js\n- Experience with cloud platforms\n\nEducation:\n- Bachelor\'s in Computer Science\n\nContact:\n- portfolio@example.com\n- github.com/genar\n', 'rw-r--r--'));
    this.addFile(docs, this.createFile('cover_letter.txt', 'Dear Hiring Manager,\n\nI am excited to apply for this position...\n\n[Full cover letter content]\n\nBest regards,\nGenar\n', 'rw-r--r--'));
    return docs;
  }

  private createProjects(): VirtualDirectory {
    const projects = this.createDirectory('Projects');
    const portfolio = this.createDirectory('portfolio-site');
    const terminal = this.createDirectory('terminal-interface');
    
    this.addFile(portfolio, this.createFile('package.json', JSON.stringify({
      name: "genar-portfolio",
      version: "1.0.0",
      scripts: {
        dev: "astro dev",
        build: "astro build",
        preview: "astro preview"
      },
      dependencies: {
        astro: "^4.0.0",
        "@astrojs/tailwind": "^5.0.0"
      }
    }, null, 2), 'rw-r--r--'));
    
    this.addFile(portfolio, this.createFile('README.md', '# Portfolio Site\n\nBuilt with Astro and TypeScript\n\n## Features\n- Terminal interface\n- CRT effects\n- Boot sequence\n- Command system\n', 'rw-r--r--'));

    this.addFile(terminal, this.createFile('Terminal.ts', '// Terminal implementation\nexport class Terminal {\n  constructor() {\n    // Initialize terminal\n  }\n  \n  execute(command: string) {\n    // Execute command\n  }\n}\n', 'rw-r--r--'));
    
    this.addDirectory(projects, portfolio);
    this.addDirectory(projects, terminal);
    return projects;
  }

  private createWebsite(): VirtualDirectory {
    const website = this.createDirectory('website');
    this.addFile(website, this.createFile('index.html', '<!DOCTYPE html>\n<html>\n<head>\n  <title>Genar\'s Portfolio</title>\n</head>\n<body>\n  <h1>Welcome to my portfolio</h1>\n</body>\n</html>\n', 'rw-r--r--'));
    this.addFile(website, this.createFile('style.css', 'body {\n  font-family: monospace;\n  background: #000;\n  color: #0f0;\n  margin: 0;\n  padding: 20px;\n}\n', 'rw-r--r--'));
    return website;
  }

  private createDirectory(name: string): VirtualDirectory {
    return {
      name,
      type: 'directory',
      children: new Map(),
      modified: new Date(),
      permissions: 'rwxr-xr-x'
    };
  }

  private createFile(name: string, content: string, permissions: string = 'rw-r--r--'): VirtualFile {
    return {
      name,
      type: 'file',
      content,
      size: content.length,
      modified: new Date(),
      permissions
    };
  }

  private addDirectory(parent: VirtualDirectory, child: VirtualDirectory): void {
    parent.children.set(child.name, child);
  }

  private addFile(parent: VirtualDirectory, file: VirtualFile): void {
    parent.children.set(file.name, file);
  }

  // Navigation methods
  getCurrentDirectory(): VirtualDirectory {
    return this.traversePath(this.currentPath);
  }

  getCurrentPath(): string {
    return this.currentPath.join('/').replace('//', '/');
  }

  setCurrentPath(path: string[]): boolean {
    const target = this.traversePath(path);
    if (target && target.type === 'directory') {
      this.currentPath = path;
      return true;
    }
    return false;
  }

  resolvePath(path: string): string[] {
    if (path.startsWith('/')) {
      // Absolute path
      return path.split('/').filter(p => p !== '');
    } else {
      // Relative path
      const result = [...this.currentPath];
      const parts = path.split('/').filter(p => p !== '');
      
      for (const part of parts) {
        if (part === '..') {
          result.pop();
        } else if (part !== '.') {
          result.push(part);
        }
      }
      return result;
    }
  }

  private traversePath(path: string[]): VirtualDirectory | null {
    let current = this.root;
    
    for (const part of path) {
      if (part === '' || part === '/') continue;
      
      const child = current.children.get(part);
      if (child && child.type === 'directory') {
        current = child;
      } else {
        return null;
      }
    }
    return current;
  }

  getNode(path: string[]): VirtualNode | null {
    if (path.length === 0) return this.root;
    
    const parentPath = path.slice(0, -1);
    const name = path[path.length - 1];
    const parent = this.traversePath(parentPath);
    
    if (parent) {
      return parent.children.get(name) || null;
    }
    return null;
  }

  // File operations
  listDirectory(path?: string[]): (VirtualFile | VirtualDirectory)[] {
    const dir = path ? this.traversePath(path) : this.getCurrentDirectory();
    if (!dir) return [];
    
    return Array.from(dir.children.values()).sort((a, b) => {
      // Directories first, then files
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  readFile(path: string[]): string | null {
    const node = this.getNode(path);
    if (node && node.type === 'file') {
      return node.content;
    }
    return null;
  }

  createFileAtPath(path: string[], content: string): boolean {
    if (path.length === 0) return false;
    
    const parentPath = path.slice(0, -1);
    const name = path[path.length - 1];
    const parent = this.traversePath(parentPath);
    
    if (parent && !parent.children.has(name)) {
      const file = this.createFile(name, content);
      this.addFile(parent, file);
      return true;
    }
    return false;
  }

  createDirectoryAtPath(path: string[]): boolean {
    if (path.length === 0) return false;
    
    const parentPath = path.slice(0, -1);
    const name = path[path.length - 1];
    const parent = this.traversePath(parentPath);
    
    if (parent && !parent.children.has(name)) {
      const dir = this.createDirectory(name);
      this.addDirectory(parent, dir);
      return true;
    }
    return false;
  }

  /**
   * Serialize filesystem to JSON for persistence
   */
  serialize(): string {
    const serializeNode = (node: VirtualNode): any => {
      // Ensure modified is a valid Date
      const modifiedDate = node.modified instanceof Date && !isNaN(node.modified.getTime())
        ? node.modified
        : new Date();
      
      if (node.type === 'file') {
        return {
          type: 'file',
          name: node.name,
          content: node.content,
          size: node.size,
          modified: modifiedDate.toISOString(),
          permissions: node.permissions
        };
      } else {
        // Ensure children is a valid Map
        const children = node.children instanceof Map ? node.children : new Map();
        return {
          type: 'directory',
          name: node.name,
          modified: modifiedDate.toISOString(),
          permissions: node.permissions,
          children: Array.from(children.values()).map(child => serializeNode(child))
        };
      }
    };

    const data = {
      root: serializeNode(this.root),
      currentPath: this.currentPath
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Deserialize filesystem from JSON
   */
  deserialize(json: string): void {
    const data = JSON.parse(json);
    
    const deserializeNode = (obj: any): VirtualNode => {
      // Helper to safely parse date
      const parseDate = (dateStr: any): Date => {
        if (!dateStr) return new Date();
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? new Date() : date;
      };
      
      if (obj.type === 'file') {
        return {
          type: 'file',
          name: obj.name || '',
          content: obj.content || '',
          size: obj.size || 0,
          modified: parseDate(obj.modified),
          permissions: obj.permissions || 'rw-r--r--'
        };
      } else {
        const dir: VirtualDirectory = {
          type: 'directory',
          name: obj.name || '',
          children: new Map(),
          modified: parseDate(obj.modified),
          permissions: obj.permissions || 'rwxr-xr-x'
        };
        
        if (obj.children && Array.isArray(obj.children)) {
          for (const child of obj.children) {
            const childNode = deserializeNode(child);
            dir.children.set(childNode.name, childNode);
          }
        }
        
        return dir;
      }
    };

    this.root = deserializeNode(data.root) as VirtualDirectory;
    this.currentPath = data.currentPath || ['/'];
  }

  /**
   * Get root directory (for external access)
   */
  getRoot(): VirtualDirectory {
    return this.root;
  }

  /**
   * Set root directory (for loading from storage)
   */
  setRoot(root: VirtualDirectory): void {
    this.root = root;
  }
}
