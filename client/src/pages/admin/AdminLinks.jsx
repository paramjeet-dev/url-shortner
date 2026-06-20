import { useEffect, useState } from 'react';
import { getAdminLinks, deleteAdminLink } from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

const AdminLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchLinks();
  }, [page, search]);

  const fetchLinks = async () => {
    try {
      const res = await getAdminLinks({ page, search });
      setLinks(res.data.links);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Delete this link?')) return;
    try {
      await deleteAdminLink(code);
      toast.success('Link deleted');
      fetchLinks();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Links</h1>
        <input
          type="text"
          placeholder="Search links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.shortCode}>
                <td className="px-6 py-4 whitespace-nowrap font-mono">{link.shortCode}</td>
                <td className="px-6 py-4 max-w-xs truncate">{link.originalUrl}</td>
                <td className="px-6 py-4 whitespace-nowrap">{link.userId?.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{link.clickCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => handleDelete(link.shortCode)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination.pages > 1 && (
          <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {pagination.pages}</span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};