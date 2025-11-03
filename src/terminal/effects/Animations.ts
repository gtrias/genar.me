import type { ThemeConfig } from '../config/ThemeConfig';

export class Animations {
  private styleElement?: HTMLStyleElement;

  constructor(private themeConfig: ThemeConfig) {}

  enhanceCursorBlink(): void {
    // Add enhanced cursor glow effect
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      .terminal-crt-effects {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      }
      
      .xterm-cursor {
        box-shadow: 0 0 8px ${this.themeConfig.colors.primary}, 0 0 16px ${this.themeConfig.colors.primary}cc;
        animation: cursorGlow 2s ease-in-out infinite alternate;
      }
      
      @keyframes cursorGlow {
        0% { box-shadow: 0 0 8px ${this.themeConfig.colors.primary}, 0 0 16px ${this.themeConfig.colors.primary}cc; }
        100% { box-shadow: 0 0 12px ${this.themeConfig.colors.primary}, 0 0 24px ${this.themeConfig.colors.primary}; }
      }
      
      @keyframes terminalScanline {
        0% { transform: translateY(0); }
        100% { transform: translateY(10px); }
      }
      
      .xterm-screen {
        position: relative;
      }
      
      .xterm-screen::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          0deg,
          transparent 0%,
          ${this.themeConfig.scanline.color} 50%,
          transparent 100%
        );
        pointer-events: none;
        animation: terminalScanline ${this.themeConfig.scanline.animationDuration}s linear infinite;
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  cleanup(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = undefined;
    }
  }
}