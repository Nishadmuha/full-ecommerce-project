import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/products', label: 'Products', icon: '🛍️' },
    { path: '/admin/categories', label: 'Collections', icon: '📁' },
    { path: '/admin/coupons', label: 'Coupons', icon: '🎫' },
    { path: '/admin/complaints', label: 'Complaints', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              ✕
            </button>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-800 p-4">
            <div className="mb-3 px-4">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="font-medium">{user?.name || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600"
            >
              ☰
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            <div></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

