import type { ThemeConfig } from '../config/ThemeConfig';
import type { DeviceConfig } from '../config/DeviceConfig';
import { GlitchSystem } from './GlitchSystem';
import { Animations } from './Animations';
import { StyleManager } from './StyleManager';
import { GlassDeformation } from './threejs/GlassDeformation';

export class CRTEffects {
  private glitchSystem: GlitchSystem;
  private animations: Animations;
  private styleManager: StyleManager;
  private glassDeformation: GlassDeformation | null = null;
  private isInitialized = false;
  private isMobile = false;
  private glassDeformationEnabled = true; // Can be toggled via config

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

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Inject CRT styles
    this.styleManager.injectStyles();

    // Add CRT effects container
    this.createCRTEffectsContainer();

    // Initialize Three.js glass deformation effect
    if (this.glassDeformationEnabled) {
      await this.initializeGlassDeformation();
    }

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

  private async initializeGlassDeformation(): Promise<void> {
    try {
      // The container IS the .screen-content element (where xterm is opened)
      // Look for the xterm element within it
      console.log('[CRTEffects] Initializing glass deformation with container:', this.container);

      this.glassDeformation = new GlassDeformation(this.container, {
        enabled: true,
        distortion: 0.15,
        distortionX: 0.12,
        distortionY: 0.15,
        chromaticAberration: this.isMobile ? 0.0015 : 0.003,
        vignette: 0.35,
        scanlineIntensity: this.isMobile ? 0.05 : 0.15,
        curvature: 4.0,
        mobileOptimized: this.isMobile,
      });

      await this.glassDeformation.initialize();
      console.log('✓ CRT Glass Deformation initialized');
    } catch (error) {
      console.warn('Glass deformation failed to initialize:', error);
      this.glassDeformation = null;
    }
  }

  cleanup(): void {
    if (!this.isInitialized) return;

    // Cleanup glass deformation
    if (this.glassDeformation) {
      this.glassDeformation.cleanup();
      this.glassDeformation = null;
    }

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

  /**
   * Toggle glass deformation effect on/off
   */
  setGlassDeformationEnabled(enabled: boolean): void {
    if (this.glassDeformation) {
      this.glassDeformation.setEnabled(enabled);
    }
  }

  /**
   * Update glass deformation configuration
   */
  updateGlassDeformation(config: {
    distortion?: number;
    chromaticAberration?: number;
    vignette?: number;
    scanlineIntensity?: number;
    curvature?: number;
  }): void {
    if (this.glassDeformation) {
      this.glassDeformation.updateConfig(config);
    }
  }

  /**
   * Get glass deformation instance (for advanced control)
   */
  getGlassDeformation(): GlassDeformation | null {
    return this.glassDeformation;
  }

  private createCRTEffectsContainer(): void {
    const crtEffects = document.createElement('div');
    crtEffects.className = 'terminal-crt-effects';
    this.container.appendChild(crtEffects);
  }
}
