import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  } = context;

  //  Export isAdmin derived property
  const isAdmin = user?.role === "admin";

  //  Export isPatient derived property
  const isPatient = user?.role === "patient";

  //  Return all properties that components might need
  return {
    // User info
    user,

    // Authentication state
    isAuthenticated,
    isLoading,

    // Role checks (derived from user.role)
    isAdmin,
    isPatient,

    // Auth methods
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
};
