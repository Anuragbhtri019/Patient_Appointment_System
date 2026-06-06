import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { authApi } from "../api/auth.api";

export const AuthContext = createContext();

const initialState = {
  user: null,
  accessToken: null,
  isLoading: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      };
    case "LOGOUT":
      return initialState;
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export default function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const didRestoreSession = useRef(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authApi.login(email, password);
      // Backend returns: { status, data: { user, accessToken } }
      const { user, accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: "LOGIN",
        payload: { user, accessToken },
      });
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const register = useCallback(
    async (name, email, password, role = "patient") => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await authApi.register({
          name,
          email,
          password,
          role,
        });
        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Registration failed",
        };
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout({ skipAuthRefresh: true });
    } catch {
      // Ignore logout API error; local session is always cleared below.
    }
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    if (didRestoreSession.current) return;
    didRestoreSession.current = true;

    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser?._id) {
            clearSession();
            return;
          }

          const response = await authApi.getMe();
          const userData =
            response.data?.data?.user || response.data?.data || response.data;

          dispatch({
            type: "LOGIN",
            payload: { user: userData, accessToken: token },
          });
        } catch (error) {
          console.error("Failed to restore session:", error);
          clearSession();
        }
      }
    };

    restoreSession();
  }, [clearSession]);

  const value = {
    user: state.user,
    accessToken: state.accessToken,
    isLoading: state.isLoading,
    isAuthenticated: !!state.accessToken,
    isAdmin: state.user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
