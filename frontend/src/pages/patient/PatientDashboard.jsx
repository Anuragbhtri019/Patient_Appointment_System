import { useEffect, useState } from "react";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../hooks/useAuth";
import AppointmentCard from "../../components/appointment/AppointmentCard";
import EmptyState from "../../components/common/EmptyState";
import Skeleton from "../../components/common/Skeleton";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../hooks/useToast";

export default function PatientDashboard() {
  const { user } = useAuth();
  const {
    upcoming,
    past,
    fetchMyAppointments,
    cancelAppointment,
    rateAppointment,
    isLoading,
  } = useAppointments();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);
  const [ratingId, setRatingId] = useState(null);

  useEffect(() => {
    fetchMyAppointments();
  }, [fetchMyAppointments]);

  const handleCancel = async (appointmentId) => {
    setCancellingId(appointmentId);
    const result = await cancelAppointment(appointmentId);
    setCancellingId(null);
    if (result.success) {
      showSuccess("Appointment cancelled successfully");
      await fetchMyAppointments(); // Refresh the list
    } else {
      showError(result.message || "Failed to cancel appointment");
    }
  };

  const handleRate = async (appointmentId, rating) => {
    setRatingId(appointmentId);
    const result = await rateAppointment(appointmentId, rating);
    setRatingId(null);
    if (result.success) {
      showSuccess("Thank you for your rating!");
      await fetchMyAppointments(); // Refresh the list
    } else {
      showError(result.message || "Failed to submit rating");
    }
  };

  const upcomingCount = upcoming.length;

  const completedCount = past.filter((a) => a.status === "Completed").length;
  const cancelledCount = past.filter((a) => a.status === "Cancelled").length;

  const displayedAppointments =
    activeTab === "upcoming" ? upcoming : [...upcoming, ...past];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Manage your appointments and book new ones
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-600 mb-2">
            Upcoming Appointments
          </div>
          <div className="text-3xl font-bold text-teal-600">
            {upcomingCount}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {upcomingCount === 1
              ? "You have 1 appointment coming up"
              : upcomingCount === 0
                ? "No upcoming appointments"
                : `You have ${upcomingCount} appointments coming up`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-600 mb-2">Completed</div>
          <div className="text-3xl font-bold text-green-600">
            {completedCount}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completedCount === 1
              ? "You completed 1 appointment"
              : `You have completed ${completedCount} appointments`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-600 mb-2">Cancelled</div>
          <div className="text-3xl font-bold text-red-600">
            {cancelledCount}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {cancelledCount === 1
              ? "You cancelled 1 appointment"
              : `You have cancelled ${cancelledCount} appointments`}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-4 font-medium transition-colors ${
              activeTab === "upcoming"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 font-medium transition-colors ${
              activeTab === "all"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({upcoming.length + past.length})
          </button>
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="row" className="h-40" />
          ))}
        </div>
      ) : displayedAppointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          heading={
            activeTab === "upcoming"
              ? "No upcoming appointments"
              : "No appointments yet"
          }
          subtext={
            activeTab === "upcoming"
              ? "Browse our doctors and book your first appointment"
              : "Your appointment history will appear here"
          }
        />
      ) : (
        <div className="space-y-4">
          {displayedAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onCancel={
                appointment.status === "Upcoming" ? handleCancel : undefined
              }
              onRate={
                appointment.status === "Completed" ? handleRate : undefined
              }
              isCancelling={cancellingId === appointment._id}
              isRating={ratingId === appointment._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
