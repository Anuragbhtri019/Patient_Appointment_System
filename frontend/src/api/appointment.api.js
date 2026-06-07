import axiosInstance from "./axiosInstance";

export const appointmentApi = {
  bookAppointment: (data) => axiosInstance.post("/appointments", data),
  getMyAppointments: (params) =>
    axiosInstance.get("/appointments/my-appointments", { params }),
  getAllAppointments: (params) =>
    axiosInstance.get("/appointments", { params }),
  getAppointmentById: (id) => axiosInstance.get(`/appointments/${id}`),

  cancelAppointment: (id, reason) =>
    axiosInstance.patch(`/appointments/${id}/cancel`, { reason }),

  // Check real-time status of single appointment
  checkStatus: (appointmentId) =>
    axiosInstance.get(`/appointments/${appointmentId}/check-status`),

  // Check real-time status of multiple appointments
  checkStatuses: (appointmentIds) =>
    axiosInstance.post(`/appointments/check-statuses`, { appointmentIds }),

  // Get appointments grouped by status
  getGroupedByStatus: () =>
    axiosInstance.get(`/appointments/grouped-by-status`),
};
export const {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  checkStatus,
  checkStatuses,
  getGroupedByStatus,
} = appointmentApi;
