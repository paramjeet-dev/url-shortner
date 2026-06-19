import { Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LinkItem = ({ link, isSelected, onSelect }) => {
  const handleShare = (e) => {
    e.stopPropagation();
    const shortUrl = `${import.meta.env.VITE_BASE_URL || window.location.origin}/${link.shortCode}`;
    navigator.clipboard.writeText(shortUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{link.title || link.originalUrl}</p>
        <p className="text-xs text-gray-400 truncate">{link.originalUrl}</p>
      </div>
      <button
        onClick={handleShare}
        className="ml-2 p-1.5 text-gray-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50"
        title="Click here to share"
      >
        <Share2 size={16} />
      </button>
    </div>
  );
};

export default LinkItem;