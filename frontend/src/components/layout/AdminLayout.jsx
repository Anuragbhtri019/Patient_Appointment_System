import { useNavigate } from 'react-router-dom';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name || 'Admin'}</span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
