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
};
