import type { BootConfig } from '../config/BootConfig';
import { TimeoutManager } from '../utils/TimeoutManager';
import { SkipHandler } from './SkipHandler';

export class BootSequence {
  private messageIndex = 0;
  private skipHandler: SkipHandler;
  private isMobile: boolean;
  private typeDelay: number;

  constructor(
    private terminal: any,
    private config: BootConfig,
    private timeoutManager: TimeoutManager
  ) {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.typeDelay = this.isMobile ? 15 : 25;
    
    this.skipHandler = new SkipHandler(
      this.terminal,
      this.timeoutManager,
      () => this.onBootComplete(),
      this.config.prompt
    );
  }

  async start(callback: () => void): Promise<void> {
    this.config.onComplete = callback;
    this.skipHandler.setup();
    
    const initialTimeoutId = setTimeout(() => {
      this.processNextBootMessage();
    }, this.config.initialDelay);
    this.timeoutManager.add(initialTimeoutId);
  }

  skip(): void {
    this.skipHandler.cleanup();
    this.skipHandler = new SkipHandler(
      this.terminal,
      this.timeoutManager,
      () => this.onBootComplete(),
      this.config.prompt
    );
    this.skipHandler.setup();
    this.skipHandler.skip();
  }

  private processNextBootMessage(): void {
    if (this.messageIndex >= this.config.messages.length) {
      this.skipHandler.cleanup();
      this.showWelcomeMessage();
      return;
    }

    const msg = this.config.messages[this.messageIndex];

    const msgTimeoutId = setTimeout(() => {
      if (msg.text) {
        if (msg.instant) {
          this.terminal.writeln(`${msg.color}${msg.text}\x1b[0m`);
        } else {
          this.typeWriter(this.terminal, msg.text, msg.color, () => {
            this.terminal.writeln('');
            this.messageIndex++;
            this.processNextBootMessage();
          });
          return;
        }
      } else {
        this.terminal.writeln('');
      }

      this.messageIndex++;
      this.processNextBootMessage();
    }, msg.delay);
    this.timeoutManager.add(msgTimeoutId);
  }

  private typeWriter(terminal: any, text: string, color: string, callback: () => void): void {
    let charIndex = 0;
    
    const typeChar = () => {
      if (charIndex < text.length) {
        terminal.write(`${color}${text[charIndex]}\x1b[0m`);
        charIndex++;
        const charTimeoutId = setTimeout(typeChar, this.typeDelay);
        this.timeoutManager.add(charTimeoutId);
      } else {
        callback();
      }
    };
    
    typeChar();
  }

  private showWelcomeMessage(): void {
    this.terminal.clear();
    this.terminal.writeln(`${this.config.welcomeMessage.color}${this.config.welcomeMessage.text}\x1b[0m`);
    this.terminal.writeln(this.config.helpMessage);
    this.terminal.writeln('');
    this.terminal.write(this.config.prompt);
    this.onBootComplete();
  }

  private onBootComplete(): void {
    if (this.config.onComplete) {
      this.config.onComplete();
    }
  }
}