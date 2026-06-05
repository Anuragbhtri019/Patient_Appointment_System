import { createContext, useReducer, useCallback } from "react";
import { appointmentApi } from "../api/appointment.api";
import { ratingApi } from "../api/rating.api";

export const AppointmentContext = createContext();

const initialState = {
  upcoming: [],
  past: [],
  isLoading: false,
  error: null,
};

const appointmentReducer = (state, action) => {
  switch (action.type) {
    case "FETCH":
      return {
        ...state,
        upcoming: action.payload.upcoming || [],
        past: action.payload.past || [],
        isLoading: false,
      };
    case "BOOK":
      return {
        ...state,
        upcoming: [...state.upcoming, action.payload],
      };
    case "CANCEL":
      return {
        ...state,
        upcoming: state.upcoming.map((apt) =>
          apt.id === action.payload ? { ...apt, status: "Cancelled" } : apt,
        ),
      };
    case "RATE":
      return {
        ...state,
        past: state.past.map((apt) =>
          apt.id === action.payload.id
            ? { ...apt, rating: action.payload.rating }
            : apt,
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default function AppointmentProvider({ children }) {
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  const fetchMyAppointments = useCallback(async (params = {}) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await appointmentApi.getMyAppointments(params);
      const appointments = response.data.data || response.data;
      const upcoming = appointments.filter((apt) => apt.status === "Upcoming");
      const past = appointments.filter((apt) => apt.status !== "Upcoming");
      dispatch({
        type: "FETCH",
        payload: { upcoming, past },
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.message || "Failed to fetch appointments",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const bookAppointment = useCallback(async (bookingData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await appointmentApi.bookAppointment(bookingData);

      const appointment =
        response.data?.data?.appointment ||
        response.data?.data ||
        response.data;

      dispatch({
        type: "BOOK",
        payload: appointment,
      });

      return { success: true, appointment };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to book appointment";

      // Check for appointment limit error (400 status)
      if (error.response?.status === 400 && errorMessage.includes("2 active")) {
        dispatch({
          type: "SET_ERROR",
          payload: "You cannot hold more than 2 active appointments at a time",
        });
        return {
          success: false,
          message: "You cannot hold more than 2 active appointments at a time",
          status: 400,
        };
      }

      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return {
        success: false,
        message: errorMessage,
        status: error.response?.status,
      };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await appointmentApi.cancelAppointment(appointmentId);
      dispatch({ type: "CANCEL", payload: appointmentId });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel appointment";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const rateAppointment = useCallback(async (appointmentId, rating) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await ratingApi.rateAppointment(appointmentId, rating);
      dispatch({
        type: "RATE",
        payload: { id: appointmentId, rating },
      });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to rate appointment";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const value = {
    upcoming: state.upcoming,
    past: state.past,
    isLoading: state.isLoading,
    error: state.error,
    fetchMyAppointments,
    bookAppointment,
    cancelAppointment,
    rateAppointment,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}
