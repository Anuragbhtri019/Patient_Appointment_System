import { useState } from "react";
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
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [bookingError, setBookingError] = useState("");

  // Extract all available slots from all schedules
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
    if (!selectedSlot) {
      setBookingError("Please select a time slot");
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setStep(3);

    const bookingData = {
      doctorId: doctor?._id,
      scheduleId: selectedSchedule,
      slotId: selectedSlot._id,
      consultationType: selectedSlot.consultationType,
    };

    const result = await onConfirm(bookingData);

    if (!result.success) {
      const errorMessage = result.message || "Failed to book appointment";
      setBookingError(errorMessage);

      if (onError && errorMessage.includes("2 active appointments")) {
        onError("You cannot hold more than 2 active appointments");
      } else if (onError) {
        onError(errorMessage);
      }

      setStep(2);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setSelectedSchedule(null);
    setBookingError("");
    onClose();
  };

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
      {/* ── Step 1: Pick a slot ── */}
      {step === 1 && (
        <div>
          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {bookingError}
            </div>
          )}

          {allAvailableSlots.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600">
                No available slots for this doctor
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
              disabled={
                !selectedSlot || isLoading || allAvailableSlots.length === 0
              }
              isLoading={isLoading}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Confirm ── */}
      {step === 2 && (
        <div>
          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {bookingError}
            </div>
          )}

          {/* Booking summary */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <Avatar name={doctor?.name} size="lg" src={doctor?.imageUrl} />
              <div>
                <h3 className="font-semibold text-lg">{doctor?.name}</h3>
                <Badge variant="teal">{doctor?.specialization}</Badge>
              </div>
            </div>

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

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">Booking for:</span>{" "}
                {user?.name || "You"}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Success ── */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="mb-4 text-6xl">✓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Appointment Booked!
          </h3>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked with {doctor?.name}.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="text-gray-600">Appointment Details:</p>
            <p className="font-medium mt-2">
              Date: {formatDate(selectedSlot?.availableDate)}
            </p>
            <p className="font-medium">
              Time: {formatTime(selectedSlot?.time)}
            </p>
            <p className="font-medium">
              Type: {selectedSlot?.consultationType}
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
