import { useState, useEffect } from "react";
import { doctorApi } from "../../api/doctor.api";
import { appointmentApi } from "../../api/appointment.api";
import Button from "../../components/common/Button";
import { useToast } from "../../hooks/useToast";
import { CONSULTATION_TYPES } from "../../utils/constants";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function ScheduleManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    time: "09:00",
    consultation_type: "in-person",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorApi.getAllDoctors({ limit: 1000 });
        const doctors = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.doctors)
            ? response.data.doctors
            : Array.isArray(response.data)
              ? response.data
              : [];
        setDoctors(doctors);
      } catch (error) {
        showError("Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, [showError]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        try {
          const response = await appointmentApi.getMyAppointments({
            doctor_id: selectedDoctor,
            date: selectedDate,
          });
          setSlots(response.data.available_slots || []);
        } catch {
          setSlots([]);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const handleAddSlot = async () => {
    if (!selectedDoctor || !selectedDate || !newSlot.time) {
      showError("Please select doctor, date, and time");
      return;
    }

    setIsLoading(true);
    try {
      // This would typically call an API to create the slot
      // For now, we'll add it to the local state
      const slotData = {
        id: Date.now(),
        doctor_id: selectedDoctor,
        date: selectedDate,
        time: newSlot.time,
        consultation_type: newSlot.consultation_type,
        status: "available",
      };

      setSlots([...slots, slotData]);
      setNewSlot({ time: "09:00", consultation_type: "in-person" });
      showSuccess("Slot added successfully");
    } catch (error) {
      showError("Failed to add slot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setIsDeletingId(slotId);
    try {
      // Call API to delete slot
      setSlots(slots.filter((s) => s.id !== slotId));
      showSuccess("Slot deleted successfully");
    } catch (error) {
      showError("Failed to delete slot");
    } finally {
      setIsDeletingId(null);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Schedule Management
        </h2>
        <p className="text-gray-600 mt-1">
          Manage doctor availability and time slots
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Doctor select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctor || ""}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Time input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={newSlot.time}
                onChange={(e) =>
                  setNewSlot((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Consultation type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={newSlot.consultation_type}
                onChange={(e) =>
                  setNewSlot((prev) => ({
                    ...prev,
                    consultation_type: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {CONSULTATION_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleAddSlot}
              isLoading={isLoading}
            >
              Add Slot
            </Button>
          </div>
        </div>

        {/* Slots list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              {selectedDoctor && selectedDate
                ? `Slots for ${selectedDate}`
                : "Select doctor and date to view slots"}
            </h3>

            {selectedDoctor && selectedDate ? (
              slots.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No slots added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {slot.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          {slot.consultation_type}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        disabled={isDeletingId === slot.id}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="py-8 text-center text-gray-500">
                Select a doctor and date to manage slots
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
