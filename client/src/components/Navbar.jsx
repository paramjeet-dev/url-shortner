import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 max-w-6xl flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          URL.to
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Create URL
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">
            About
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <User size={18} />
                <span>{user.name || 'Account'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;