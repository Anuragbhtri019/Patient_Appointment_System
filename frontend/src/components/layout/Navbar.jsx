import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/search', label: 'Find Doctors' },
    ...(isAuthenticated
      ? [
          { path: '/dashboard', label: 'My Appointments' },
          { path: '/history', label: 'History' },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-lg text-teal-600">
            HealthHub
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-700 hover:text-teal-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Avatar name={user?.name || 'User'} size="sm" />
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 hover:text-teal-600 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 text-sm font-medium ${
                  isActive(link.path) ? 'text-teal-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-sm text-red-600 font-medium"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-sm text-gray-700 font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="block py-2 text-sm text-gray-700 font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
