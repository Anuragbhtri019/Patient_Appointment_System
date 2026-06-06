import axiosInstance from "./axiosInstance";

export const ratingApi = {
  rateAppointment: (appointmentId, rating, feedback = "") =>
    axiosInstance.post(`/ratings/${appointmentId}/rate`, { rating, feedback }),
};
