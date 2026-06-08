import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Navbar from "./Navbar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  //  Define admin navigation menu items
  const adminMenuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: HomeIcon,
      description: "Overview and statistics",
    },
    {
      label: "Doctors",
      path: "/admin/doctors",
      icon: UsersIcon,
      description: "Manage doctors",
    },
    {
      label: "Schedules",
      path: "/admin/schedules",
      icon: CalendarIcon,
      description: "Manage schedules",
    },
    {
      label: "Appointments",
      path: "/admin/appointments",
      icon: DocumentTextIcon,
      description: "View all appointments",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex">
        {/* Sidebar - Desktop */}
        <div
          className={`hidden md:flex md:flex-col transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16`}
        >
          {/* Sidebar header with toggle */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            {sidebarOpen && (
              <h2 className="text-lg font-bold text-gray-900">Admin Menu</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded transition"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-600 rotate-180" />
              )}
            </button>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-teal-50 text-teal-600 border-l-4 border-teal-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      {active && (
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            {sidebarOpen && (
              <div className="text-xs text-gray-500 text-center">
                <p className="font-medium">Version 1.0</p>
                <p>Patient Appointment System</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 top-16"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed left-0 top-16 w-64 bg-white h-[calc(100vh-64px)] border-r border-gray-200 z-50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile menu items */}
              <nav className="p-4 space-y-2">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? "bg-teal-50 text-teal-600 border-l-4 border-teal-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <main className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Mobile sidebar toggle button */}
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  {sidebarOpen ? (
                    <>
                      <XMarkIcon className="w-5 h-5" />
                      Close Menu
                    </>
                  ) : (
                    <>
                      <Bars3Icon className="w-5 h-5" />
                      Open Menu
                    </>
                  )}
                </button>
              </div>

              {/* Page content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
