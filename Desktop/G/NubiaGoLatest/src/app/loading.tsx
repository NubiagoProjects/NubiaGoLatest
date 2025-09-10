export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        {/* Premium Loading Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <div className="w-16 h-16 bg-white rounded-2xl animate-spin"></div>
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-primary-600 border-r-secondary-600 rounded-3xl animate-spin mx-auto"></div>
        </div>
        
        {/* Premium Loading Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Loading...
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            Please wait while we load your content with enterprise-grade performance
          </p>
        </div>
        
        {/* Premium Loading Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-secondary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
} 
