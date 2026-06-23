import { useState } from 'react';
import { Calendar, Eye, Edit, Trash2, Link as LinkIcon, Clock, Check, X, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateLinkTitle, extendLinkExpiry } from '../services/api';
import QRModal from './QRModal';

const LinkDetails = ({ link, onDelete, onUpdate }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(link.title || '');
  const [deleting, setDeleting] = useState(false);
  const [extending, setExtending] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleQR = () => setShowQR(true);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      setDeleting(true);
      await onDelete(link.shortCode);
      toast.success('Link deleted');
    } catch (err) {
      toast.error('Failed to delete link');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveTitle = async () => {
    try {
      await updateLinkTitle(link.shortCode, titleValue);
      toast.success('Title updated');
      setEditingTitle(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update title');
    }
  };

  const handleExtendExpiry = async () => {
    try {
      setExtending(true);
      await extendLinkExpiry(link.shortCode, 30); // extend by 30 days
      toast.success('Expiry extended by 30 days');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to extend expiry');
    } finally {
      setExtending(false);
    }
  };

  const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const expiresDate = link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Never';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <button onClick={handleSaveTitle} className="p-1 text-green-600 hover:text-green-700">
                <Check size={18} />
              </button>
              <button onClick={() => setEditingTitle(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg text-gray-800">{link.title || 'Untitled'}</h3>
              <button
                onClick={() => setEditingTitle(true)}
                className="p-1 text-gray-400 hover:text-blue-600 transition"
                title="Edit title"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline break-all"
          >
            {link.originalUrl}
          </a>
        </div>
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

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center space-x-4 text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>Created: {createdDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span className={isExpired ? 'text-red-500' : 'text-green-600'}>
              {isExpired ? 'Expired' : 'Expires: ' + expiresDate}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-gray-500">
            <Eye size={14} />
            <span>{link.clickCount} clicks</span>
          </span>
          {isExpired && (
            <button
              onClick={handleExtendExpiry}
              disabled={extending}
              className="text-blue-600 hover:underline text-xs"
            >
              {extending ? 'Extending...' : 'Extend expiry (30 days)'}
            </button>
          )}
        </div>
      </div>

      {/* Metadata counts*/}
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
      <div className="border-t border-gray-100 pt-3 mt-3">
        <button
          onClick={handleQR}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <QRCode size={18} />
          <span className="text-sm">Show QR Code</span>
        </button>
      </div>
    </div>
  );
};

export default LinkDetails;