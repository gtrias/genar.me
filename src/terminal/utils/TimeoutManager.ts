export class TimeoutManager {
  private timeoutIds: (number | NodeJS.Timeout)[] = [];
  private maxTimeouts = 100;

  add(id: number | NodeJS.Timeout): void {
    if (this.timeoutIds.length >= this.maxTimeouts) {
      console.warn('TimeoutManager: Maximum number of timeouts reached');
      this.clearOldest();
    }
    this.timeoutIds.push(id);
  }

  clearAll(): void {
    this.timeoutIds.forEach(id => clearTimeout(id as any));
    this.timeoutIds = [];
  }

  getCount(): number {
    return this.timeoutIds.length;
  }

  clearOldest(): void {
    if (this.timeoutIds.length > 0) {
      const oldestId = this.timeoutIds.shift();
      if (oldestId !== undefined) {
        clearTimeout(oldestId as any);
      }
    }
  }

  remove(id: number | NodeJS.Timeout): boolean {
    const index = this.timeoutIds.indexOf(id);
    if (index !== -1) {
      this.timeoutIds.splice(index, 1);
      clearTimeout(id as any);
      return true;
    }
    return false;
  }

  getTimeoutIds(): (number | NodeJS.Timeout)[] {
    return [...this.timeoutIds];
  }

  setMaxTimeouts(max: number): void {
    this.maxTimeouts = Math.max(1, max);
    while (this.timeoutIds.length > this.maxTimeouts) {
      this.clearOldest();
    }
  }

  getMaxTimeouts(): number {
    return this.maxTimeouts;
  }
}