/**
 * File System Manager
 * Manages virtual file system state and provides terminal integration
 */

import { VirtualFileSystem } from './VirtualFileSystem';

export class FileSystemManager {
  private fileSystem: VirtualFileSystem;

  constructor() {
    this.fileSystem = new VirtualFileSystem();
  }

  /**
   * Get the virtual file system instance
   */
  getFileSystem(): VirtualFileSystem {
    return this.fileSystem;
  }

  /**
   * Get current working directory
   */
  getCurrentDirectory(): string {
    return this.fileSystem.getCurrentPath();
  }

  /**
   * Change current directory
   */
  changeDirectory(path: string): boolean {
    const resolvedPath = this.fileSystem.resolvePath(path);
    return this.fileSystem.setCurrentPath(resolvedPath);
  }

  /**
   * List current directory contents
   */
  listCurrentDirectory() {
    return this.fileSystem.listDirectory();
  }

  /**
   * Read file content
   */
  readFile(path: string): string | null {
    const resolvedPath = this.fileSystem.resolvePath(path);
    return this.fileSystem.readFile(resolvedPath);
  }

  /**
   * Create file
   */
  createFile(path: string, content: string): boolean {
    const resolvedPath = this.fileSystem.resolvePath(path);
    return this.fileSystem.createFileAtPath(resolvedPath, content);
  }

  /**
   * Create directory
   */
  createDirectory(path: string): boolean {
    const resolvedPath = this.fileSystem.resolvePath(path);
    return this.fileSystem.createDirectoryAtPath(resolvedPath);
  }
}
