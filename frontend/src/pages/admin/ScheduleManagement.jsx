import { useState, useEffect, useCallback } from "react";
import { doctorApi } from "../../api/doctor.api";
import { scheduleApi } from "../../api/schedule.api";
import Button from "../../components/common/Button";
import { useToast } from "../../hooks/useToast";
import { CONSULTATION_TYPES } from "../../utils/constants";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

function toAmPm(time24) {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${String(displayH).padStart(2, "0")}:${mStr} ${ampm}`;
}

export default function ScheduleManagement() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // The schedule document for the currently selected doctor + date (if any)
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [isFetchingSchedule, setIsFetchingSchedule] = useState(false);

  const [newSlot, setNewSlot] = useState({
    time: "09:00",
    consultationType: "In-person",
  });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isDeletingScheduleId, setIsDeletingScheduleId] = useState(null);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorApi.getAllDoctors({ limit: 1000 });
        const list =
          response.data?.data?.doctors || response.data?.doctors || [];
        setDoctors(list);
      } catch {
        showError("Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, [showError]);

  const fetchSchedule = useCallback(async () => {
    if (!selectedDoctorId || !selectedDate) {
      setExistingSchedule(null);
      return;
    }
    setIsFetchingSchedule(true);
    try {
      const response = await scheduleApi.getSchedulesByDoctor(
        selectedDoctorId,
        { date: selectedDate },
      );
      const schedules =
        response.data?.data?.schedules || response.data?.schedules || [];
      // There is at most one schedule per doctor per date (unique index on model)
      setExistingSchedule(schedules[0] || null);
    } catch {
      setExistingSchedule(null);
    } finally {
      setIsFetchingSchedule(false);
    }
  }, [selectedDoctorId, selectedDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleAddSlot = async () => {
    if (!selectedDoctorId || !selectedDate || !newSlot.time) {
      showError("Please select a doctor, date, and time");
      return;
    }

    const timeAmPm = toAmPm(newSlot.time);

    // Guard: prevent duplicate times on the same schedule
    if (existingSchedule) {
      const duplicate = existingSchedule.timeSlots.some(
        (s) =>
          s.time === timeAmPm &&
          s.consultationType === newSlot.consultationType,
      );
      if (duplicate) {
        showError(
          `A ${newSlot.consultationType} slot at ${timeAmPm} already exists`,
        );
        return;
      }
    }

    setIsAddingSlot(true);
    try {
      if (existingSchedule) {
        // Append the new slot to the existing schedule's timeSlots
        const updatedSlots = [
          ...existingSchedule.timeSlots,
          { time: timeAmPm, consultationType: newSlot.consultationType },
        ];
        await scheduleApi.updateSchedule(existingSchedule._id, {
          timeSlots: updatedSlots,
        });
      } else {
        // Create a brand-new schedule for this doctor on this date
        await scheduleApi.createSchedule({
          doctorId: selectedDoctorId,
          availableDate: selectedDate,
          timeSlots: [
            { time: timeAmPm, consultationType: newSlot.consultationType },
          ],
        });
      }

      showSuccess("Slot added successfully");
      setNewSlot({ time: "09:00", consultationType: "In-person" });
      await fetchSchedule(); // Refresh the panel
    } catch (error) {
      showError(error.response?.data?.message || "Failed to add slot");
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (
      !window.confirm("Delete this entire schedule? All slots will be removed.")
    )
      return;
    setIsDeletingScheduleId(scheduleId);
    try {
      await scheduleApi.deleteSchedule(scheduleId);
      showSuccess("Schedule deleted successfully");
      setExistingSchedule(null);
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete schedule");
    } finally {
      setIsDeletingScheduleId(null);
    }
  };

  const handleRemoveSlot = async (slotId) => {
    if (!existingSchedule) return;
    try {
      const updatedSlots = existingSchedule.timeSlots.filter(
        (s) => s._id !== slotId,
      );
      await scheduleApi.updateSchedule(existingSchedule._id, {
        timeSlots: updatedSlots,
      });
      showSuccess("Slot removed");
      await fetchSchedule();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to remove slot");
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
        {/* ── Selection / add-slot panel ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Doctor select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
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
                Consultation Type
              </label>
              <select
                value={newSlot.consultationType}
                onChange={(e) =>
                  setNewSlot((prev) => ({
                    ...prev,
                    consultationType: e.target.value,
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
              isLoading={isAddingSlot}
              disabled={!selectedDoctorId || !selectedDate || isAddingSlot}
              className="flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Slot
            </Button>
          </div>
        </div>

        {/* ── Slots list ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900">
                {selectedDoctorId && selectedDate
                  ? `Slots for ${selectedDate}`
                  : "Select doctor and date to view slots"}
              </h3>
              {existingSchedule && (
                <button
                  onClick={() => handleDeleteSchedule(existingSchedule._id)}
                  disabled={isDeletingScheduleId === existingSchedule._id}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  {isDeletingScheduleId === existingSchedule._id
                    ? "Deleting…"
                    : "Delete all slots"}
                </button>
              )}
            </div>

            {/* Content */}
            {!selectedDoctorId || !selectedDate ? (
              <div className="py-8 text-center text-gray-500">
                Select a doctor and date to manage slots
              </div>
            ) : isFetchingSchedule ? (
              <div className="py-8 text-center text-gray-500">
                Loading slots…
              </div>
            ) : !existingSchedule || existingSchedule.timeSlots.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No slots yet — add one using the panel on the left
              </p>
            ) : (
              <div className="space-y-2">
                {existingSchedule.timeSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {slot.time}
                      </div>
                      <div className="text-sm text-gray-600">
                        {slot.consultationType}
                      </div>
                      <div
                        className={`text-xs mt-1 font-medium ${
                          slot.status === "Available"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {slot.status}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(slot._id)}
                      disabled={slot.status === "Booked"}
                      title={
                        slot.status === "Booked"
                          ? "Cannot remove a booked slot"
                          : "Remove slot"
                      }
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
