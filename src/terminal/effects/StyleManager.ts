import type { ThemeConfig } from '../config/ThemeConfig';
import type { DeviceConfig } from '../config/DeviceConfig';

export class StyleManager {
  private styleElement?: HTMLStyleElement;

  constructor(
    private themeConfig: ThemeConfig,
    private deviceConfig: DeviceConfig
  ) {}

  injectStyles(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = this.generateCRTStyles();
    document.head.appendChild(this.styleElement);
  }

  removeStyles(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = undefined;
    }
  }

  applyMobileOptimizations(): void {
    const crtCurve = document.getElementById('crt-curve');
    const crtNoise = document.getElementById('crt-noise');
    
    if (crtCurve) crtCurve.style.opacity = '0.3';
    if (crtNoise) crtNoise.style.opacity = '0.005';
    
    // Reduce body flicker
    document.body.style.animation = 'flicker 0.3s infinite';
  }

  private generateCRTStyles(): string {
    const isMobile = this.deviceConfig.mobileRegex.test(navigator.userAgent);
    const responsive = isMobile ? this.deviceConfig.responsive.mobile : this.deviceConfig.responsive.desktop;

    return `
      /* CRT Screen Curvature - Convex Bulge Effect with vignetting */
      .xterm::before {
        content: '';
        position: absolute;
        top: -5%;
        left: -5%;
        width: 110%;
        height: 110%;
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 50%,
          rgba(0, 0, 0, 0.15) 70%,
          rgba(0, 0, 0, 0.4) 85%,
          rgba(0, 0, 0, 0.7) 100%
        );
        pointer-events: none;
        z-index: 100;
        border-radius: inherit;
        opacity: ${responsive.vignetteOpacity};
      }

      /* Glass reflection overlay */
      .xterm::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
          radial-gradient(
            ellipse 800px 600px at 20% 15%,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.08) 20%,
            transparent 40%
          ),
          radial-gradient(
            ellipse 400px 300px at 80% 80%,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.03) 30%,
            transparent 50%
          ),
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.05) 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.1) 100%
          );
        pointer-events: none;
        z-index: 99;
        border-radius: inherit;
        mix-blend-mode: overlay;
        opacity: ${responsive.reflectionOpacity};
      }

      .xterm-viewport {
        transform:
          perspective(2000px)
          rotateX(-2deg)
          scale3d(0.98, 0.96, 1);
        transform-style: preserve-3d;
        transform-origin: center center;
        border-radius: inherit;
        clip-path:
          ellipse(
            calc(50% - 10px) calc(50% - 10px)
            at 50% 50%
          );
      }

      /* Text curvature to follow screen bulge */
      .xterm-rows {
        transform:
          perspective(1500px)
          rotateX(1.5deg)
          scale3d(1.02, 1.02, 1);
        transform-style: preserve-3d;
        transform-origin: center center;
      }

      /* Individual row curvature for barrel distortion effect */
      .xterm-rows > div {
        transform-style: preserve-3d;
      }

      /* Top rows curve backward slightly */
      .xterm-rows > div:nth-child(-n+5) {
        transform: scaleX(0.99) translateZ(-2px);
      }

      /* Middle rows are neutral (screen center) */
      .xterm-rows > div:nth-child(n+6):nth-child(-n+25) {
        transform: scaleX(1.0) translateZ(0px);
      }

      /* Bottom rows curve backward */
      .xterm-rows > div:nth-child(n+26) {
        transform: scaleX(0.99) translateZ(-2px);
      }

      /* Phosphor glow distribution following curvature */
      .xterm-screen {
        filter:
          drop-shadow(0 0 1px ${this.themeConfig.crt.glowColor})
          drop-shadow(0 0 2px ${this.themeConfig.crt.glowColor});
      }

      /* Scrollbar curvature to match CRT convex effect */
      .xterm-viewport::-webkit-scrollbar {
        width: ${responsive.scrollbarWidth}px;
        transform-style: preserve-3d;
      }

      .xterm-viewport::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        margin: 10px 0;
        transform:
          perspective(1000px)
          rotateY(-2deg)
          translateZ(-5px);
        transform-style: preserve-3d;
        box-shadow:
          inset 2px 0 8px rgba(0, 0, 0, 0.5),
          inset -1px 0 4px ${this.themeConfig.crt.glowColor};
      }

      .xterm-viewport::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          ${this.themeConfig.colors.primary}66 0%,
          ${this.themeConfig.colors.primary}99 50%,
          ${this.themeConfig.colors.primary}66 100%
        );
        border-radius: 10px;
        border: 2px solid rgba(0, 0, 0, 0.5);
        transform:
          perspective(1000px)
          rotateY(-2deg)
          translateZ(-3px)
          scaleX(0.95);
        transform-style: preserve-3d;
        box-shadow:
          0 0 8px ${this.themeConfig.colors.primary}66,
          inset 0 0 4px ${this.themeConfig.colors.primary}4d,
          inset 1px 0 2px rgba(255, 255, 255, 0.2);
      }

      .xterm-viewport::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          ${this.themeConfig.colors.primary}99 0%,
          ${this.themeConfig.colors.primary}cc 50%,
          ${this.themeConfig.colors.primary}99 100%
        );
        box-shadow:
          0 0 12px ${this.themeConfig.colors.primary}99,
          inset 0 0 6px ${this.themeConfig.colors.primary}80,
          inset 1px 0 3px rgba(255, 255, 255, 0.3);
      }

      /* Scrollbar container wrapper with curvature */
      .xterm-viewport {
        scrollbar-width: thin;
        scrollbar-color: ${this.themeConfig.colors.primary}80 rgba(0, 0, 0, 0.3);
      }

      /* Apply subtle barrel distortion to scrollbar area */
      .xterm-viewport::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 20px;
        height: 100%;
        background: radial-gradient(
          ellipse at right center,
          transparent 0%,
          rgba(0, 0, 0, 0.1) 70%,
          rgba(0, 0, 0, 0.2) 100%
        );
        pointer-events: none;
        z-index: 1000;
        transform:
          perspective(800px)
          rotateY(-3deg)
          translateZ(-10px);
        transform-style: preserve-3d;
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .xterm-viewport {
          transform:
            perspective(1500px)
            rotateX(-1deg)
            scale3d(0.99, 0.98, 1);
        }

        .xterm-rows {
          transform:
            perspective(1200px)
            rotateX(1deg)
            scale3d(1.01, 1.01, 1);
        }

        .xterm-viewport::-webkit-scrollbar {
          width: ${this.deviceConfig.responsive.mobile.scrollbarWidth}px;
        }

        .xterm-viewport::-webkit-scrollbar-track {
          transform:
            perspective(800px)
            rotateY(-1deg)
            translateZ(-3px);
        }

        .xterm-viewport::-webkit-scrollbar-thumb {
          transform:
            perspective(800px)
            rotateY(-1deg)
            translateZ(-2px)
            scaleX(0.97);
        }

        .xterm-viewport::after {
          transform:
            perspective(600px)
            rotateY(-2deg)
            translateZ(-5px);
        }
      }
    `;
  }
}