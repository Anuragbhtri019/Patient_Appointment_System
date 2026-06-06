import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doctorApi } from "../../api/doctor.api";
import { appointmentApi } from "../../api/appointment.api";
import {
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "../../utils/dateUtils";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <Icon className="w-12 h-12 text-teal-600 opacity-20" />
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    todayBookings: 0,
    totalAppointments: 0,
    averageRating: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorsRes = await doctorApi.getAllDoctors({ limit: 1000 });
        const doctors =
          doctorsRes.data?.data?.doctors || doctorsRes.data?.doctors || [];

        const appointmentsRes = await appointmentApi.getAllAppointments({
          limit: 100,
        });
        const appointments =
          appointmentsRes.data?.data?.appointments ||
          appointmentsRes.data?.appointments ||
          [];

        // Calculate stats
        const today = new Date().toISOString().split("T")[0];
        const todayBookings = appointments.filter(
          (apt) => apt.appointmentDate?.split("T")[0] === today,
        ).length;

        const avgRating =
          doctors.length > 0
            ? doctors.reduce((sum, doc) => sum + (doc.averageRating || 0), 0) /
              doctors.length
            : 0;

        setStats({
          totalDoctors: doctors.length,
          todayBookings,
          totalAppointments: appointments.length,
          averageRating: avgRating.toFixed(1),
        });

        setRecentAppointments(appointments.slice(0, 10));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={UserGroupIcon}
          label="Total Doctors"
          value={stats.totalDoctors}
        />
        <StatCard
          icon={CalendarIcon}
          label="Today's Bookings"
          value={stats.todayBookings}
        />
        <StatCard
          icon={DocumentTextIcon}
          label="Total Appointments"
          value={stats.totalAppointments}
        />
        <StatCard
          icon={StarIcon}
          label="Average Rating"
          value={`${stats.averageRating} ★`}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/doctors">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <UserGroupIcon className="w-8 h-8 text-teal-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Manage Doctors</h3>
            <p className="text-gray-600 text-sm">
              Add, edit, or remove doctors
            </p>
          </div>
        </Link>
        <Link to="/admin/schedules">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <CalendarIcon className="w-8 h-8 text-teal-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Manage Schedules
            </h3>
            <p className="text-gray-600 text-sm">Set doctor availability</p>
          </div>
        </Link>
        <Link to="/admin/appointments">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <DocumentTextIcon className="w-8 h-8 text-teal-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              All Appointments
            </h3>
            <p className="text-gray-600 text-sm">View all bookings</p>
          </div>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Appointments
        </h3>
        {isLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : recentAppointments.length === 0 ? (
          <p className="text-gray-600">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold">Doctor</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr key={apt._id} className="border-b border-gray-200">
                    <td className="py-3 px-4">{apt.patient?.name || "N/A"}</td>
                    <td className="py-3 px-4">{apt.doctor?.name || "N/A"}</td>
                    <td className="py-3 px-4">
                      {/*  apt.date doesn't exist; field is appointmentDate. */}
                      {apt.appointmentDate
                        ? formatDate(apt.appointmentDate)
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          apt.status === "Upcoming"
                            ? "bg-blue-100 text-blue-800"
                            : apt.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
