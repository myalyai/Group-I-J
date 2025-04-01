import { useState } from 'react';
import { 
  ClipboardDocumentIcon, 
  ClipboardDocumentCheckIcon, 
  ArrowDownTrayIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

interface TestResultProps {
  testResult: string;
}

export default function TestResult({ testResult }: TestResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(testResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([testResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keywords.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#1a1b26] rounded-lg border border-gray-800">
      {/* Header with buttons */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2 text-gray-400">
          <HashtagIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Generated Keywords</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="group relative flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="absolute inset-0 bg-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                <span className="text-sm text-gray-400 group-hover:text-purple-400">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="group relative flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="absolute inset-0 bg-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
            <span className="text-sm text-gray-400 group-hover:text-purple-400">Download</span>
          </button>
        </div>
      </div>

      {/* Keywords Content */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {testResult.split(',').map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 bg-gray-800/40 hover:bg-gray-700/60 rounded-md text-sm text-gray-300 hover:text-purple-300 transition-all duration-200 cursor-default border border-gray-700/50"
            >
              {keyword.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
