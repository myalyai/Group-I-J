'use client'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full animate-pulse"></div>
        <div className="relative flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 relative animate-bounce" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
            <p className="text-gray-400 max-w-md">{error.message || 'An unexpected error occurred'}</p>
          </div>
          <button
            onClick={reset}
            className="px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
} 