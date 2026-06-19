import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ResultDisplay = ({ shortUrl, shortCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div className="flex-1 truncate">
        <span className="text-blue-600 font-medium">{shortUrl}</span>
      </div>
      <div className="flex items-center space-x-3">
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          Open
        </a>
        <button
          onClick={handleCopy}
          className="p-2 text-gray-500 hover:text-blue-600 transition"
          title="Copy"
        >
          {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;