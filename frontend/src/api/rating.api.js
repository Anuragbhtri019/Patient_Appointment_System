import axiosInstance from './axiosInstance';

export const ratingApi = {
  rateAppointment: (appointmentId, rating) =>
    axiosInstance.post(`/appointments/${appointmentId}/rate`, { rating }),
};
