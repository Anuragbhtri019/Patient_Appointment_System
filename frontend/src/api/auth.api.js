import axiosInstance from "./axiosInstance";

export const authApi = {
  register: (data) => axiosInstance.post("/auth/register", data),
  login: (email, password) =>
    axiosInstance.post("/auth/login", { email, password }),
  logout: (config = {}) => axiosInstance.post("/auth/logout", null, config),
  refresh: () => axiosInstance.post("/auth/refresh", null),
  getMe: () => axiosInstance.get("/auth/me"),

  // Profile management
  updateProfile: (data) =>
    axiosInstance.patch("/auth/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  changePassword: (data) => axiosInstance.patch("/auth/change-password", data),
  deleteProfileImage: () => axiosInstance.delete("/auth/profile-image"),

  // Email availability check
  // Real-time validation to prevent users from entering taken emails
  checkEmailAvailability: (data) =>
    axiosInstance.post("/auth/check-email", data),
};
