import { Copy, Share2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const LinkItem = ({ link, isSelected, onSelect }) => {
  const handleShare = (e) => {
    e.stopPropagation();
    const shortUrl = `${import.meta.env.VITE_BASE_URL || window.location.origin}/${link.shortCode}`;
    navigator.clipboard.writeText(shortUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50 border border-transparent'
      } ${isExpired ? 'opacity-60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{link.title || link.originalUrl}</p>
        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
          <span className="truncate">{link.originalUrl}</span>
          {isExpired && (
            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium">Expired</span>
          )}
          {!isExpired && link.expiresAt && (
            <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium">Active</span>
          )}
          <span className="text-gray-300">•</span>
          <span>{link.clickCount || 0} clicks</span>
        </div>
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