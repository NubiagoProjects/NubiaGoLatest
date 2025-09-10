'use client';

import { useEffect } from 'react';
import { SafariDebugger, IOSFixes } from '@/lib/safari-debug';
import { IOSStyleManager } from '@/lib/ios-detection';
import { SafariFontOptimizer } from '@/lib/font-optimization';

export default function SafariInitializer() {
  useEffect(() => {
    const initializeSafariSupport = async () => {
      try {
        // Initialize Safari debugging and detection
        const safariDebugger = SafariDebugger.getInstance();
        await safariDebugger.initialize();

        // Apply iOS-specific styles and fixes
        IOSStyleManager.applyConditionalStyles();
        
        // Apply iOS fixes
        IOSFixes.applyScrollFixes();
        IOSFixes.fixTouchEvents();
        IOSFixes.fixViewportHeight();
        IOSFixes.optimizeMemory();

        // Optimize font loading for Safari
        const fontOptimizer = SafariFontOptimizer.getInstance();
        await fontOptimizer.optimizeForSafari();

        console.log('Safari iOS compatibility initialized successfully');
      } catch (error) {
        console.error('Safari initialization failed:', error);
      }
    };

    initializeSafariSupport();
  }, []);

  // This component doesn't render anything visible
  return null;
}
