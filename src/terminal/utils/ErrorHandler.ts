export class TerminalError extends Error {
  constructor(message: string, public recoverable: boolean = true) {
    super(`Terminal Error: ${message}`);
    this.name = 'TerminalError';
  }
}

export interface ErrorBoundary {
  handleError(error: TerminalError): void;
  recover(): Promise<boolean>;
  fallback(): void;
}

export class DefaultErrorBoundary implements ErrorBoundary {
  private errorHistory: TerminalError[] = [];
  private maxHistorySize = 10;

  handleError(error: TerminalError): void {
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
    
    console.error(error.message);
  }

  async recover(): Promise<boolean> {
    const lastError = this.errorHistory[this.errorHistory.length - 1];
    return lastError?.recoverable ?? false;
  }

  fallback(): void {
    console.warn('Terminal error recovery failed, using fallback mode');
  }

  getErrorHistory(): TerminalError[] {
    return [...this.errorHistory];
  }

  clearHistory(): void {
    this.errorHistory = [];
  }
}