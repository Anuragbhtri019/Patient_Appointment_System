import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { authApi } from "../api/auth.api";

export const AuthContext = createContext(null);

const INITIAL_STATE = {
  user: null,
  accessToken: null,
  isLoading: false,
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isLoading: false,
      };

    case "UPDATE_USER":
      return { ...state, user: action.payload };

    case "LOGOUT":
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

//  Provider
export default function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);
  const sessionRestored = useRef(false);

  //  internal helpers
  const persistSession = (user, accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  }, []);

  //  login
  const login = useCallback(async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await authApi.login(email, password);
      // Backend: { status, data: { user, accessToken } }
      const { user, accessToken } = data.data;
      persistSession(user, accessToken);
      dispatch({ type: "LOGIN_SUCCESS", payload: { user, accessToken } });
      return { success: true, user };
    } catch (err) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message:
          err.response?.data?.message || "Login failed. Please try again.",
      };
    }
  }, []);

  //  register
  const register = useCallback(
    async ({ name, email, password, role = "patient" }) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const { data } = await authApi.register({
          name,
          email,
          password,
          role,
        });
        return { success: true, data };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            "Registration failed. Please try again.",
        };
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [],
  );

  //  logout
  const logout = useCallback(async () => {
    try {
      // skipAuthRefresh prevents the interceptor from looping on 401 during logout
      await authApi.logout({ skipAuthRefresh: true });
    } catch {
      // Always clear locally even if the server call fails
    } finally {
      clearSession();
    }
  }, [clearSession]);

  //  updateUser (syncs context + localStorage after any profile change)
  const updateUser = useCallback((updatedUser) => {
    dispatch({ type: "UPDATE_USER", payload: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  //  updateProfile
  const updateProfile = useCallback(
    async (formData) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const { data } = await authApi.updateProfile(formData);
        const updatedUser = data?.data?.user;
        if (updatedUser) updateUser(updatedUser);
        return { success: true, user: updatedUser };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update profile.",
        };
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [updateUser],
  );

  //  changePassword
  const changePassword = useCallback(async (payload) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await authApi.changePassword(payload);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to change password.",
      };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  //  session restore on mount
  useEffect(() => {
    if (sessionRestored.current) return;
    sessionRestored.current = true;

    async function restore() {
      try {
        let token = localStorage.getItem("accessToken");

        if (!token) {
          const refreshRes = await authApi.refresh();

          token = refreshRes.data.data.accessToken;

          localStorage.setItem("accessToken", token);
        }

        const { data } = await authApi.getMe();

        const freshUser = data?.data?.user;

        if (!freshUser) {
          clearSession();
          return;
        }

        localStorage.setItem("user", JSON.stringify(freshUser));

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: freshUser,
            accessToken: token,
          },
        });
      } catch {
        clearSession();
      }
    }

    restore();
  }, [clearSession]);

  //  context value
  const value = {
    // State
    user: state.user,
    accessToken: state.accessToken,
    isLoading: state.isLoading,
    isAuthenticated: !!state.accessToken && !!state.user,
    isAdmin: state.user?.role === "admin",

    // Actions
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
