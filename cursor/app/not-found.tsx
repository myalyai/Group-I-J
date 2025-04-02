'use client'

import { QuestionMarkCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    // This will navigate back to the previous page in history
    window.history.back()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full animate-pulse"></div>
        <div className="relative flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
            <QuestionMarkCircleIcon className="w-16 h-16 text-purple-500 relative animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
            <p className="text-gray-400 max-w-md">We couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
          </div>
          <button
            onClick={handleGoBack}
            className="group px-6 py-3 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}