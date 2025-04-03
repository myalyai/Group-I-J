import { SparklesIcon } from '@heroicons/react/16/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React from 'react';


const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse"></div>
          <div className="relative flex flex-col items-center space-y-4">
            <ArrowPathIcon className="w-12 h-12 text-purple-500 animate-spin" />
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-lg font-medium text-white">Loading your experience</span>
            </div>
            <p className="text-sm text-gray-400">Preparing the magic...</p>
          </div>
        </div>
      </div>
    );
};

export default Loading;