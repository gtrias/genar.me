/**
 * Environment Variables Manager
 * Manages shell environment variables like HOME, USER, PATH, PWD, etc.
 */

export class Environment {
  private vars: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaults();
  }

  /**
   * Initialize default environment variables
   */
  private initializeDefaults(): void {
    this.set('HOME', '/home/guest');
    this.set('USER', 'guest');
    this.set('PATH', '/usr/bin:/bin:/usr/local/bin');
    this.set('PWD', '/home/guest');
    this.set('SHELL', '/bin/bash');
    this.set('TERM', 'xterm-256color');
    this.set('HOSTNAME', 'genar-terminal');
  }

  /**
   * Get environment variable value
   */
  get(key: string): string | undefined {
    return this.vars.get(key);
  }

  /**
   * Set environment variable
   */
  set(key: string, value: string): void {
    this.vars.set(key, value);
  }

  /**
   * Unset environment variable
   */
  unset(key: string): void {
    this.vars.delete(key);
  }

  /**
   * Check if environment variable exists
   */
  has(key: string): boolean {
    return this.vars.has(key);
  }

  /**
   * Get all environment variables as a Map
   */
  getAll(): Map<string, string> {
    return new Map(this.vars);
  }

  /**
   * Get all environment variables as an object
   */
  toObject(): Record<string, string> {
    const obj: Record<string, string> = {};
    this.vars.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Expand environment variables in a string
   * Supports $VAR and ${VAR} syntax
   */
  expand(str: string): string {
    return str.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, braced, unbraced) => {
      const varName = braced || unbraced;
      const value = this.get(varName);
      return value !== undefined ? value : match;
    });
  }

  /**
   * Update PWD (current working directory)
   */
  setPWD(path: string): void {
    this.set('PWD', path);
  }

  /**
   * Get current working directory
   */
  getPWD(): string {
    return this.get('PWD') || '/home/guest';
  }

  /**
   * Get home directory
   */
  getHOME(): string {
    return this.get('HOME') || '/home/guest';
  }

  /**
   * Get current user
   */
  getUSER(): string {
    return this.get('USER') || 'guest';
  }

  /**
   * Get PATH as array
   */
  getPATH(): string[] {
    const path = this.get('PATH') || '/usr/bin:/bin';
    return path.split(':').filter(p => p.length > 0);
  }
}

