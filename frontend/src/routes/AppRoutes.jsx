import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PatientLayout from '../components/layout/PatientLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Patient pages
import DoctorSearch from '../pages/patient/DoctorSearch';
import PatientDashboard from '../pages/patient/PatientDashboard';
import AppointmentHistory from '../pages/patient/AppointmentHistory';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import DoctorManagement from '../pages/admin/DoctorManagement';
import ScheduleManagement from '../pages/admin/ScheduleManagement';
import AdminAppointments from '../pages/admin/AdminAppointments';

// 404 Page
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Doctor search (public) */}
      <Route
        path="/search"
        element={
          <PatientLayout>
            <DoctorSearch />
          </PatientLayout>
        }
      />

      {/* Patient protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PatientLayout>
              <PatientDashboard />
            </PatientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <PatientLayout>
              <AppointmentHistory />
            </PatientLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin protected routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <AdminRoute>
            <AdminLayout>
              <DoctorManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/schedules"
        element={
          <AdminRoute>
            <AdminLayout>
              <ScheduleManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminAppointments />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* Redirects and 404 */}
      <Route path="/" element={<Navigate to="/search" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
