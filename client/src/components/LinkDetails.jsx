import { Calendar, Eye, Edit, Trash2, Link as LinkIcon, FileText } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const LinkDetails = ({ link, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    setDeleting(true);
    await onDelete(link.shortCode);
    setDeleting(false);
  };

  const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Mock metadata if not present
  const metadata = link.metadata || {
    photos: 0, video: 0, audio: 0, image: 0, file: 0,
    link: 0, note: 0, comment: 0, share: 0, download: 0,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg text-gray-800">Information</h3>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition" title="Edit">
            <Edit size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-red-600 transition"
            title="Trash"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-start space-x-2">
          <LinkIcon className="text-blue-600 mt-0.5" size={16} />
          <div>
            <p className="text-sm font-medium">{link.title || 'Untitled'}</p>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              {link.originalUrl}
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{createdDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{link.clickCount} clicks</span>
          </div>
        </div>

        {/* Metadata counts – mimic design */}
        <div className="border-t border-gray-100 pt-3 mt-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Details</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(metadata).map(([key, count]) => (
              count > 0 && (
                <span key={key} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                  {count} {key}
                </span>
              )
            ))}
          </div>
        </div>

        <div className="flex space-x-4 text-sm mt-2">
          <button className="text-blue-600 hover:underline">Metrics</button>
          <button className="text-blue-600 hover:underline">Edit</button>
          <button className="text-red-500 hover:underline" onClick={handleDelete}>Trash</button>
        </div>
      </div>
    </div>
  );
};

export default LinkDetails;