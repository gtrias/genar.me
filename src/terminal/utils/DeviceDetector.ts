export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  touchSupported: boolean;
}

export class DeviceDetector {
  private static instance: DeviceDetector;
  private deviceInfo: DeviceInfo;

  private constructor() {
    this.deviceInfo = this.detectDevice();
    this.setupResizeListener();
  }

  static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }

  private detectDevice(): DeviceInfo {
    if (typeof window === 'undefined') {
      return this.getDefaultDeviceInfo();
    }

    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const isMobile = this.isMobileDevice(userAgent, screenWidth);
    const isTablet = this.isTabletDevice(userAgent, screenWidth);
    const isDesktop = !isMobile && !isTablet;

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      userAgent,
      touchSupported
    };
  }

  private isMobileDevice(userAgent: string, screenWidth: number): boolean {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) || screenWidth < 768;
  }

  private isTabletDevice(userAgent: string, screenWidth: number): boolean {
    const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet/i;
    return tabletRegex.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024);
  }

  private getDefaultDeviceInfo(): DeviceInfo {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1920,
      screenHeight: 1080,
      userAgent: 'Server-Side Rendering',
      touchSupported: false
    };
  }

  private setupResizeListener(): void {
    if (typeof window !== 'undefined') {
      let resizeTimeout: number;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
          this.deviceInfo = this.detectDevice();
        }, 250);
      });
    }
  }

  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  isMobile(): boolean {
    return this.deviceInfo.isMobile;
  }

  isTablet(): boolean {
    return this.deviceInfo.isTablet;
  }

  isDesktop(): boolean {
    return this.deviceInfo.isDesktop;
  }

  getScreenSize(): { width: number; height: number } {
    return {
      width: this.deviceInfo.screenWidth,
      height: this.deviceInfo.screenHeight
    };
  }

  isTouchSupported(): boolean {
    return this.deviceInfo.touchSupported;
  }

  refresh(): void {
    this.deviceInfo = this.detectDevice();
  }
}