import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SlotPicker from './SlotPicker';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatDate, formatTime } from '../../utils/dateUtils';

export default function BookingModal({
  isOpen,
  onClose,
  doctor,
  slots,
  onConfirm,
  isLoading,
}) {
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [bookingError, setBookingError] = useState('');

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setBookingError('');
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      setBookingError('Please select a time slot');
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setStep(3);
    const result = await onConfirm({
      doctor_id: doctor?.id,
      slot_id: selectedSlot?.id,
      patient_name: patientName,
    });

    if (!result.success) {
      setBookingError(result.message);
      setStep(2);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setPatientName('');
    setBookingError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Select Time Slot' : step === 2 ? 'Confirm Booking' : 'Booking Confirmed'}
      size="lg"
    >
      {step === 1 && (
        <div>
          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {bookingError}
            </div>
          )}
          <SlotPicker
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSlotSelect}
          />
          <div className="flex gap-4 mt-8">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleContinue}
              disabled={!selectedSlot || isLoading}
              isLoading={isLoading}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

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
              <Avatar name={doctor?.name} size="lg" src={doctor?.image} />
              <div>
                <h3 className="font-semibold text-lg">{doctor?.name}</h3>
                <Badge variant="teal">{doctor?.specialization}</Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-700">Date:</span>{' '}
                {formatDate(selectedSlot?.date)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Time:</span>{' '}
                {formatTime(selectedSlot?.time)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Type:</span>{' '}
                {selectedSlot?.consultation_type}
              </p>
            </div>

            {/* Patient name */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              disabled={!patientName.trim() || isLoading}
              isLoading={isLoading}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-8">
          <div className="mb-4 text-6xl">✓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment Booked!</h3>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked with {doctor?.name}.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="text-gray-600">Appointment Details:</p>
            <p className="font-medium mt-2">Date: {formatDate(selectedSlot?.date)}</p>
            <p className="font-medium">Time: {formatTime(selectedSlot?.time)}</p>
          </div>
          <Button variant="primary" fullWidth onClick={handleClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
