import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface KeywordsResultProps {
  result: string;
  category?: string;
}

export default function KeywordsResult({ result, category }: KeywordsResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 overflow-hidden bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">
          Generated {category || 'Keywords'}:
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ClipboardDocumentIcon className="w-5 h-5" />
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 bg-gray-900/50">
        <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
          {result}
        </pre>
      </div>
    </div>
  );
}
