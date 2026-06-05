import axiosInstance from "./axiosInstance";

export const scheduleApi = {
  getSchedulesByDoctor: (doctorId, params = {}) =>
    axiosInstance.get(`/schedules/doctor/${doctorId}`, { params }),

  createSchedule: (data) => axiosInstance.post("/schedules", data),

  updateSchedule: (scheduleId, data) =>
    axiosInstance.patch(`/schedules/${scheduleId}`, data),

  deleteSchedule: (scheduleId) =>
    axiosInstance.delete(`/schedules/${scheduleId}`),
};
