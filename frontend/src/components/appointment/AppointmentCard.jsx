import { useState } from "react";
import { formatDate, formatTime } from "../../utils/dateUtils";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import StarRating from "../common/StarRating";

export default function AppointmentCard({
  appointment,
  onCancel,
  onRate,
  isCancelling,
  isRating,
}) {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(appointment?.rating || 0);

  const getStatusVariant = (status) => {
    if (status === "Upcoming") return "blue";
    if (status === "Completed") return "green";
    if (status === "Cancelled") return "red";
    return "gray";
  };

  const handleConfirmCancel = () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      onCancel?.(appointment._id);
    }
  };

  const handleSubmitRating = async () => {
    await onRate?.(appointment._id, rating);
    setShowRating(false);
  };

  const appointmentDate = appointment?.appointmentDate;
  const timeSlot = appointment?.timeSlot;
  const consultationType = appointment?.consultationType;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          name={appointment?.doctor?.name || "Doctor"}
          size="lg"
          src={appointment?.doctor?.imageUrl}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {appointment?.doctor?.name}
              </h3>
              <Badge variant="teal">
                {appointment?.doctor?.specialization}
              </Badge>
            </div>
            <Badge variant={getStatusVariant(appointment?.status)}>
              {appointment?.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>
          <span className="font-medium text-gray-900">Date:</span>{" "}
          {formatDate(appointmentDate)}
        </p>

        <p>
          <span className="font-medium text-gray-900">Time:</span>{" "}
          {formatTime(timeSlot)}
        </p>

        <p>
          <span className="font-medium text-gray-900">Type:</span>{" "}
          {consultationType}
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 pt-4">
        {appointment?.status === "Upcoming" && (
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={handleConfirmCancel}
            isLoading={isCancelling}
          >
            Cancel Appointment
          </Button>
        )}

        {/* FIXED: Rating modal shows when status is Completed AND no rating exists */}
        {appointment?.status === "Completed" &&
          !appointment?.rating &&
          !showRating && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setShowRating(true)}
            >
              Rate Visit
            </Button>
          )}

        {appointment?.status === "Completed" && appointment?.rating && (
          <div className="text-center">
            <p className="text-sm text-gray-600">Your rating:</p>
            <div className="flex justify-center mt-2">
              <StarRating value={appointment?.rating} readonly size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-3">
            Rate your visit
          </p>
          <StarRating value={rating} onChange={setRating} size="md" />
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="secondary"
              fullWidth
              onClick={() => setShowRating(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              fullWidth
              onClick={handleSubmitRating}
              disabled={rating === 0 || isRating}
              isLoading={isRating}
            >
              Submit Rating
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
