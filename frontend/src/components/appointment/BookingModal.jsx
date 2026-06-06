import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import Button from "../common/Button";
import SlotPicker from "./SlotPicker";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import { formatDate, formatTime } from "../../utils/dateUtils";
import { useAuth } from "../../hooks/useAuth";

export default function BookingModal({
  isOpen,
  onClose,
  doctor,
  schedules = [],
  onConfirm,
  isLoading,
  onError,
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const isPatient = user?.role === "patient";

  const allAvailableSlots = schedules.flatMap((schedule) =>
    schedule.timeSlots
      .filter((slot) => slot.status === "Available")
      .map((slot) => ({
        ...slot,
        scheduleId: schedule._id,
        availableDate: schedule.availableDate,
      })),
  );

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setSelectedSchedule(slot.scheduleId);
    setBookingError("");
  };

  const handleContinue = () => {
    if (!isAuthenticated && !isPatient) {
      handleClose();
      navigate("/login", {
        state: {
          from: "/search",
          message: "Please log in to book an appointment",
        },
      });
      return;
    }
    if (!isPatient) {
      setBookingError("Only patients can book appointments.");
      return;
    }
    if (!selectedSlot) {
      setBookingError("Please select a time slot");
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      handleClose();
      navigate("/login", { state: { from: "/search" } });
      return;
    }

    setIsConfirming(true);
    setBookingError("");

    const bookingData = {
      doctorId: doctor?._id,
      scheduleId: selectedSchedule,
      slotId: selectedSlot._id,
      consultationType: selectedSlot.consultationType,
    };

    const result = await onConfirm(bookingData);

    if (result?.success) {
      setStep(3);
    } else {
      const errorMessage = result?.message || "Failed to book appointment";
      setBookingError(errorMessage);
      if (onError) onError(errorMessage);
      // Stay on step 2 so the user can correct the situation
    }

    setIsConfirming(false);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setSelectedSchedule(null);
    setBookingError("");
    setIsConfirming(false);
    onClose();
  };

  const busy = isLoading || isConfirming;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 1
          ? "Select Time Slot"
          : step === 2
            ? "Confirm Booking"
            : "Booking Confirmed"
      }
      size="lg"
    >
      {/*  Step 1: Pick a slot  */}
      {step === 1 && (
        <div>
          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {bookingError}
            </div>
          )}

          {allAvailableSlots.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                No available slots for this doctor.
              </p>
            </div>
          ) : (
            <SlotPicker
              slots={allAvailableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSlotSelect}
            />
          )}

          <div className="flex gap-4 mt-8">
            <Button variant="secondary" fullWidth onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleContinue}
              disabled={!selectedSlot || busy || allAvailableSlots.length === 0}
              isLoading={busy}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/*  Step 2: Confirm */}
      {step === 2 && (
        <div>
          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {bookingError}
            </div>
          )}

          <div className="space-y-4 mb-6">
            {/* Doctor summary */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <Avatar name={doctor?.name} size="lg" src={doctor?.imageUrl} />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {doctor?.name}
                </h3>
                <Badge variant="teal">{doctor?.specialization}</Badge>
              </div>
            </div>

            {/* Slot details */}
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-700">Date:</span>{" "}
                {formatDate(selectedSlot?.availableDate)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Time:</span>{" "}
                {formatTime(selectedSlot?.time)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Type:</span>{" "}
                {selectedSlot?.consultationType}
              </p>
            </div>

            {/* Booking for — read-only, derived from authenticated user */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">Booking for:</span>{" "}
                {user?.name}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setStep(1)}
              disabled={busy}
            >
              Back
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              disabled={busy}
              isLoading={isConfirming}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}

      {/*  Step 3: Success — only reached after confirmed success  */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Appointment Booked!
          </h3>
          <p className="text-gray-600 mb-6">
            Your appointment with <strong>{doctor?.name}</strong> is confirmed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left text-sm space-y-1">
            <p className="text-gray-500 font-medium mb-2">Details</p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {formatDate(selectedSlot?.availableDate)}
            </p>
            <p>
              <span className="font-medium">Time:</span>{" "}
              {formatTime(selectedSlot?.time)}
            </p>
            <p>
              <span className="font-medium">Type:</span>{" "}
              {selectedSlot?.consultationType}
            </p>
          </div>
          <Button variant="primary" fullWidth onClick={handleClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
