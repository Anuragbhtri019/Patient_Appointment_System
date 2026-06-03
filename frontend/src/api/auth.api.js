import axiosInstance from "./axiosInstance";

export const authApi = {
  register: (data) => axiosInstance.post("/auth/register", data),
  login: (email, password) =>
    axiosInstance.post("/auth/login", { email, password }),
  logout: (config = {}) => axiosInstance.post("/auth/logout", null, config),
  refresh: () => axiosInstance.post("/auth/refresh", null),
  getMe: () => axiosInstance.get("/auth/me"),
};
