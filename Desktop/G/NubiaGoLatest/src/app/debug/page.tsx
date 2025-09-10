'use client';

import SafariTestComponent from '@/components/debug/SafariTestComponent';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Safari iOS Debug Center</h1>
        <p className="text-gray-600 mb-8">
          Comprehensive Safari iOS compatibility testing and debugging tools for NubiaGo.
        </p>
        
        <SafariTestComponent />
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">How to Use Safari Web Inspector</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900">On Mac (for iOS Safari debugging):</h3>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Connect your iPhone/iPad to Mac via USB</li>
                <li>On iOS device: Settings → Safari → Advanced → Web Inspector (ON)</li>
                <li>On Mac: Safari → Develop → [Your Device] → [Website]</li>
                <li>Use Console, Elements, and Network tabs to debug</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Debug Panel Shortcuts:</h3>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+D</kbd> - Toggle debug panel</li>
                <li><kbd className="bg-gray-200 px-1 rounded">Triple-tap (3 fingers)</kbd> - Show debug on mobile</li>
                <li>Check browser console for detailed Safari logs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Common Safari Issues Fixed:</h3>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>✅ Backdrop-filter fallbacks for older Safari versions</li>
                <li>✅ CSS Gap replaced with space utilities</li>
                <li>✅ Dynamic viewport height (100dvh) with fallbacks</li>
                <li>✅ Safe area insets for iPhone notch/Dynamic Island</li>
                <li>✅ Touch event optimizations and hardware acceleration</li>
                <li>✅ Font loading optimizations with display: swap</li>
                <li>✅ iOS scroll behavior and memory management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
