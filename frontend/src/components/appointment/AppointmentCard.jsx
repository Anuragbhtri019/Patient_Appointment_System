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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(appointment?.rating || 0);

  const getStatusVariant = (status) => {
    if (status === "Upcoming") return "blue";
    if (status === "Completed") return "green";
    if (status === "Cancelled") return "red";
    return "gray";
  };

  const handleCancelClick = () => {
    setCancelReason("");
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel?.(appointment._id, cancelReason.trim() || undefined);
    setCancelReason("");
  };

  const handleSubmitRating = async () => {
    await onRate?.(appointment._id, rating);
    setShowRating(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/*  Doctor info header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          name={appointment?.doctor?.name || "Doctor"}
          size="lg"
          src={
            appointment?.doctor?.imageUrl || appointment?.doctor?.profileImage
          }
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
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

      {/* Appointment details  */}
      <div className="space-y-1 text-sm text-gray-600 mb-4">
        <p>
          <span className="font-medium text-gray-900">Date:</span>{" "}
          {formatDate(appointment?.appointmentDate)}
        </p>
        <p>
          <span className="font-medium text-gray-900">Time:</span>{" "}
          {formatTime(appointment?.timeSlot)}
        </p>
        <p>
          <span className="font-medium text-gray-900">Type:</span>{" "}
          {appointment?.consultationType}
        </p>
        {/* Show saved cancellation reason if present */}
        {appointment?.status === "Cancelled" &&
          appointment?.cancellationReason && (
            <p className="mt-2 text-xs text-red-600 italic">
              Reason: {appointment.cancellationReason}
            </p>
          )}
      </div>

      {/*  Actions */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        {/* Cancel button — only when upcoming and confirm panel is not shown */}
        {appointment?.status === "Upcoming" && !showCancelConfirm && (
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={handleCancelClick}
            isLoading={isCancelling}
            disabled={isCancelling}
          >
            Cancel Appointment
          </Button>
        )}

        {/*  Inline cancel confirmation */}
        {showCancelConfirm && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Cancel this appointment?
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                This cannot be undone. The time slot will be released.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-red-700 mb-1">
                Reason for cancellation{" "}
                <span className="font-normal text-red-400">(optional)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. schedule conflict, feeling better…"
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg
                           bg-white text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              <p className="text-right text-xs text-red-400 mt-0.5">
                {cancelReason.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
              >
                Keep it
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={handleConfirmCancel}
                isLoading={isCancelling}
                disabled={isCancelling}
              >
                Yes, cancel
              </Button>
            </div>
          </div>
        )}

        {/* Rate Visit button */}
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

        {/* Already rated */}
        {appointment?.status === "Completed" && appointment?.rating && (
          <div className="text-center py-1">
            <p className="text-xs text-gray-500 mb-1">Your rating</p>
            <StarRating value={appointment.rating} readonly size="sm" />
          </div>
        )}
      </div>

      {/*  Inline rating panel  */}
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
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
