import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Link2, Settings } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold text-blue-600 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
          <NavLink to="/admin/links" className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
            <Link2 size={20} />
            <span>Links</span>
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;