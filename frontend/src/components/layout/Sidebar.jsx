import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const adminNavLinks = [
  { path: '/admin', icon: HomeIcon, label: 'Dashboard' },
  { path: '/admin/doctors', icon: UserGroupIcon, label: 'Doctors' },
  { path: '/admin/schedules', icon: CalendarIcon, label: 'Schedules' },
  { path: '/admin/appointments', icon: DocumentTextIcon, label: 'Appointments' },
];

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <h2 className="font-bold text-lg">HealthHub Admin</h2>
      </div>

      <nav className="py-6">
        {adminNavLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                isActive(link.path)
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
