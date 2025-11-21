/**
 * CRT Glass Deformation Effect using Three.js
 * Renders terminal content through a realistic curved glass shader
 */

import * as THREE from 'three';
import { CRTShader } from './CRTShader';

export interface GlassDeformationConfig {
  enabled?: boolean;
  distortion?: number;
  distortionX?: number;
  distortionY?: number;
  chromaticAberration?: number;
  vignette?: number;
  scanlineIntensity?: number;
  curvature?: number;
  mobileOptimized?: boolean;
}

export class GlassDeformation {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private renderTarget: THREE.WebGLRenderTarget;
  private material: THREE.ShaderMaterial;
  private quad: THREE.Mesh;
  private sourceElement: HTMLElement;
  private canvasOverlay: HTMLCanvasElement;
  private animationFrameId: number | null = null;
  private isInitialized = false;
  private config: Required<GlassDeformationConfig>;
  private startTime: number;

  constructor(
    sourceElement: HTMLElement,
    config: GlassDeformationConfig = {}
  ) {
    this.sourceElement = sourceElement;
    this.startTime = Date.now();

    // Default configuration with mobile optimization support
    this.config = {
      enabled: config.enabled ?? true,
      distortion: config.distortion ?? 0.15,
      distortionX: config.distortionX ?? 0.12,
      distortionY: config.distortionY ?? 0.15,
      chromaticAberration: config.chromaticAberration ?? 0.003,
      vignette: config.vignette ?? 0.35,
      scanlineIntensity: config.scanlineIntensity ?? 0.15,
      curvature: config.curvature ?? 4.0,
      mobileOptimized: config.mobileOptimized ?? false,
    };

    // Reduce effects on mobile for better performance
    if (this.config.mobileOptimized) {
      this.config.distortion *= 0.5;
      this.config.chromaticAberration *= 0.5;
      this.config.scanlineIntensity *= 0.3;
      this.config.vignette *= 0.6;
    }

    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Create renderer with alpha channel
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false, // Disable for authentic CRT look
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Create render target for source element
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CRTShader.uniforms),
      vertexShader: CRTShader.vertexShader,
      fragmentShader: CRTShader.fragmentShader,
      transparent: true,
    });

    // Set initial uniform values
    this.updateUniforms();

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.quad);

    // Create canvas overlay
    this.canvasOverlay = document.createElement('canvas');
    this.canvasOverlay.className = 'crt-glass-deformation';
  }

  /**
   * Initialize the glass deformation effect
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.enabled) return;

    try {
      console.log('[GlassDeformation] Initializing...');

      // Wait for xterm to be ready
      await this.waitForXterm();

      // Set up canvas overlay
      this.setupCanvas();

      // Convert source element to texture
      await this.updateSourceTexture();

      // Start render loop
      this.startRenderLoop();

      // Handle window resize
      window.addEventListener('resize', this.handleResize);

      this.isInitialized = true;
      console.log('✓ CRT Glass Deformation initialized');
    } catch (error) {
      console.error('Failed to initialize glass deformation:', error);
      this.cleanup();
    }
  }

  /**
   * Wait for xterm to be ready in the DOM
   * Works with both canvas and DOM renderer
   */
  private async waitForXterm(): Promise<void> {
    console.log('[GlassDeformation] Waiting for xterm element...');
    console.log('[GlassDeformation] Source element:', this.sourceElement);

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max

      const checkXterm = () => {
        attempts++;

        const xtermElement = this.sourceElement.querySelector('.xterm');
        const xtermRows = this.sourceElement.querySelector('.xterm-rows');
        const hasContent = xtermRows && xtermRows.children.length > 0;

        console.log(`[GlassDeformation] Attempt ${attempts}/${maxAttempts}`, {
          xtermElement: !!xtermElement,
          xtermRows: !!xtermRows,
          hasContent,
          rowCount: xtermRows?.children.length || 0,
        });

        // Wait for xterm element with actual content
        if (xtermElement && hasContent) {
          console.log('[GlassDeformation] Xterm element ready with content!');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('[GlassDeformation] Timeout waiting for xterm');
          reject(new Error('Timeout waiting for xterm'));
        } else {
          setTimeout(checkXterm, 100);
        }
      };

      checkXterm();
    });
  }

  /**
   * Set up the canvas overlay that will display the deformed content
   */
  private setupCanvas(): void {
    const parent = this.sourceElement.parentElement;
    if (!parent) {
      throw new Error('Source element must have a parent');
    }

    console.log('[GlassDeformation] Setting up canvas overlay');
    console.log('[GlassDeformation] Source element:', this.sourceElement);
    console.log('[GlassDeformation] Parent element:', parent);

    // Style canvas to overlay the source element
    this.canvasOverlay.style.position = 'absolute';
    this.canvasOverlay.style.top = '0';
    this.canvasOverlay.style.left = '0';
    this.canvasOverlay.style.width = '100%';
    this.canvasOverlay.style.height = '100%';
    this.canvasOverlay.style.pointerEvents = 'none'; // Allow interaction with underlying terminal
    this.canvasOverlay.style.zIndex = '10';

    // Size canvas
    this.updateCanvasSize();

    console.log('[GlassDeformation] Canvas overlay size:', {
      width: this.canvasOverlay.width,
      height: this.canvasOverlay.height,
      styleWidth: this.canvasOverlay.style.width,
      styleHeight: this.canvasOverlay.style.height,
    });

    // Insert canvas after source element
    parent.appendChild(this.canvasOverlay);

    console.log('[GlassDeformation] Canvas overlay appended to parent');
  }

  /**
   * Update canvas size to match container
   */
  private updateCanvasSize(): void {
    const rect = this.sourceElement.getBoundingClientRect();

    this.canvasOverlay.width = rect.width * window.devicePixelRatio;
    this.canvasOverlay.height = rect.height * window.devicePixelRatio;
    this.canvasOverlay.style.width = `${rect.width}px`;
    this.canvasOverlay.style.height = `${rect.height}px`;

    this.renderer.setSize(rect.width, rect.height);

    // Update render target size
    this.renderTarget.setSize(
      rect.width * window.devicePixelRatio,
      rect.height * window.devicePixelRatio
    );
  }

  /**
   * Convert source element to texture using efficient DOM-to-Canvas rendering
   */
  private async updateSourceTexture(): Promise<void> {
    // Create initial texture from source element
    const texture = await this.elementToTexture(this.sourceElement);

    if (this.material.uniforms.tDiffuse) {
      this.material.uniforms.tDiffuse.value = texture;
    }

    // Set up continuous texture updates for real-time terminal rendering
    this.setupContinuousTextureUpdate();
  }

  /**
   * Set up continuous texture updates for real-time content
   */
  private setupContinuousTextureUpdate(): void {
    // Create an offscreen canvas to capture the source element
    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) return;

    const rect = this.sourceElement.getBoundingClientRect();
    offscreenCanvas.width = rect.width * window.devicePixelRatio;
    offscreenCanvas.height = rect.height * window.devicePixelRatio;

    // Use a VideoTexture-like approach for continuous updates
    const texture = new THREE.CanvasTexture(offscreenCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    if (this.material.uniforms.tDiffuse) {
      this.material.uniforms.tDiffuse.value = texture;
    }

    // Update texture periodically (every frame for smooth animation)
    const updateTexture = () => {
      if (!this.isInitialized) return;

      this.captureElementToCanvas(this.sourceElement, offscreenCanvas, ctx);
      texture.needsUpdate = true;
    };

    // Call updateTexture in the render loop
    this.textureUpdateCallback = updateTexture;
  }

  /**
   * Capture element content to canvas efficiently
   * Works with both canvas and DOM renderer
   */
  private captureElementToCanvas(
    element: HTMLElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): void {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Try canvas renderer first (most efficient)
    const xtermCanvas = element.querySelector('canvas.xterm-text-layer');
    if (xtermCanvas instanceof HTMLCanvasElement) {
      // Direct copy from xterm canvas layers
      ctx.drawImage(xtermCanvas, 0, 0, canvas.width, canvas.height);

      const cursorCanvas = element.querySelector('canvas.xterm-cursor-layer');
      if (cursorCanvas instanceof HTMLCanvasElement) {
        ctx.drawImage(cursorCanvas, 0, 0, canvas.width, canvas.height);
      }

      const selectionCanvas = element.querySelector('canvas.xterm-selection-layer');
      if (selectionCanvas instanceof HTMLCanvasElement) {
        ctx.drawImage(selectionCanvas, 0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Fallback for DOM renderer: render DOM to canvas using SVG foreignObject
    this.renderDOMToCanvas(element, canvas, ctx);
  }

  /**
   * Render DOM element to canvas using SVG foreignObject
   * This works with xterm's DOM renderer
   */
  private renderDOMToCanvas(
    element: HTMLElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): void {
    try {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      // Get the xterm element which contains the actual terminal content
      const xtermElement = element.querySelector('.xterm') as HTMLElement;
      if (!xtermElement) {
        console.warn('[GlassDeformation] No .xterm element found');
        return;
      }

      // Create SVG with foreignObject containing the xterm HTML
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', String(rect.width));
      svg.setAttribute('height', String(rect.height));
      svg.setAttribute('xmlns', svgNS);

      const foreignObject = document.createElementNS(svgNS, 'foreignObject');
      foreignObject.setAttribute('width', '100%');
      foreignObject.setAttribute('height', '100%');

      // Clone the xterm element with its styles
      const clone = xtermElement.cloneNode(true) as HTMLElement;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.backgroundColor = computedStyle.backgroundColor;
      clone.style.color = computedStyle.color;
      clone.style.fontFamily = computedStyle.fontFamily;
      clone.style.fontSize = computedStyle.fontSize;

      foreignObject.appendChild(clone);
      svg.appendChild(foreignObject);

      // Serialize SVG to string
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Load and draw SVG to canvas
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        console.warn('[GlassDeformation] Failed to load SVG image');
        URL.revokeObjectURL(url);
        // Fallback: fill with terminal background color
        ctx.fillStyle = computedStyle.backgroundColor || '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      img.src = url;
    } catch (error) {
      console.error('[GlassDeformation] Error rendering DOM to canvas:', error);
    }
  }

  /**
   * Convert HTML element to Three.js texture (initial load)
   */
  private async elementToTexture(element: HTMLElement): Promise<THREE.Texture> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const rect = element.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    // Capture initial content
    this.captureElementToCanvas(element, canvas, ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
  }

  private textureUpdateCallback: (() => void) | null = null;

  /**
   * Update shader uniforms with current config
   */
  private updateUniforms(): void {
    if (!this.material.uniforms) return;

    const uniforms = this.material.uniforms;
    uniforms.distortion.value = this.config.distortion;
    uniforms.distortionX.value = this.config.distortionX;
    uniforms.distortionY.value = this.config.distortionY;
    uniforms.chromaticAberration.value = this.config.chromaticAberration;
    uniforms.vignette.value = this.config.vignette;
    uniforms.scanlineIntensity.value = this.config.scanlineIntensity;
    uniforms.curvature.value = this.config.curvature;
  }

  /**
   * Start the render loop
   */
  private startRenderLoop = (): void => {
    if (!this.config.enabled) return;

    const render = () => {
      if (!this.isInitialized) return;

      // Update source texture from terminal
      if (this.textureUpdateCallback) {
        this.textureUpdateCallback();
      }

      // Update time uniform for animated effects
      const elapsed = (Date.now() - this.startTime) / 1000;
      if (this.material.uniforms.time) {
        this.material.uniforms.time.value = elapsed;
      }

      // Render scene
      this.renderer.render(this.scene, this.camera);

      // Copy to overlay canvas
      const ctx = this.canvasOverlay.getContext('2d');
      if (ctx) {
        ctx.drawImage(this.renderer.domElement, 0, 0);
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  };

  /**
   * Handle window resize
   */
  private handleResize = (): void => {
    this.updateCanvasSize();
  };

  /**
   * Update configuration dynamically
   */
  updateConfig(config: Partial<GlassDeformationConfig>): void {
    Object.assign(this.config, config);
    this.updateUniforms();
  }

  /**
   * Enable/disable the effect
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.canvasOverlay.style.display = enabled ? 'block' : 'none';

    if (enabled && !this.animationFrameId) {
      this.startRenderLoop();
    } else if (!enabled && this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener('resize', this.handleResize);

    if (this.canvasOverlay.parentElement) {
      this.canvasOverlay.parentElement.removeChild(this.canvasOverlay);
    }

    this.renderer.dispose();
    this.renderTarget.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();

    if (this.material.uniforms.tDiffuse?.value) {
      this.material.uniforms.tDiffuse.value.dispose();
    }

    this.isInitialized = false;
    console.log('✓ CRT Glass Deformation cleaned up');
  }
}
