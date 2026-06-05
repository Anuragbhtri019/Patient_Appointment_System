import { useState, useCallback, useEffect } from "react";
import { doctorApi } from "../../api/doctor.api";
import { scheduleApi } from "../../api/schedule.api";
import SearchFilterBar from "../../components/filters/SearchFilterBar";
import DoctorCard from "../../components/doctor/DoctorCard";
import BookingModal from "../../components/appointment/BookingModal";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAppointments } from "../../hooks/useAppointments";
import { useToast } from "../../hooks/useToast";

function normalizeDoctorsResponse(payload) {
  if (Array.isArray(payload?.data?.doctors)) {
    return payload.data.doctors;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.doctors)) {
    return payload.doctors;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

function normalizeSchedulesResponse(payload) {
  if (Array.isArray(payload?.data?.schedules)) {
    return payload.data.schedules;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.schedules)) {
    return payload.schedules;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const { bookAppointment, isLoading: isBooking } = useAppointments();
  const { showSuccess, showError } = useToast();

  const fetchDoctors = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const response = await doctorApi.getAllDoctors({
          page,
          limit: 10,
          ...filters,
        });
        const data = response.data;
        setDoctors(normalizeDoctorsResponse(data));
        setTotalPages(
          data.pagination?.pages || data.data?.pagination?.pages || 1,
        );
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        showError("Failed to fetch doctors");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, showError],
  );

  // Uses scheduleApi instead of appointmentApi
  const fetchSchedulesByDoctor = useCallback(
    async (doctorId) => {
      setSlotsLoading(true);
      try {
        const response = await scheduleApi.getSchedulesByDoctor(doctorId);
        const scheduleData = normalizeSchedulesResponse(response.data);
        setSchedules(scheduleData);

        if (scheduleData.length === 0) {
          showError("No available schedules for this doctor");
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
        showError("Failed to fetch available slots");
        setSchedules([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [showError],
  );

  useEffect(() => {
    fetchDoctors(1);
  }, [filters, fetchDoctors]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleBookClick = async (doctor) => {
    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
    await fetchSchedulesByDoctor(doctor._id);
  };

  const handleConfirmBooking = async (bookingData) => {
    const result = await bookAppointment(bookingData);

    if (result.success) {
      showSuccess("Appointment booked successfully!");
      setBookingModalOpen(false);
      return { success: true };
    } else {
      const errorMsg = result.message || "Failed to book appointment";

      if (
        errorMsg.includes("2 active appointments") ||
        errorMsg.includes("appointment limit") ||
        errorMsg.includes("maximum")
      ) {
        showError("You cannot hold more than 2 active appointments at a time");
      } else {
        showError(errorMsg);
      }

      return { success: false, message: errorMsg };
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
        <p className="text-gray-600">
          Browse our network of experienced doctors
        </p>
      </div>

      {/* Filters */}
      <SearchFilterBar onFilterChange={handleFilterChange} />

      {/* Doctor grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlassIcon}
          heading="No doctors found"
          subtext="Try adjusting your filters to find available doctors"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBookClick={handleBookClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => fetchDoctors(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedDoctor(null);
          setSchedules([]);
        }}
        doctor={selectedDoctor}
        schedules={schedules}
        onConfirm={handleConfirmBooking}
        onError={showError}
        isLoading={isBooking || slotsLoading}
      />
    </div>
  );
}
