import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserLinks } from '../services/api';
import toast from 'react-hot-toast';
import LinkList from '../components/LinkList';
import LinkDetails from '../components/LinkDetails';
import InsightsChart from '../components/InsightsChart';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await getUserLinks();
      // Mock data if backend not ready – will be replaced by real response
      const mockLinks = [
        {
          shortCode: 'abc123',
          originalUrl: 'https://photos.google.com/album/xyz',
          title: 'Pics from the trip - Google Photos',
          createdAt: '2024-06-10T10:00:00Z',
          clickCount: 42,
          clickEvents: [
            { clickedAt: '2024-06-11T12:00:00Z' },
            { clickedAt: '2024-06-12T14:30:00Z' },
            // ... more events for chart
          ],
          // extra mock metadata
          metadata: {
            photos: 4,
            video: 1,
            audio: 1,
            image: 1,
            file: 1,
            link: 1,
            note: 1,
            comment: 1,
            share: 1,
            download: 1,
          }
        },
        {
          shortCode: 'xyz789',
          originalUrl: 'https://docs.google.com/...',
          title: 'Google Cloud Credential',
          createdAt: '2024-05-20T08:30:00Z',
          clickCount: 18,
          clickEvents: [],
          metadata: {}
        },
        // more...
      ];
      setLinks(mockLinks);
      if (mockLinks.length) setSelectedLink(mockLinks[0]);
    } catch (err) {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code) => {
    try {
      await deleteLink(code);
      setLinks(links.filter(link => link.shortCode !== code));
      if (selectedLink?.shortCode === code) setSelectedLink(null);
      toast.success('Link deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Dashboard header with user info */}
      <div className="flex justify-between items-start mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600 text-sm">Welcome back, {user?.name || 'User'}!</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Email: {user?.email}</p>
          <p>Joined: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Links list */}
        <div className="lg:col-span-1">
          <LinkList
            links={filteredLinks}
            selectedCode={selectedLink?.shortCode}
            onSelect={setSelectedLink}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Right column: Details + Insights */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLink ? (
            <>
              <LinkDetails link={selectedLink} onDelete={handleDelete} />
              <InsightsChart clickEvents={selectedLink.clickEvents || []} />
            </>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
              <p>Select a link to view details and insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;