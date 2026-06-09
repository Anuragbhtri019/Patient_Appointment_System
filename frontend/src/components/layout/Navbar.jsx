import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../common/Avatar";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // ✓ FIX #1: Determine user role
  const isAdmin = user?.role === "admin";
  const isPatient = user?.role === "patient";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // ✓ FIX #2: Different navigation links based on role
  const getNavLinks = () => {
    // Public link (always visible)
    const baseLinks = [{ path: "/search", label: "Find Doctors", icon: null }];

    // Role-specific links
    if (isAdmin) {
      // Admin navigation
      return [
        ...baseLinks,
        { path: "/admin", label: "Dashboard", icon: HomeIcon },
        { path: "/admin/doctors", label: "Doctors", icon: null },
        { path: "/admin/schedules", label: "Schedules", icon: null },
        {
          path: "/admin/appointments",
          label: "Appointments",
          icon: ClipboardDocumentListIcon,
        },
      ];
    } else if (isPatient) {
      // Patient navigation
      return [
        ...baseLinks,
        { path: "/dashboard", label: "My Appointments", icon: null },
        { path: "/history", label: "History", icon: null },
        { path: "/profile", label: "Profile", icon: null },
      ];
    } else if (isAuthenticated) {
      // Fallback for other authenticated users
      return [
        ...baseLinks,
        { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
      ];
    }

    // Unauthenticated users
    return baseLinks;
  };

  const navLinks = getNavLinks();

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-bold text-lg text-teal-600 flex items-center gap-2"
          >
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            HealthHub
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive(link.path)
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-700 hover:text-teal-600"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                  title={`${user?.name || "User"} (${isAdmin ? "Admin" : "Patient"})`}
                >
                  <Avatar name={user?.name || "User"} size="sm" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isAdmin ? "Admin" : "Patient"}
                      </span>
                    </div>

                    {/* Profile link - only for patients */}
                    {isPatient && (
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Profile Settings
                      </Link>
                    )}

                    {/* Admin settings - only for admins */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-100"></div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-teal-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
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
            aria-label="Toggle menu"
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
          <div className="md:hidden pb-4 border-t border-gray-200 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 text-sm font-medium rounded transition ${
                  isActive(link.path)
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="border-t border-gray-100 my-2"></div>

                {isPatient && (
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
                    Profile Settings
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HomeIcon className="w-4 h-4 inline mr-2" />
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
