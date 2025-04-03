import { 
  ClipboardDocumentIcon, 
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  HashtagIcon 
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface KeywordsResultProps {
  result: string;
  category?: string;
}

export default function KeywordsResult({ result, category }: KeywordsResultProps) {
  const [copied, setCopied] = useState(false);
  const isKeywordCategory = category?.toLowerCase().includes('keyword');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category || 'result'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 overflow-hidden bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">
          Generated {category || 'Result'}:
        </h3>
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
      <div className="p-4 bg-gray-900/50">
        {isKeywordCategory ? (
          <div className="flex flex-wrap gap-2">
            {result.split(',').map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 bg-gray-800/40 hover:bg-gray-700/60 rounded-md text-sm text-gray-300 hover:text-purple-300 transition-all duration-200 cursor-default border border-gray-700/50"
              >
                {keyword.trim()}
              </span>
            ))}
          </div>
        ) : (
          <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
