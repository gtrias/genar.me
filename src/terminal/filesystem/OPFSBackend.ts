/**
 * OPFS (Origin Private File System) Backend
 * Provides persistent storage for the virtual filesystem using OPFS API
 */

import type { VirtualFileSystem } from './VirtualFileSystem';

export class OPFSBackend {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private initialized: boolean = false;
  private readonly STORAGE_KEY = 'genar-terminal-vfs';

  /**
   * Check if OPFS is available
   */
  static isAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage;
  }

  /**
   * Initialize OPFS backend
   */
  async initialize(): Promise<void> {
    if (!OPFSBackend.isAvailable()) {
      console.warn('OPFS not available, falling back to localStorage');
      return;
    }

    try {
      this.rootHandle = await navigator.storage.getDirectory();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OPFS:', error);
      this.initialized = false;
    }
  }

  /**
   * Save filesystem to OPFS
   */
  async save(vfs: VirtualFileSystem): Promise<void> {
    if (!this.initialized || !this.rootHandle) {
      // Fallback to localStorage
      this.saveToLocalStorage(vfs);
      return;
    }

    try {
      const serialized = vfs.serialize();
      const fileHandle = await this.rootHandle.getFileHandle(this.STORAGE_KEY, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(serialized);
      await writable.close();
    } catch (error) {
      console.error('Failed to save to OPFS:', error);
      // Fallback to localStorage
      this.saveToLocalStorage(vfs);
    }
  }

  /**
   * Load filesystem from OPFS
   */
  async load(vfs: VirtualFileSystem): Promise<boolean> {
    if (!this.initialized || !this.rootHandle) {
      // Fallback to localStorage
      return this.loadFromLocalStorage(vfs);
    }

    try {
      const fileHandle = await this.rootHandle.getFileHandle(this.STORAGE_KEY);
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      if (content) {
        vfs.deserialize(content);
        return true;
      }
    } catch (error) {
      // File doesn't exist yet, that's okay
      if ((error as Error).name !== 'NotFoundError') {
        console.error('Failed to load from OPFS:', error);
      }
      // Try localStorage fallback
      return this.loadFromLocalStorage(vfs);
    }

    return false;
  }

  /**
   * Fallback: Save to localStorage
   */
  private saveToLocalStorage(vfs: VirtualFileSystem): void {
    try {
      const serialized = vfs.serialize();
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Fallback: Load from localStorage
   */
  private loadFromLocalStorage(vfs: VirtualFileSystem): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        vfs.deserialize(stored);
        return true;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return false;
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    if (this.initialized && this.rootHandle) {
      try {
        await this.rootHandle.removeEntry(this.STORAGE_KEY);
      } catch (error) {
        // File might not exist, that's okay
      }
    }
    
    // Also clear localStorage
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if data exists
   */
  async exists(): Promise<boolean> {
    if (this.initialized && this.rootHandle) {
      try {
        await this.rootHandle.getFileHandle(this.STORAGE_KEY);
        return true;
      } catch {
        return false;
      }
    }
    
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
}

