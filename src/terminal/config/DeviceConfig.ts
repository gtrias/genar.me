export interface DeviceConfig {
  typeDelay: {
    mobile: number;
    desktop: number;
  };
  glitch: {
    interval: number;
    probability: number;
  };
  mobileRegex: RegExp;
  responsive: {
    mobile: {
      padding: number;
      fontSize: number;
      borderRadius: string;
      crtIntensity: number;
      reflectionOpacity: number;
      vignetteOpacity: number;
      scrollbarWidth: number;
    };
    desktop: {
      padding: number;
      fontSize: number;
      borderRadius: string;
      crtIntensity: number;
      reflectionOpacity: number;
      vignetteOpacity: number;
      scrollbarWidth: number;
    };
  };
}

export const defaultDeviceConfig: DeviceConfig = {
  typeDelay: {
    mobile: 15,
    desktop: 25,
  },
  glitch: {
    interval: 3000,
    probability: 0.02,
  },
  mobileRegex: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
  responsive: {
    mobile: {
      padding: 20,
      fontSize: 14,
      borderRadius: '2.5% / 2%',
      crtIntensity: 0.5,
      reflectionOpacity: 0.5,
      vignetteOpacity: 0.6,
      scrollbarWidth: 10,
    },
    desktop: {
      padding: 40,
      fontSize: 18,
      borderRadius: '3% / 2.5%',
      crtIntensity: 1,
      reflectionOpacity: 1,
      vignetteOpacity: 1,
      scrollbarWidth: 14,
    },
  },
};