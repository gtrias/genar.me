import type { ThemeConfig } from '../config/ThemeConfig';
import type { DeviceConfig } from '../config/DeviceConfig';
import { GlitchSystem } from './GlitchSystem';
import { Animations } from './Animations';
import { StyleManager } from './StyleManager';

export class CRTEffects {
  private glitchSystem: GlitchSystem;
  private animations: Animations;
  private styleManager: StyleManager;
  private isInitialized = false;
  private isMobile = false;

  constructor(
    private container: HTMLElement,
    private themeConfig: ThemeConfig,
    private deviceConfig: DeviceConfig
  ) {
    this.glitchSystem = new GlitchSystem(deviceConfig);
    this.animations = new Animations(themeConfig);
    this.styleManager = new StyleManager(themeConfig, deviceConfig);
    this.isMobile = this.deviceConfig.mobileRegex.test(navigator.userAgent);
  }

  initialize(): void {
    if (this.isInitialized) return;

    // Inject CRT styles
    this.styleManager.injectStyles();

    // Add CRT effects container
    this.createCRTEffectsContainer();

    // Initialize effects based on device capabilities
    if (!this.isMobile) {
      this.glitchSystem.start(this.container);
      this.animations.enhanceCursorBlink();
    } else {
      // Reduce effects on mobile
      this.styleManager.applyMobileOptimizations();
    }

    this.isInitialized = true;
  }

  cleanup(): void {
    if (!this.isInitialized) return;

    this.glitchSystem.stop();
    this.styleManager.removeStyles();
    this.animations.cleanup();

    // Remove CRT effects container
    const crtContainer = this.container.querySelector('.terminal-crt-effects');
    if (crtContainer) {
      crtContainer.remove();
    }

    this.isInitialized = false;
  }

  triggerGlitch(type?: 'flicker' | 'shift' | 'color'): void {
    this.glitchSystem.triggerGlitch(this.container, type);
  }

  private createCRTEffectsContainer(): void {
    const crtEffects = document.createElement('div');
    crtEffects.className = 'terminal-crt-effects';
    this.container.appendChild(crtEffects);
  }
}