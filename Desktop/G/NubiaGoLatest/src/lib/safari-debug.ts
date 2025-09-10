/* Safari iOS Advanced Debugging & Detection */

export interface SafariDebugInfo {
  userAgent: string;
  isSafari: boolean;
  isIOS: boolean;
  iosVersion: string | null;
  safariVersion: string | null;
  supportsBackdropFilter: boolean;
  supportsGap: boolean;
  supportsDVH: boolean;
  supportsWebP: boolean;
  devicePixelRatio: number;
  screenSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  memoryInfo: any;
  connectionType: string;
  touchSupport: boolean;
}

export class SafariDebugger {
  private static instance: SafariDebugger;
  private debugInfo: SafariDebugInfo | null = null;
  private debugPanel: HTMLElement | null = null;

  static getInstance(): SafariDebugger {
    if (!SafariDebugger.instance) {
      SafariDebugger.instance = new SafariDebugger();
    }
    return SafariDebugger.instance;
  }

  async initialize(): Promise<SafariDebugInfo> {
    if (typeof window === 'undefined') {
      return {} as SafariDebugInfo;
    }

    this.debugInfo = await this.collectDebugInfo();
    
    // Enable debugging in development
    if (process.env.NODE_ENV === 'development') {
      this.createDebugPanel();
      this.enableAdvancedLogging();
    }

    return this.debugInfo;
  }

  private async collectDebugInfo(): Promise<SafariDebugInfo> {
    const userAgent = navigator.userAgent;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    
    // Extract iOS version
    const iosMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    const iosVersion = iosMatch ? `${iosMatch[1]}.${iosMatch[2]}.${iosMatch[3] || 0}` : null;
    
    // Extract Safari version
    const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
    const safariVersion = safariMatch ? safariMatch[1] : null;

    // Feature detection
    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)') || 
                                   CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
    
    const supportsGap = CSS.supports('gap', '1rem');
    const supportsDVH = CSS.supports('height', '100dvh');
    
    // WebP support detection
    const supportsWebP = await this.detectWebPSupport();

    // Safe area insets
    const safeAreaInsets = this.getSafeAreaInsets();

    // Memory info (if available)
    const memoryInfo = (performance as any).memory || null;

    // Connection type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType || connection.type : 'unknown';

    return {
      userAgent,
      isSafari,
      isIOS,
      iosVersion,
      safariVersion,
      supportsBackdropFilter,
      supportsGap,
      supportsDVH,
      supportsWebP,
      devicePixelRatio: window.devicePixelRatio,
      screenSize: {
        width: screen.width,
        height: screen.height
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      safeAreaInsets,
      memoryInfo,
      connectionType,
      touchSupport: 'ontouchstart' in window
    };
  }

  private async detectWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  private getSafeAreaInsets() {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0')
    };
  }

  private createDebugPanel() {
    if (!this.debugInfo || this.debugPanel) return;

    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'safari-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      display: none;
    `;

    const content = `
      <div style="margin-bottom: 10px;">
        <strong>Safari Debug Info</strong>
        <button onclick="this.parentElement.parentElement.style.display='none'" style="float: right; background: red; color: white; border: none; padding: 2px 6px; border-radius: 3px;">×</button>
      </div>
      <div><strong>Safari:</strong> ${this.debugInfo.isSafari}</div>
      <div><strong>iOS:</strong> ${this.debugInfo.isIOS}</div>
      <div><strong>iOS Version:</strong> ${this.debugInfo.iosVersion || 'N/A'}</div>
      <div><strong>Safari Version:</strong> ${this.debugInfo.safariVersion || 'N/A'}</div>
      <div><strong>Backdrop Filter:</strong> ${this.debugInfo.supportsBackdropFilter}</div>
      <div><strong>Gap Support:</strong> ${this.debugInfo.supportsGap}</div>
      <div><strong>DVH Support:</strong> ${this.debugInfo.supportsDVH}</div>
      <div><strong>WebP Support:</strong> ${this.debugInfo.supportsWebP}</div>
      <div><strong>Device Pixel Ratio:</strong> ${this.debugInfo.devicePixelRatio}</div>
      <div><strong>Screen:</strong> ${this.debugInfo.screenSize.width}x${this.debugInfo.screenSize.height}</div>
      <div><strong>Viewport:</strong> ${this.debugInfo.viewportSize.width}x${this.debugInfo.viewportSize.height}</div>
      <div><strong>Safe Area:</strong> T:${this.debugInfo.safeAreaInsets.top} B:${this.debugInfo.safeAreaInsets.bottom} L:${this.debugInfo.safeAreaInsets.left} R:${this.debugInfo.safeAreaInsets.right}</div>
      <div><strong>Connection:</strong> ${this.debugInfo.connectionType}</div>
      <div><strong>Touch Support:</strong> ${this.debugInfo.touchSupport}</div>
      ${this.debugInfo.memoryInfo ? `<div><strong>Memory:</strong> ${Math.round(this.debugInfo.memoryInfo.usedJSHeapSize / 1024 / 1024)}MB used</div>` : ''}
    `;

    this.debugPanel.innerHTML = content;
    document.body.appendChild(this.debugPanel);

    // Add keyboard shortcut to toggle debug panel
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.toggleDebugPanel();
      }
    });

    // Add touch gesture to show debug panel on mobile
    let touchCount = 0;
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 3) {
        touchCount++;
        if (touchCount >= 2) {
          this.toggleDebugPanel();
          touchCount = 0;
        }
        setTimeout(() => touchCount = 0, 1000);
      }
    });
  }

  private toggleDebugPanel() {
    if (this.debugPanel) {
      this.debugPanel.style.display = this.debugPanel.style.display === 'none' ? 'block' : 'none';
    }
  }

  private enableAdvancedLogging() {
    // Override console methods to capture Safari-specific errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      originalError.apply(console, args);
      this.logSafariIssue('ERROR', args.join(' '));
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      this.logSafariIssue('WARN', args.join(' '));
    };

    // Capture unhandled errors
    window.addEventListener('error', (e) => {
      this.logSafariIssue('UNHANDLED_ERROR', `${e.message} at ${e.filename}:${e.lineno}:${e.colno}`);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.logSafariIssue('UNHANDLED_REJECTION', e.reason);
    });

    // Monitor performance
    this.monitorPerformance();
  }

  private logSafariIssue(type: string, message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      message,
      debugInfo: this.debugInfo,
      url: window.location.href,
      stack: new Error().stack
    };

    // Store in localStorage for debugging
    const logs = JSON.parse(localStorage.getItem('safari-debug-logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 50 logs
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }
    
    localStorage.setItem('safari-debug-logs', JSON.stringify(logs));

    // Also log to console with Safari prefix
    console.log(`[SAFARI-DEBUG] ${type}:`, message);
  }

  private monitorPerformance() {
    // Monitor memory usage
    setInterval(() => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        
        if (usedMB > limitMB * 0.8) {
          this.logSafariIssue('MEMORY_WARNING', `High memory usage: ${usedMB}MB / ${limitMB}MB`);
        }
      }
    }, 30000); // Check every 30 seconds

    // Monitor viewport changes
    let lastViewport = { width: window.innerWidth, height: window.innerHeight };
    window.addEventListener('resize', () => {
      const newViewport = { width: window.innerWidth, height: window.innerHeight };
      this.logSafariIssue('VIEWPORT_CHANGE', `${lastViewport.width}x${lastViewport.height} -> ${newViewport.width}x${newViewport.height}`);
      lastViewport = newViewport;
    });
  }

  getDebugInfo(): SafariDebugInfo | null {
    return this.debugInfo;
  }

  exportDebugLogs(): string {
    const logs = localStorage.getItem('safari-debug-logs') || '[]';
    return JSON.stringify({
      debugInfo: this.debugInfo,
      logs: JSON.parse(logs),
      exportTime: new Date().toISOString()
    }, null, 2);
  }
}

// iOS-specific fixes and utilities
export class IOSFixes {
  static applyScrollFixes() {
    if (typeof window === 'undefined') return;

    // Fix iOS scroll bounce
    document.body.style.overscrollBehavior = 'none';
    
    // Fix iOS momentum scrolling
    const scrollElements = document.querySelectorAll('[data-ios-scroll]');
    scrollElements.forEach(el => {
      const element = el as HTMLElement;
      element.style.setProperty('-webkit-overflow-scrolling', 'touch');
    });
  }

  static fixTouchEvents() {
    if (typeof window === 'undefined') return;

    // Prevent iOS zoom on input focus
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      (input as HTMLElement).style.fontSize = '16px';
    });

    // Fix iOS touch delay
    document.addEventListener('touchstart', () => {}, { passive: true });
  }

  static fixViewportHeight() {
    if (typeof window === 'undefined') return;

    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });
  }

  static optimizeMemory() {
    if (typeof window === 'undefined') return;

    // Clean up event listeners on page unload
    window.addEventListener('beforeunload', () => {
      // Remove all event listeners
      document.querySelectorAll('*').forEach(el => {
        const clone = el.cloneNode(true);
        el.parentNode?.replaceChild(clone, el);
      });
    });

    // Periodic garbage collection hint
    setInterval(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    }, 60000);
  }
}

// Initialize Safari debugging on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    SafariDebugger.getInstance().initialize();
    IOSFixes.applyScrollFixes();
    IOSFixes.fixTouchEvents();
    IOSFixes.fixViewportHeight();
    IOSFixes.optimizeMemory();
  });
}
