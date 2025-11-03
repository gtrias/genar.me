/**
 * Terminal Manager Core
 * Central orchestrator for all terminal components and their lifecycle
 */

import type { TerminalConfig } from '../config/TerminalConfig';
import type { BootConfig } from '../config/BootConfig';
import type { ThemeConfig } from '../config/ThemeConfig';
import type { DeviceConfig } from '../config/DeviceConfig';
import type { Command } from '../../commands/types';

import { Terminal } from '@xterm/xterm';
import { WebLinksAddon } from '@xterm/addon-web-links';

import { CRTEffects } from '../effects/CRTEffects';
import { BootSequence } from '../boot/BootSequence';
import { CommandHandler } from './CommandHandler';
import { InputManager } from './InputManager';
import { TimeoutManager } from '../utils/TimeoutManager';
import { TerminalError, DefaultErrorBoundary } from '../utils/ErrorHandler';

import { defaultTerminalConfig } from '../config/TerminalConfig';
import { defaultBootConfig } from '../config/BootConfig';
import { defaultThemeConfig } from '../config/ThemeConfig';
import { defaultDeviceConfig } from '../config/DeviceConfig';
import { getCommandRegistry } from '../../commands';

export class TerminalManager {
  private terminal!: Terminal;
  private crtEffects!: CRTEffects;
  private bootSequence!: BootSequence;
  private commandHandler!: CommandHandler;
  private inputManager!: InputManager;
  private timeoutManager: TimeoutManager;
  private errorBoundary: DefaultErrorBoundary;
  
  private isInitialized = false;
  private isBootComplete = false;
  private container: HTMLElement;
  private config: TerminalConfig;
  private bootConfig: BootConfig;
  private themeConfig: ThemeConfig;
  private deviceConfig: DeviceConfig;
  private commandRegistry: Map<string, Command>;
  private currentLine = '';

  constructor(container: HTMLElement, config?: Partial<TerminalConfig>) {
    if (!container) {
      throw new TerminalError('Container element is required', false);
    }

    this.container = container;
    this.config = { ...defaultTerminalConfig, ...config };
    this.bootConfig = { ...defaultBootConfig };
    this.themeConfig = { ...defaultThemeConfig };
    this.deviceConfig = { ...defaultDeviceConfig };
    
    this.timeoutManager = new TimeoutManager();
    this.errorBoundary = new DefaultErrorBoundary();
    this.commandRegistry = new Map();
  }

  /**
   * Initialize all terminal components in correct order
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.warn('TerminalManager already initialized');
        return;
      }

      // Load command registry
      this.commandRegistry = getCommandRegistry();

      // Create terminal instance
      this.terminal = this.createTerminalInstance();

      // Open terminal in container
      this.terminal.open(this.container);

      // Setup web links addon
      this.setupWebLinks();

      // Initialize CRT effects
      this.crtEffects = new CRTEffects(this.container, this.themeConfig, this.deviceConfig);
      this.crtEffects.initialize();

      // Initialize command handler
      this.commandHandler = new CommandHandler(this.commandRegistry, this.terminal);

      // Initialize input manager
      this.inputManager = new InputManager(this.terminal, this.bootConfig.prompt, this.commandHandler);

      // Initialize boot sequence
      this.bootSequence = new BootSequence(this.terminal, this.bootConfig, this.timeoutManager);

      this.isInitialized = true;
      console.log('TerminalManager initialized successfully');

    } catch (error) {
      this.handleError(error instanceof TerminalError ? error : new TerminalError(`Initialization failed: ${error}`));
      throw error;
    }
  }

  /**
   * Start the boot sequence
   */
  async startBootSequence(): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new TerminalError('TerminalManager must be initialized before starting boot sequence');
      }

      if (this.isBootComplete) {
        console.warn('Boot sequence already completed');
        return;
      }

      await this.bootSequence.start(() => {
        this.isBootComplete = true;
        this.startInteractiveMode();
      });

    } catch (error) {
      this.handleError(error instanceof TerminalError ? error : new TerminalError(`Boot sequence failed: ${error}`));
      throw error;
    }
  }

  /**
   * Start interactive terminal mode
   */
  startInteractiveMode(): void {
    try {
      if (!this.isBootComplete) {
        throw new TerminalError('Boot sequence must be completed before starting interactive mode');
      }

      this.terminal.onData((data: string) => {
        this.handleTerminalInput(data);
      });

      console.log('Interactive mode started');

    } catch (error) {
      this.handleError(error instanceof TerminalError ? error : new TerminalError(`Failed to start interactive mode: ${error}`));
    }
  }

  /**
   * Skip the boot sequence
   */
  skipBootSequence(): void {
    try {
      if (!this.isInitialized) {
        throw new TerminalError('TerminalManager must be initialized before skipping boot sequence');
      }

      if (this.isBootComplete) {
        console.warn('Boot sequence already completed');
        return;
      }

      this.bootSequence.skip();

    } catch (error) {
      this.handleError(error instanceof TerminalError ? error : new TerminalError(`Failed to skip boot sequence: ${error}`));
    }
  }

  /**
   * Cleanup all terminal components
   */
  cleanup(): void {
    try {
      // Clear all timeouts
      this.timeoutManager.clearAll();

      // Cleanup CRT effects
      if (this.crtEffects) {
        this.crtEffects.cleanup();
      }

      // Cleanup boot sequence
      if (this.bootSequence) {
        this.bootSequence.skip(); // This will cleanup the skip handler
      }

      // Dispose terminal
      if (this.terminal) {
        this.terminal.dispose();
      }

      // Reset state
      this.isInitialized = false;
      this.isBootComplete = false;

      console.log('TerminalManager cleaned up successfully');

    } catch (error) {
      this.handleError(error instanceof TerminalError ? error : new TerminalError(`Cleanup failed: ${error}`));
    }
  }

  /**
   * Get terminal instance for external access
   */
  getTerminal(): Terminal {
    if (!this.isInitialized) {
      throw new TerminalError('TerminalManager not initialized');
    }
    return this.terminal;
  }

  /**
   * Get command handler for external access
   */
  getCommandHandler(): CommandHandler {
    if (!this.isInitialized) {
      throw new TerminalError('TerminalManager not initialized');
    }
    return this.commandHandler;
  }

  /**
   * Get input manager for external access
   */
  getInputManager(): InputManager {
    if (!this.isInitialized) {
      throw new TerminalError('TerminalManager not initialized');
    }
    return this.inputManager;
  }

  /**
   * Trigger CRT glitch effect
   */
  triggerGlitch(type?: 'flicker' | 'shift' | 'color'): void {
    if (this.crtEffects) {
      this.crtEffects.triggerGlitch(type);
    }
  }

  /**
   * Check if terminal is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if boot sequence is complete
   */
  isBootCompleted(): boolean {
    return this.isBootComplete;
  }

  /**
   * Create terminal instance with configuration
   */
  private createTerminalInstance(): Terminal {
    return new Terminal({
      cursorBlink: true,
      fontSize: this.config.fontSize,
      fontFamily: this.config.fontFamily,
      theme: this.config.theme,
      cols: this.config.cols,
      rows: this.config.rows,
      allowTransparency: this.config.allowTransparency,
    });
  }

  /**
   * Setup web links addon
   */
  private setupWebLinks(): void {
    try {
      const webLinksAddon = new WebLinksAddon();
      this.terminal.loadAddon(webLinksAddon);
      console.log('WebLinksAddon loaded - URLs are now clickable');
    } catch (error) {
      console.warn('Failed to load WebLinksAddon:', error);
    }
  }

  /**
   * Handle terminal input through input manager
   */
  private handleTerminalInput(data: string): void {
    if (!this.inputManager) {
      return;
    }

    const result = this.inputManager.handleKey(data, this.currentLine);
    this.currentLine = result.currentLine;

    if (result.command && result.args) {
      this.executeCommand(result.command, result.args);
    }
  }

  /**
   * Execute command through command handler
   */
  private async executeCommand(command: string, args: string[]): Promise<void> {
    try {
      if (!this.commandHandler) {
        return;
      }

      await this.commandHandler.execute(command, args);
      
      // Show prompt after command completion
      this.terminal.write(this.bootConfig.prompt);

    } catch (error) {
      this.handleError(error instanceof TerminalError ? error : new TerminalError(`Command execution failed: ${error}`));
      this.terminal.write(this.bootConfig.prompt);
    }
  }

  /**
   * Handle errors through error boundary
   */
  private handleError(error: TerminalError): void {
    this.errorBoundary.handleError(error);
    
    if (!error.recoverable) {
      this.fallback();
    }
  }

  /**
   * Fallback mode for unrecoverable errors
   */
  private fallback(): void {
    this.errorBoundary.fallback();
    
    // Show error message in container
    this.container.innerHTML = `
      <div class="terminal-error">
        <h3>Terminal Error</h3>
        <p>The terminal encountered an unrecoverable error.</p>
        <p>Please refresh the page to try again.</p>
      </div>
    `;
  }
}