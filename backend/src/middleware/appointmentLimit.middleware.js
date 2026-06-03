import Appointment from "../models/Appointment.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const checkAppointmentLimit = catchAsync(async (req, res, next) => {
  const activeAppointments = await Appointment.countDocuments({
    patient: req.user._id,
    status: "Upcoming",
  });

  if (activeAppointments >= 2) {
    throw new AppError("You cannot hold more than 2 active appointments", 400);
  }

  next();
});

