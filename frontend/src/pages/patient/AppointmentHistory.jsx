import { useEffect, useState } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { APPOINTMENT_STATUSES } from '../../utils/constants';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../hooks/useToast';

export default function AppointmentHistory() {
  const {
    upcoming,
    past,
    fetchMyAppointments,
    rateAppointment,
    isLoading,
  } = useAppointments();
  const { showSuccess, showError } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingId, setRatingId] = useState(null);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

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

  const allAppointments = [...upcoming, ...past].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const filteredAppointments = allAppointments.filter(
    (apt) => statusFilter === 'all' || apt.status === statusFilter,
  );

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: APPOINTMENT_STATUSES.UPCOMING, label: 'Upcoming' },
    { value: APPOINTMENT_STATUSES.COMPLETED, label: 'Completed' },
    { value: APPOINTMENT_STATUSES.CANCELLED, label: 'Cancelled' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment History</h1>
        <p className="text-gray-600">View all your past and upcoming appointments</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === option.value
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="row" className="h-40" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          heading="No appointments found"
          subtext={`You have no ${statusFilter !== 'all' ? statusFilter.toLowerCase() : ''} appointments`}
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onRate={handleRate}
              isRating={ratingId === appointment.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
