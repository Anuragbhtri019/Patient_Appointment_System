import axiosInstance from "./axiosInstance";

export const doctorApi = {
  getAllDoctors: (params) => axiosInstance.get("/doctors", { params }),
  getDoctorById: (id) => axiosInstance.get(`/doctors/${id}`),
  createDoctor: (data) =>
    axiosInstance.post("/doctors", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateDoctor: (id, data) =>
    axiosInstance.patch(`/doctors/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteDoctor: (id) => axiosInstance.delete(`/doctors/${id}`),
  getSchedulesByDoctor: (doctorId, params = {}) =>
    axiosInstance.get(`/schedules/doctor/${doctorId}`, { params }),
};
