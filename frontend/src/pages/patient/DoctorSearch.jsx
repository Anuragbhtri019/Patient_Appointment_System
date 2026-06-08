import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { doctorApi } from "../../api/doctor.api";
import { scheduleApi } from "../../api/schedule.api";

import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

import SearchFilterBar from "../../components/filters/SearchFilterBar";
import DoctorCard from "../../components/doctor/DoctorCard";
import BookingModal from "../../components/appointment/BookingModal";

import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

function normalizeDoctorsResponse(payload) {
  if (Array.isArray(payload?.data?.doctors)) return payload.data.doctors;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.doctors)) return payload.doctors;
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalizeSchedulesResponse(payload) {
  if (Array.isArray(payload?.data?.schedules)) return payload.data.schedules;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.schedules)) return payload.schedules;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function DoctorSearch() {
  const navigate = useNavigate();

  const { user, isAuthenticated, isAdmin, isPatient } = useAuth();

  const { showSuccess, showError } = useToast();
  const { bookAppointment, isLoading: isBooking } = useAppointments();

  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);

  // Fetch Doctors

  const fetchDoctors = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);

        const response = await doctorApi.getAllDoctors({
          page,
          limit: 10,
          ...filters,
        });

        setDoctors(normalizeDoctorsResponse(response.data));

        setTotalPages(
          response.data?.pagination?.pages ||
            response.data?.data?.pagination?.pages ||
            1,
        );

        setCurrentPage(page);
      } catch (error) {
        console.error(error);
        showError("Failed to fetch doctors");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, showError],
  );

  useEffect(() => {
    fetchDoctors(1);
  }, [fetchDoctors]);

  // Fetch Doctor Schedules

  const fetchSchedulesByDoctor = useCallback(
    async (doctorId) => {
      try {
        setSlotsLoading(true);

        const response = await scheduleApi.getSchedulesByDoctor(doctorId);

        const scheduleData = normalizeSchedulesResponse(response.data);

        setSchedules(scheduleData);

        return scheduleData;
      } catch (error) {
        console.error(error);

        showError("Failed to fetch available schedules");

        setSchedules([]);

        return [];
      } finally {
        setSlotsLoading(false);
      }
    },
    [showError],
  );

  // Book Button Click

  const handleBookClick = async (doctor) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/search",
          message: "Please login to book an appointment.",
        },
      });

      return;
    }
    if (isAdmin) {
      showError(
        "Admin accounts cannot book appointments.Please use a patient account.",
      );
      return;
    }

    if (!isPatient) {
      showError(
        "Only patient accounts can book appointments.Your account role is not recognized.",
      );

      return;
    }

    const scheduleData = await fetchSchedulesByDoctor(doctor._id);

    if (!scheduleData.length) {
      showError("No available schedules for this doctor.");

      return;
    }

    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
  };

  // Booking Confirmation
  const handleConfirmBooking = async (bookingData) => {
    try {
      const result = await bookAppointment(bookingData);

      if (!result.success) {
        throw new Error(result.message || "Booking failed");
      }

      showSuccess("Appointment booked successfully!");

      return { success: true };
    } catch (error) {
      const message = error.message || "Failed to book appointment";

      showError(message);

      return {
        success: false,
        message,
      };
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // AFTER ALL HOOKS AND CALLBACKS

  if (isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Admin Dashboard Access
          </h2>

          <p className="text-blue-700 mb-4">
            As an admin, you cannot book appointments. Please visit the{" "}
            <button
              onClick={() => navigate("/admin")}
              className="underline font-semibold hover:text-blue-600"
            >
              Admin Dashboard
            </button>{" "}
            to manage appointments instead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>

        <p className="text-gray-600">
          Browse our network of experienced doctors
        </p>
      </div>

      {isAdmin && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-yellow-800 text-sm">
            You are logged in as an admin. Admin accounts cannot book
            appointments.
          </p>
        </div>
      )}

      <SearchFilterBar onFilterChange={handleFilterChange} />

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
          subtext="Try adjusting your filters"
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

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "primary" : "secondary"}
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

      <BookingModal
        isOpen={bookingModalOpen}
        doctor={selectedDoctor}
        schedules={schedules}
        isLoading={isBooking || slotsLoading}
        onConfirm={handleConfirmBooking}
        onError={showError}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedDoctor(null);
          setSchedules([]);
        }}
      />
    </div>
  );
}
