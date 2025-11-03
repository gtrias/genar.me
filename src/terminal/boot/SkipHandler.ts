import { TimeoutManager } from '../utils/TimeoutManager';

export class SkipHandler {
  private bootSkipped = false;
  private skipListener?: () => void;

  constructor(
    private terminal: any,
    private timeoutManager: TimeoutManager,
    private onComplete: () => void,
    private prompt: string
  ) {}

  setup(): void {
    this.skipListener = () => {
      this.bootSkipped = true;
      this.skip();
    };

    document.addEventListener('keydown', this.skipListener, { once: true });
  }

  skip(): void {
    this.timeoutManager.clearAll();

    this.terminal.clear();
    this.terminal.writeln('\x1b[96mWelcome to the Interactive Terminal!\x1b[0m');
    this.terminal.writeln('Type "help" for available commands.');
    this.terminal.writeln('');
    this.terminal.write(this.prompt);
    this.onComplete();
  }

  cleanup(): void {
    if (this.skipListener) {
      document.removeEventListener('keydown', this.skipListener);
    }
  }

  isSkipped(): boolean {
    return this.bootSkipped;
  }
}