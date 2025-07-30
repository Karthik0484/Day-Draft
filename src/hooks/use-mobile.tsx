import { useState, useEffect } from 'react';

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export const useMobile = (): MobileState => {
  const [mobileState, setMobileState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
  });

  useEffect(() => {
    const updateMobileState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setMobileState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    // Set initial state
    updateMobileState();

    // Add event listener
    window.addEventListener('resize', updateMobileState);
    window.addEventListener('orientationchange', updateMobileState);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateMobileState);
      window.removeEventListener('orientationchange', updateMobileState);
    };
  }, []);

  return mobileState;
};

// Utility functions for responsive design
export const useResponsive = () => {
  const { isMobile, isTablet, isDesktop, screenWidth } = useMobile();

  const getResponsiveValue = <T,>(
    mobile: T,
    tablet: T,
    desktop: T
  ): T => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  const getResponsiveClass = (
    mobileClass: string,
    tabletClass: string,
    desktopClass: string
  ): string => {
    return getResponsiveValue(mobileClass, tabletClass, desktopClass);
  };

  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const getSafeAreaInsets = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0'),
    };
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    getResponsiveValue,
    getResponsiveClass,
    isTouchDevice: isTouchDevice(),
    getSafeAreaInsets,
  };
};
