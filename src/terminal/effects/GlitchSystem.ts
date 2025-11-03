import type { DeviceConfig } from '../config/DeviceConfig';

export class GlitchSystem {
  private intervalId?: number;

  constructor(private deviceConfig: DeviceConfig) {}

  start(container: HTMLElement): void {
    // Rare random glitches - very subtle
    this.intervalId = window.setInterval(() => {
      if (Math.random() < this.deviceConfig.glitch.probability) {
        this.triggerGlitch(container);
      }
    }, this.deviceConfig.glitch.interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  triggerGlitch(container: HTMLElement, type?: 'flicker' | 'shift' | 'color'): void {
    const glitchTypes = ['flicker', 'shift', 'color'];
    const glitchType = type || glitchTypes[Math.floor(Math.random() * glitchTypes.length)];
    
    switch (glitchType) {
      case 'flicker':
        container.style.opacity = '0.95';
        setTimeout(() => {
          container.style.opacity = '1';
        }, 50);
        break;
        
      case 'shift':
        container.style.transform = `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`;
        setTimeout(() => {
          container.style.transform = 'translate(0, 0)';
        }, 100);
        break;
        
      case 'color':
        const originalFilter = container.style.filter;
        container.style.filter = 'hue-rotate(90deg) saturate(1.5)';
        setTimeout(() => {
          container.style.filter = originalFilter;
        }, 75);
        break;
    }
  }
}