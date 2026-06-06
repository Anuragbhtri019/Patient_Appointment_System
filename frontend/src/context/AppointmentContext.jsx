import { createContext, useReducer, useCallback } from "react";
import { appointmentApi } from "../api/appointment.api";
import { ratingApi } from "../api/rating.api";

export const AppointmentContext = createContext(null);

const INITIAL_STATE = { upcoming: [], past: [], isLoading: false, error: null };

function appointmentReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "FETCH":
      return {
        ...state,
        upcoming: action.payload.upcoming || [],
        past: action.payload.past || [],
        isLoading: false,
        error: null,
      };
    case "BOOK":
      return { ...state, upcoming: [...state.upcoming, action.payload] };
    case "CANCEL":
      return {
        ...state,
        upcoming: state.upcoming.map((apt) =>
          apt._id === action.payload ? { ...apt, status: "Cancelled" } : apt,
        ),
      };
    case "RATE":
      return {
        ...state,
        past: state.past.map((apt) =>
          apt._id === action.payload.id
            ? { ...apt, rating: action.payload.rating }
            : apt,
        ),
      };
    default:
      return state;
  }
}

export default function AppointmentProvider({ children }) {
  const [state, dispatch] = useReducer(appointmentReducer, INITIAL_STATE);

  const fetchMyAppointments = useCallback(async (params = {}) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await appointmentApi.getMyAppointments(params);
      // Backend: { status, data: { upcoming: [], past: [], total: N } }
      const { upcoming = [], past = [] } = data?.data || {};
      dispatch({ type: "FETCH", payload: { upcoming, past } });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err.response?.data?.message || "Failed to fetch appointments",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const bookAppointment = useCallback(async (bookingData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await appointmentApi.bookAppointment(bookingData);
      const appointment = data?.data?.appointment || data?.data;
      dispatch({ type: "BOOK", payload: appointment });
      return { success: true, appointment };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to book appointment";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message, status: err.response?.status };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentId, reason) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await appointmentApi.cancelAppointment(appointmentId, reason);
      dispatch({ type: "CANCEL", payload: appointmentId });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to cancel appointment";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, message };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const rateAppointment = useCallback(
    async (appointmentId, rating, feedback = "") => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        await ratingApi.rateAppointment(appointmentId, rating, feedback);
        dispatch({ type: "RATE", payload: { id: appointmentId, rating } });
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to rate appointment";
        dispatch({ type: "SET_ERROR", payload: message });
        return { success: false, message };
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [],
  );

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
