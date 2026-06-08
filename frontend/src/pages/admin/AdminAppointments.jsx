import { useEffect, useMemo, useState } from "react";
import { appointmentApi } from "../../api/appointment.api";
import { useToast } from "../../hooks/useToast";
import { formatDate, formatTime } from "../../utils/dateUtils";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    date: "",
  });

  const { showError } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);

        const response = await appointmentApi.getAllAppointments();

        const appointmentData =
          response?.data?.data?.appointments ||
          response?.data?.appointments ||
          [];

        setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      } catch (error) {
        console.error(error);
        showError("Failed to fetch appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [showError]);

  const filteredAppointments = useMemo(() => {
    let data = [...appointments];

    if (filters.status) {
      data = data.filter(
        (appointment) => appointment.status === filters.status,
      );
    }

    if (filters.date) {
      data = data.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate)
          .toISOString()
          .split("T")[0];

        return appointmentDate === filters.date;
      });
    }

    return data.sort(
      (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate),
    );
  }, [appointments, filters]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";

      case "Completed":
        return "bg-green-100 text-green-800";

      case "Cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>

        <p className="text-gray-600 mt-1">View all patient appointments</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>

          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold">Patient</th>

                  <th className="text-left py-3 px-4 font-semibold">Doctor</th>

                  <th className="text-left py-3 px-4 font-semibold">
                    Date & Time
                  </th>

                  <th className="text-left py-3 px-4 font-semibold">Type</th>

                  <th className="text-left py-3 px-4 font-semibold">Status</th>

                  <th className="text-left py-3 px-4 font-semibold">Rating</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{apt.patient?.name || "N/A"}</td>

                    <td className="py-3 px-4">{apt.doctor?.name || "N/A"}</td>

                    <td className="py-3 px-4 text-gray-600">
                      {apt.appointmentDate
                        ? formatDate(apt.appointmentDate)
                        : "N/A"}

                      {apt.timeSlot && ` at ${formatTime(apt.timeSlot)}`}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {apt.consultationType || "N/A"}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          apt.status,
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {apt.rating ? `${apt.rating} ★` : "-"}
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
