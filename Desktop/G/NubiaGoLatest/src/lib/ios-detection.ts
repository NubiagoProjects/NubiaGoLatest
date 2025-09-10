/* iOS Detection and Conditional Handling */

export interface IOSInfo {
  isIOS: boolean;
  isIPad: boolean;
  isIPhone: boolean;
  isIPod: boolean;
  version: string | null;
  majorVersion: number | null;
  isStandalone: boolean;
  isSafari: boolean;
  supportsHover: boolean;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
}

export class IOSDetector {
  private static cachedInfo: IOSInfo | null = null;

  static detect(): IOSInfo {
    if (this.cachedInfo) return this.cachedInfo;
    if (typeof window === 'undefined') {
      return this.getDefaultInfo();
    }

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                  (platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad on iOS 13+
    
    const isIPad = /iPad/.test(userAgent) || 
                   (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const isIPhone = /iPhone/.test(userAgent);
    const isIPod = /iPod/.test(userAgent);

    // Version detection
    const versionMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    const version = versionMatch ? `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3] || 0}` : null;
    const majorVersion = versionMatch ? parseInt(versionMatch[1]) : null;

    // Safari detection
    const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);

    // Standalone mode (PWA)
    const isStandalone = (window.navigator as any).standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches;

    // Hover support
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    // Notch/Dynamic Island detection
    const hasNotch = this.detectNotch();
    const hasDynamicIsland = this.detectDynamicIsland();

    this.cachedInfo = {
      isIOS,
      isIPad,
      isIPhone,
      isIPod,
      version,
      majorVersion,
      isStandalone,
      isSafari,
      supportsHover,
      hasNotch,
      hasDynamicIsland
    };

    return this.cachedInfo;
  }

  private static detectNotch(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for safe area insets
    const testElement = document.createElement('div');
    testElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      padding-top: env(safe-area-inset-top);
      visibility: hidden;
    `;
    
    document.body.appendChild(testElement);
    const hasInset = getComputedStyle(testElement).paddingTop !== '0px';
    document.body.removeChild(testElement);
    
    return hasInset;
  }

  private static detectDynamicIsland(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Dynamic Island detection based on screen dimensions and safe area
    const { screen } = window;
    const ratio = screen.width / screen.height;
    
    // iPhone 14 Pro/Pro Max have specific ratios and safe area patterns
    return (ratio > 0.45 && ratio < 0.48) && this.detectNotch();
  }

  static getDefaultInfo(): IOSInfo {
    return {
      isIOS: false,
      isIPad: false,
      isIPhone: false,
      isIPod: false,
      version: null,
      majorVersion: null,
      isStandalone: false,
      isSafari: false,
      supportsHover: true,
      hasNotch: false,
      hasDynamicIsland: false
    };
  }

  static isIOSVersion(minVersion: number): boolean {
    const info = this.detect();
    return info.majorVersion ? info.majorVersion >= minVersion : false;
  }

  static requiresIOSFixes(): boolean {
    const info = this.detect();
    return info.isIOS && info.isSafari;
  }
}

// Conditional CSS class application
export class IOSStyleManager {
  private static applied = false;

  static applyConditionalStyles() {
    if (this.applied || typeof document === 'undefined') return;

    const iosInfo = IOSDetector.detect();
    const { documentElement } = document;

    // Add iOS-specific classes
    if (iosInfo.isIOS) {
      documentElement.classList.add('ios');
      
      if (iosInfo.isIPhone) documentElement.classList.add('iphone');
      if (iosInfo.isIPad) documentElement.classList.add('ipad');
      if (iosInfo.isIPod) documentElement.classList.add('ipod');
      if (iosInfo.isSafari) documentElement.classList.add('safari');
      if (iosInfo.isStandalone) documentElement.classList.add('standalone');
      if (iosInfo.hasNotch) documentElement.classList.add('has-notch');
      if (iosInfo.hasDynamicIsland) documentElement.classList.add('has-dynamic-island');
      if (!iosInfo.supportsHover) documentElement.classList.add('no-hover');

      // Version-specific classes
      if (iosInfo.majorVersion) {
        documentElement.classList.add(`ios-${iosInfo.majorVersion}`);
        
        // Legacy iOS versions that need special handling
        if (iosInfo.majorVersion < 14) documentElement.classList.add('ios-legacy');
        if (iosInfo.majorVersion < 15) documentElement.classList.add('ios-pre-15');
      }
    }

    this.applied = true;
  }

  static getIOSSpecificCSS(): string {
    const iosInfo = IOSDetector.detect();
    if (!iosInfo.isIOS) return '';

    return `
      /* iOS-specific styles */
      .ios {
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
      }

      /* iPhone-specific */
      .iphone {
        --ios-status-bar-height: 20px;
      }

      /* iPad-specific */
      .ipad {
        --ios-status-bar-height: 20px;
      }

      /* Notch handling */
      .has-notch {
        --ios-status-bar-height: 44px;
        --safe-area-top: env(safe-area-inset-top, 44px);
      }

      /* Dynamic Island handling */
      .has-dynamic-island {
        --ios-status-bar-height: 54px;
        --safe-area-top: env(safe-area-inset-top, 54px);
      }

      /* Safari-specific fixes */
      .safari {
        /* Fix for Safari's aggressive caching */
        -webkit-transform: translateZ(0);
      }

      /* Standalone PWA */
      .standalone {
        --ios-status-bar-height: 0px;
      }

      /* No hover support */
      .no-hover button:hover,
      .no-hover .hover\\:bg-gray-100:hover {
        /* Disable hover effects on touch devices */
        background-color: inherit;
      }

      /* Legacy iOS versions */
      .ios-legacy {
        /* Fallbacks for older iOS versions */
      }

      .ios-pre-15 {
        /* Specific fixes for iOS < 15 */
        .backdrop-blur {
          backdrop-filter: none;
          background-color: rgba(255, 255, 255, 0.8);
        }
      }
    `;
  }
}

// React hook for iOS detection
export const useIOSDetection = () => {
  if (typeof window === 'undefined') {
    return {
      isIOS: false,
      isIPad: false,
      isIPhone: false,
      isIPod: false,
      version: null,
      majorVersion: null,
      isStandalone: false,
      isSafari: false,
      supportsHover: true,
      hasNotch: false,
      hasDynamicIsland: false
    };
  }

  return IOSDetector.detect();
};

// Utility functions
export const iosUtils = {
  // Check if current device needs iOS-specific handling
  needsIOSFixes: () => IOSDetector.requiresIOSFixes(),
  
  // Get iOS-safe viewport height
  getViewportHeight: () => {
    if (typeof window === 'undefined') return '100vh';
    
    const iosInfo = IOSDetector.detect();
    if (iosInfo.isIOS) {
      return 'calc(var(--vh, 1vh) * 100)';
    }
    return '100vh';
  },
  
  // Get safe area aware padding
  getSafeAreaPadding: (side: 'top' | 'bottom' | 'left' | 'right' = 'top') => {
    const iosInfo = IOSDetector.detect();
    if (!iosInfo.isIOS) return '0px';
    
    return `env(safe-area-inset-${side}, 0px)`;
  },
  
  // Check if device has physical home button
  hasHomeButton: () => {
    const iosInfo = IOSDetector.detect();
    return iosInfo.isIOS && !iosInfo.hasNotch && !iosInfo.hasDynamicIsland;
  },
  
  // Get recommended touch target size
  getTouchTargetSize: () => {
    const iosInfo = IOSDetector.detect();
    return iosInfo.isIOS ? '44px' : '40px'; // iOS HIG recommends 44pt minimum
  }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  // Apply styles immediately
  IOSStyleManager.applyConditionalStyles();
  
  // Also apply after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      IOSStyleManager.applyConditionalStyles();
    });
  }
}
