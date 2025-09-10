/* Safari iOS Font Loading Optimizations */

export interface FontLoadingStrategy {
  preload: boolean;
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  fallback: string[];
  timeout: number;
}

export class SafariFontOptimizer {
  private static instance: SafariFontOptimizer;
  private loadedFonts = new Set<string>();
  private fontLoadPromises = new Map<string, Promise<void>>();

  static getInstance(): SafariFontOptimizer {
    if (!SafariFontOptimizer.instance) {
      SafariFontOptimizer.instance = new SafariFontOptimizer();
    }
    return SafariFontOptimizer.instance;
  }

  async optimizeForSafari() {
    if (typeof window === 'undefined') return;

    // Safari-specific font loading strategies
    const strategies: Record<string, FontLoadingStrategy> = {
      'Inter': {
        preload: true,
        display: 'swap',
        fallback: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        timeout: 3000
      },
      'system-fonts': {
        preload: false,
        display: 'auto',
        fallback: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Helvetica Neue', 'Arial'],
        timeout: 1000
      }
    };

    // Apply font loading optimizations
    await this.preloadCriticalFonts(strategies);
    this.optimizeFontDisplay();
    this.setupFontLoadingFallbacks();
    this.monitorFontPerformance();
  }

  private async preloadCriticalFonts(strategies: Record<string, FontLoadingStrategy>) {
    const criticalFonts = Object.entries(strategies).filter(([_, strategy]) => strategy.preload);
    
    for (const [fontFamily, strategy] of criticalFonts) {
      try {
        await this.loadFont(fontFamily, strategy);
      } catch (error) {
        console.warn(`Failed to preload font ${fontFamily}:`, error);
      }
    }
  }

  private async loadFont(fontFamily: string, strategy: FontLoadingStrategy): Promise<void> {
    if (this.loadedFonts.has(fontFamily)) return;

    if (this.fontLoadPromises.has(fontFamily)) {
      return this.fontLoadPromises.get(fontFamily);
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Font ${fontFamily} loading timeout`));
      }, strategy.timeout);

      if ('fonts' in document) {
        // Use Font Loading API if available
        const font = new FontFace(fontFamily, `url(/fonts/${fontFamily.toLowerCase()}.woff2)`);
        
        font.load().then(() => {
          clearTimeout(timeout);
          document.fonts.add(font);
          this.loadedFonts.add(fontFamily);
          resolve();
        }).catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
      } else {
        // Fallback for older Safari versions
        const testElement = (document as Document).createElement('div');
        testElement.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          font-family: ${fontFamily}, ${strategy.fallback.join(', ')};
          font-size: 100px;
          visibility: hidden;
        `;
        testElement.textContent = 'Test';
        (document as Document).body.appendChild(testElement);

        const checkFont = () => {
          const computedStyle = getComputedStyle(testElement);
          if (computedStyle.fontFamily.includes(fontFamily)) {
            clearTimeout(timeout);
            (document as Document).body.removeChild(testElement);
            this.loadedFonts.add(fontFamily);
            resolve();
          } else {
            setTimeout(checkFont, 100);
          }
        };

        checkFont();
      }
    });

    this.fontLoadPromises.set(fontFamily, loadPromise);
    return loadPromise;
  }

  private optimizeFontDisplay() {
    // Add font-display: swap to all font-face declarations
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: url('/fonts/inter.woff2') format('woff2'),
             url('/fonts/inter.woff') format('woff');
      }
      
      /* Safari-optimized font stacks */
      .font-system {
        font-family: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', Arial, sans-serif;
      }
      
      .font-mono-system {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      }
      
      /* Prevent invisible text during font swap */
      .font-loading {
        font-display: swap;
        text-rendering: optimizeSpeed;
      }
    `;
    document.head.appendChild(style);
  }

  private setupFontLoadingFallbacks() {
    // Create CSS with progressive enhancement
    const fallbackStyle = document.createElement('style');
    fallbackStyle.textContent = `
      /* Base fonts that load immediately */
      body {
        font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      }
      
      /* Enhanced fonts after loading */
      .fonts-loaded body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      }
      
      /* Prevent layout shift during font loading */
      .font-loading-container {
        font-size: 16px;
        line-height: 1.5;
        letter-spacing: normal;
      }
      
      /* Safari-specific font smoothing */
      @supports (-webkit-font-smoothing: antialiased) {
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      }
    `;
    document.head.appendChild(fallbackStyle);

    // Add fonts-loaded class when fonts are ready
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    } else {
      // Fallback for older Safari
      setTimeout(() => {
        document.documentElement.classList.add('fonts-loaded');
      }, 3000);
    }
  }

  private monitorFontPerformance() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('font')) {
            console.log(`Font loaded: ${entry.name} (${entry.duration}ms)`);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Font performance monitoring not available:', error);
    }
  }

  // Method to check if critical fonts are loaded
  areCriticalFontsLoaded(): boolean {
    return this.loadedFonts.size > 0;
  }

  // Method to get font loading status
  getFontLoadingStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const font of this.loadedFonts) {
      status[font] = true;
    }
    return status;
  }
}

// Font loading utilities for components
export const useSafariFontOptimization = () => {
  if (typeof window === 'undefined') return { fontsLoaded: false };

  const optimizer = SafariFontOptimizer.getInstance();
  
  return {
    fontsLoaded: optimizer.areCriticalFontsLoaded(),
    fontStatus: optimizer.getFontLoadingStatus(),
    initializeFonts: () => optimizer.optimizeForSafari()
  };
};

// Auto-initialize font optimization
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    SafariFontOptimizer.getInstance().optimizeForSafari();
  });
}
