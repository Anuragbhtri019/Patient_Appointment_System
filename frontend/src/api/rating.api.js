import axiosInstance from "./axiosInstance";

export const ratingApi = {
  rateAppointment: (appointmentId, rating) =>
    axiosInstance.post(`/ratings/${appointmentId}/rate`, { rating }),
};
