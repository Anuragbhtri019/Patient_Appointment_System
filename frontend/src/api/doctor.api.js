import axiosInstance from './axiosInstance';

export const doctorApi = {
  getAllDoctors: (params) =>
    axiosInstance.get('/doctors', { params }),
  getDoctorById: (id) =>
    axiosInstance.get(`/doctors/${id}`),
  createDoctor: (data) =>
    axiosInstance.post('/doctors', data),
  updateDoctor: (id, data) =>
    axiosInstance.patch(`/doctors/${id}`, data),
  deleteDoctor: (id) =>
    axiosInstance.delete(`/doctors/${id}`),
};
