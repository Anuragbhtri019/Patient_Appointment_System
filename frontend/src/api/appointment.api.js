import axiosInstance from "./axiosInstance";

export const appointmentApi = {
  bookAppointment: (data) => axiosInstance.post("/appointments", data),
  getMyAppointments: (params) =>
    axiosInstance.get("/appointments/my-appointments", { params }),
  getAllAppointments: (params) =>
    axiosInstance.get("/appointments", { params }),
  cancelAppointment: (id) => axiosInstance.patch(`/appointments/${id}/cancel`),
  getAppointmentById: (id) => axiosInstance.get(`/appointments/${id}`),
};
