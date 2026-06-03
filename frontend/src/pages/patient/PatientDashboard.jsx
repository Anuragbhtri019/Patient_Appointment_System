import { useEffect, useState } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../hooks/useToast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const {
    upcoming,
    fetchMyAppointments,
    cancelAppointment,
    rateAppointment,
    isLoading,
  } = useAppointments();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [ratingId, setRatingId] = useState(null);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    setCancellingId(appointmentId);
    const result = await cancelAppointment(appointmentId);
    setCancellingId(null);
    if (result.success) {
      showSuccess('Appointment cancelled successfully');
    } else {
      showError(result.message);
    }
  };

  const handleRate = async (appointmentId, rating) => {
    setRatingId(appointmentId);
    const result = await rateAppointment(appointmentId, rating);
    setRatingId(null);
    if (result.success) {
      showSuccess('Thank you for your rating!');
    } else {
      showError(result.message);
    }
  };

  const upcomingCount = upcoming.length;
  const completedCount = upcoming.filter((a) => a.status === 'Completed').length;
  const cancelledCount = upcoming.filter((a) => a.status === 'Cancelled').length;

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Manage your appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Upcoming Appointments</div>
          <div className="text-3xl font-bold text-teal-600">{upcomingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Completed</div>
          <div className="text-3xl font-bold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Cancelled</div>
          <div className="text-3xl font-bold text-red-600">{cancelledCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-4 font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Appointments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="row" className="h-40" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          heading="No appointments yet"
          subtext="Browse our doctors and book your first appointment"
        />
      ) : (
        <div className="space-y-4">
          {upcoming.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancel}
              onRate={handleRate}
              isCancelling={cancellingId === appointment.id}
              isRating={ratingId === appointment.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
