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

    // Populate work directory with experience files
    if (work.children) {
      work.children.set('README.md', {
        name: 'README.md',
        type: 'file',
        content: `# Work Experience

## Current Position

### Part-Time CTO, Full-Time Builder
**Freelance** | Full-time | Remote
February 2025 - Present

---

## Factorial HR
**Total Duration:** 6 years 4 months

### Senior Staff Software Engineer
August 2022 - February 2025 (2 years 7 months)
**Skills:** Communication

### Director Of Engineering
November 2021 - August 2022 (10 months)
**Skills:** Communication

### Engineering Manager
April 2021 - November 2021 (8 months)
**Location:** Barcelona and surrounding areas
**Skills:** Communication

### Senior Software Engineer
November 2018 - April 2021 (2 years 6 months)
**Location:** Barcelona and surrounding areas
**Skills:** Containerization

---

## Cirici Thinking Digital

### Fullstack Developer
March 2015 - November 2018 (3 years 9 months)
**Location:** Barcelona and surrounding areas
**Skills:** Containerization

---

## Picmedia

### Fullstack Developer
2013 - March 2015 (2 years 3 months)

Development of applications, websites, and layouts. Solution implementation. Server administration.

**Skills:** Containerization

---

## Freelance Work

### Freelance Fullstack Developer
**n/a freelance**
April 2010 - March 2015 (5 years)

Custom WordPress plugin creation, website layouts. Custom web application development. Development in Symfony1.4 and Symfony2

**Skills:** Containerization

---

## Doodigital, productos y servicios digitales SL

### Fullstack Developer
December 2009 - June 2010 (7 months)
**Location:** Granada, Andalusia, Spain

Development of IT solutions related to e-commerce and social networks.

---

## Pymesoft Vallés, s.l.

### Enterprise Technician
November 2007 - February 2008 (4 months)

Systems administrator technician for companies. Repair and implementation of IT solutions.

---

## Doom Informática

### Hardware technician and sysadmin
2006 (Less than 1 year)

Computer equipment repair. Systems administrator.`,
      });

      work.children.set('experience.json', {
        name: 'experience.json',
        type: 'file',
        content: `{
  "_note": "Duration should be calculated from start_date and end_date. null end_date means current/ongoing position.",
  "experience": [
    {
      "title": "Part-Time CTO, Full-Time Builder",
      "company": "Freelance",
      "employment_type": "Full-time",
      "start_date": "2025-02",
      "end_date": null,
      "current": true,
      "location": "Remote",
      "skills": []
    },
    {
      "company": "Factorial HR",
      "start_date": "2018-11",
      "end_date": "2025-02",
      "positions": [
        {
          "title": "Senior Staff Software Engineer",
          "employment_type": "Full-time",
          "start_date": "2022-08",
          "end_date": "2025-02",
          "skills": ["Communication"]
        },
        {
          "title": "Director Of Engineering",
          "start_date": "2021-11",
          "end_date": "2022-08",
          "skills": ["Communication"]
        },
        {
          "title": "Engineering Manager",
          "start_date": "2021-04",
          "end_date": "2021-11",
          "location": "Barcelona and surrounding areas",
          "skills": ["Communication"]
        },
        {
          "title": "Senior Software Engineer",
          "start_date": "2018-11",
          "end_date": "2021-04",
          "location": "Barcelona and surrounding areas",
          "skills": ["Containerization"]
        }
      ]
    },
    {
      "title": "Fullstack Developer",
      "company": "Cirici Thinking Digital",
      "start_date": "2015-03",
      "end_date": "2018-11",
      "location": "Barcelona and surrounding areas",
      "skills": ["Containerization"]
    },
    {
      "title": "Fullstack Developer",
      "company": "Picmedia",
      "start_date": "2013-01",
      "end_date": "2015-03",
      "description": "Development of applications, websites, and layouts. Solution implementation. Server administration.",
      "skills": ["Containerization"]
    },
    {
      "title": "Freelance Fullstack Developer",
      "company": "n/a freelance",
      "start_date": "2010-04",
      "end_date": "2015-03",
      "description": "Custom WordPress plugin creation, website layouts. Custom web application development. Development in Symfony1.4 and Symfony2",
      "skills": ["Containerization"]
    },
    {
      "title": "Fullstack Developer",
      "company": "Doodigital, productos y servicios digitales SL",
      "start_date": "2009-12",
      "end_date": "2010-06",
      "location": "Granada, Andalusia, Spain",
      "description": "Development of IT solutions related to e-commerce and social networks.",
      "skills": []
    },
    {
      "title": "Enterprise Technician",
      "company": "Pymesoft Vallés, s.l.",
      "start_date": "2007-11",
      "end_date": "2008-02",
      "description": "Systems administrator technician for companies. Repair and implementation of IT solutions.",
      "skills": []
    },
    {
      "title": "Hardware technician and sysadmin",
      "company": "Doom Informática",
      "start_date": "2006-01",
      "end_date": "2006-12",
      "description": "Computer equipment repair. Systems administrator.",
      "skills": []
    }
  ]
}`,
      });

      work.children.set('factorial.md', {
        name: 'factorial.md',
        type: 'file',
        content: `# Factorial HR

**Total Duration:** 6 years 4 months (November 2018 - February 2025)

## Career Progression

### Senior Staff Software Engineer
**Period:** August 2022 - February 2025 (2 years 7 months)
**Type:** Full-time
**Skills:** Communication

---

### Director Of Engineering
**Period:** November 2021 - August 2022 (10 months)
**Skills:** Communication

---

### Engineering Manager
**Period:** April 2021 - November 2021 (8 months)
**Location:** Barcelona and surrounding areas
**Skills:** Communication

---

### Senior Software Engineer
**Period:** November 2018 - April 2021 (2 years 6 months)
**Location:** Barcelona and surrounding areas
**Skills:** Containerization

## Summary

Progressed from Senior Software Engineer through Engineering Manager and Director of Engineering roles to Senior Staff Software Engineer, demonstrating both technical excellence and leadership capabilities over a 6+ year tenure at Factorial HR.`,
      });

      work.children.set('timeline.md', {
        name: 'timeline.md',
        type: 'file',
        content: `# Career Timeline

\`\`\`
2025 ████████████ Part-Time CTO, Full-Time Builder (Freelance) - Present
     │
2024 │
     │
2023 │
     ├─────────── Senior Staff Software Engineer @ Factorial HR
2022 │
     ├─────────── Director Of Engineering @ Factorial HR
2021 │
     ├─────────── Engineering Manager @ Factorial HR
     │
2020 │
     ├─────────── Senior Software Engineer @ Factorial HR
2019 │
     │
2018 ├─────────── Fullstack Developer @ Cirici Thinking Digital
2017 │
2016 │
2015 ├─────────── Fullstack Developer @ Picmedia
2014 │            (Concurrent with Freelance work)
2013 │
     ├─────────── Freelance Fullstack Developer
2012 │
2011 │
2010 ├─────────── Fullstack Developer @ Doodigital
2009 │
2008 ├─────────── Enterprise Technician @ Pymesoft Vallés
2007 │
2006 ├─────────── Hardware technician @ Doom Informática
\`\`\`

## Key Transitions

- **2006-2010:** Early career - Hardware & Systems Administration
- **2010-2015:** Transition to Web Development (Freelance + Full-time roles)
- **2015-2018:** Fullstack Development focus
- **2018-2025:** Factorial HR - Progressive leadership growth (IC → Manager → Director → Senior Staff)
- **2025-Present:** Independent CTO/Builder role`,
      });

      work.children.set('skills-summary.md', {
        name: 'skills-summary.md',
        type: 'file',
        content: `# Skills Summary

## Technical Skills

### Containerization
- Experience across multiple roles from 2013-2021
- Mentioned in positions at:
  - Factorial HR (Senior Software Engineer)
  - Cirici Thinking Digital
  - Picmedia
  - Freelance work

### Web Development
- **Symfony Framework** (1.4 and 2.0)
- **WordPress** custom plugin development
- **Full-stack development** (Front-end and back-end)
- **E-commerce solutions**
- **Social network integrations**

### Infrastructure & Operations
- **Server Administration**
- **Systems Administration**
- **IT Solutions Implementation**
- **Hardware Repair & Maintenance**

## Soft Skills

### Communication
- Emphasized in all management and senior technical roles at Factorial HR:
  - Senior Staff Software Engineer
  - Director Of Engineering
  - Engineering Manager

## Career Evolution

**2006-2010:** Infrastructure & Hardware → Systems Administration

**2010-2015:** Web Development & Full-stack Engineering

**2015-2018:** Professional Full-stack Development

**2018-2025:** Leadership & Advanced Engineering
- Individual Contributor → Engineering Manager → Director → Senior Staff Engineer
- Demonstrates ability to move between IC and leadership tracks

**2025-Present:** Fractional CTO / Independent Builder`,
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

