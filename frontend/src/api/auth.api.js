import axiosInstance from "./axiosInstance";

export const authApi = {
  register: (data) => {
    return axiosInstance.post("/auth/register", data);
  },

  login: (email, password) => {
    return axiosInstance.post("/auth/login", { email, password });
  },

  logout: (config = {}) => {
    return axiosInstance.post("/auth/logout", null, config);
  },

  refresh: () => {
    return axiosInstance.post("/auth/refresh");
  },

  getMe: () => {
    return axiosInstance.get("/auth/me");
  },

  // Profile management
  updateProfile: (data) => {
    return axiosInstance.patch("/auth/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword: (data) => {
    return axiosInstance.patch("/auth/change-password", data);
  },

  deleteProfileImage: () => {
    return axiosInstance.delete("/auth/profile-image");
  },

  // Email availability check (real-time validation)
  checkEmailAvailability: (data) => {
    return axiosInstance.post("/auth/check-email", data);
  },
};
