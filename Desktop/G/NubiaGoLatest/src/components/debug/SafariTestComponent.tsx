'use client';

import React, { useState, useEffect } from 'react';
import { SafariDebugger, IOSFixes } from '@/lib/safari-debug';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export default function SafariTestComponent() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const initializeTests = async () => {
      const safariDebugger = SafariDebugger.getInstance();
      const info = await safariDebugger.initialize();
      setDebugInfo(info);
      
      // Run compatibility tests
      const results = await runCompatibilityTests(info);
      setTestResults(results);
    };

    initializeTests();
  }, []);

  const runCompatibilityTests = async (info: any): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: Safari Detection
    tests.push({
      name: 'Safari Detection',
      status: info.isSafari ? 'pass' : 'warning',
      message: info.isSafari ? 'Safari detected' : 'Not Safari browser'
    });

    // Test 2: iOS Detection
    tests.push({
      name: 'iOS Detection',
      status: info.isIOS ? 'pass' : 'warning',
      message: info.isIOS ? `iOS ${info.iosVersion} detected` : 'Not iOS device'
    });

    // Test 3: Backdrop Filter Support
    tests.push({
      name: 'Backdrop Filter',
      status: info.supportsBackdropFilter ? 'pass' : 'fail',
      message: info.supportsBackdropFilter ? 'Backdrop filter supported' : 'Backdrop filter not supported - fallbacks needed'
    });

    // Test 4: CSS Gap Support
    tests.push({
      name: 'CSS Gap Support',
      status: info.supportsGap ? 'pass' : 'fail',
      message: info.supportsGap ? 'CSS Gap supported' : 'CSS Gap not supported - use space utilities'
    });

    // Test 5: Dynamic Viewport Height
    tests.push({
      name: 'Dynamic Viewport Height',
      status: info.supportsDVH ? 'pass' : 'fail',
      message: info.supportsDVH ? 'DVH units supported' : 'DVH not supported - use CSS variables'
    });

    // Test 6: WebP Support
    tests.push({
      name: 'WebP Images',
      status: info.supportsWebP ? 'pass' : 'fail',
      message: info.supportsWebP ? 'WebP images supported' : 'WebP not supported - need fallbacks'
    });

    // Test 7: Touch Events
    tests.push({
      name: 'Touch Events',
      status: info.touchSupport ? 'pass' : 'warning',
      message: info.touchSupport ? 'Touch events supported' : 'No touch support detected'
    });

    // Test 8: Safe Area Insets
    const hasSafeArea = info.safeAreaInsets.top > 0 || info.safeAreaInsets.bottom > 0;
    tests.push({
      name: 'Safe Area Insets',
      status: hasSafeArea ? 'pass' : 'warning',
      message: hasSafeArea ? `Safe areas detected: T:${info.safeAreaInsets.top} B:${info.safeAreaInsets.bottom}` : 'No safe area insets detected'
    });

    // Test 9: Memory Usage
    if (info.memoryInfo) {
      const memoryUsageMB = Math.round(info.memoryInfo.usedJSHeapSize / 1024 / 1024);
      const memoryLimitMB = Math.round(info.memoryInfo.jsHeapSizeLimit / 1024 / 1024);
      const memoryPercent = (memoryUsageMB / memoryLimitMB) * 100;
      
      tests.push({
        name: 'Memory Usage',
        status: memoryPercent < 50 ? 'pass' : memoryPercent < 80 ? 'warning' : 'fail',
        message: `${memoryUsageMB}MB / ${memoryLimitMB}MB (${memoryPercent.toFixed(1)}%)`
      });
    }

    // Test 10: Viewport Size
    const isReasonableViewport = info.viewportSize.width > 0 && info.viewportSize.height > 0;
    tests.push({
      name: 'Viewport Size',
      status: isReasonableViewport ? 'pass' : 'fail',
      message: `${info.viewportSize.width}x${info.viewportSize.height}`
    });

    return tests;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const exportDebugData = () => {
    const safariDebugger = SafariDebugger.getInstance();
    const data = safariDebugger.exportDebugLogs();
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safari-debug-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testTouchEvents = () => {
    alert('Touch event test: If you see this alert, touch events are working!');
  };

  const testScrolling = () => {
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 200px;
      background: white;
      border: 2px solid #333;
      overflow-y: scroll;
      z-index: 10001;
      padding: 20px;
      -webkit-overflow-scrolling: touch;
    `;
    
    testDiv.innerHTML = `
      <h3>Scroll Test</h3>
      <p>Try scrolling this content:</p>
      ${Array.from({ length: 20 }, (_, i) => `<p>Line ${i + 1}</p>`).join('')}
      <button onclick="this.parentElement.remove()" style="margin-top: 20px; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px;">Close</button>
    `;
    
    document.body.appendChild(testDiv);
  };

  if (!debugInfo) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Initializing Safari tests...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-colors"
        title="Toggle Safari Debug Panel"
      >
        🔧
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Safari Compatibility Test</h2>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Test Results */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Compatibility Tests</h3>
                <div className="space-y-2">
                  {testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getStatusIcon(test.status)}</span>
                        <span className="font-medium text-gray-900">{test.name}</span>
                      </div>
                      <span className={`text-sm ${getStatusColor(test.status)}`}>
                        {test.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Tests */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Interactive Tests</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={testTouchEvents}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Test Touch Events
                  </button>
                  <button
                    onClick={testScrolling}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Test Scrolling
                  </button>
                  <button
                    onClick={exportDebugData}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Export Debug Data
                  </button>
                </div>
              </div>

              {/* Device Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div><strong>Browser:</strong> {debugInfo.isSafari ? 'Safari' : 'Other'}</div>
                    <div><strong>Platform:</strong> {debugInfo.isIOS ? 'iOS' : 'Other'}</div>
                    <div><strong>iOS Version:</strong> {debugInfo.iosVersion || 'N/A'}</div>
                    <div><strong>Safari Version:</strong> {debugInfo.safariVersion || 'N/A'}</div>
                    <div><strong>Device Pixel Ratio:</strong> {debugInfo.devicePixelRatio}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Screen Size:</strong> {debugInfo.screenSize.width}×{debugInfo.screenSize.height}</div>
                    <div><strong>Viewport Size:</strong> {debugInfo.viewportSize.width}×{debugInfo.viewportSize.height}</div>
                    <div><strong>Connection:</strong> {debugInfo.connectionType}</div>
                    <div><strong>Touch Support:</strong> {debugInfo.touchSupport ? 'Yes' : 'No'}</div>
                    {debugInfo.memoryInfo && (
                      <div><strong>Memory Used:</strong> {Math.round(debugInfo.memoryInfo.usedJSHeapSize / 1024 / 1024)}MB</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Debug Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use <kbd className="bg-blue-200 px-1 rounded">Ctrl+Shift+D</kbd> to toggle debug panel</li>
                  <li>• On mobile: Triple-tap with 3 fingers to show debug info</li>
                  <li>• Check browser console for detailed Safari-specific logs</li>
                  <li>• Export debug data to share with developers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
