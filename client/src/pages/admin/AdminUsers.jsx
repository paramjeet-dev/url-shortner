import { useEffect, useState } from 'react';
import { getAdminUsers, promoteUser } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId) => {
    try {
      await promoteUser(userId);
      toast.success('User promoted to admin');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to promote user');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isAdmin ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Admin</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">User</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {!user.isAdmin && (
                    <button
                      onClick={() => handlePromote(user._id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Promote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;