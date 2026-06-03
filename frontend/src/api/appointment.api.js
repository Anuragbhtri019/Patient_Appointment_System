import axiosInstance from './axiosInstance';

export const appointmentApi = {
  bookAppointment: (data) =>
    axiosInstance.post('/appointments', data),
  getMyAppointments: (params) =>
    axiosInstance.get('/appointments/my', { params }),
  getAllAppointments: (params) =>
    axiosInstance.get('/appointments', { params }),
  cancelAppointment: (id) =>
    axiosInstance.post(`/appointments/${id}/cancel`),
};
