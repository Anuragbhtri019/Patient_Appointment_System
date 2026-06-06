import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { incrementalAverage } from "../utils/ratingUtils.js";

export const rateAppointment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const { rating, feedback } = req.body;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new AppError("You can only rate your own appointments", 403);
  }

  if (appointment.status !== "Completed") {
    throw new AppError("You can only rate completed appointments", 400);
  }

  if (appointment.rating !== null) {
    throw new AppError("This appointment has already been rated", 400);
  }

  appointment.rating = rating;
  appointment.ratedAt = new Date();
  if (feedback) {
    appointment.feedback = feedback;
  }
  await appointment.save();

  const doctor = await Doctor.findById(appointment.doctor);

  const { newAverage, newCount } = incrementalAverage(
    doctor.averageRating,
    doctor.totalRatings,
    rating,
  );

  await Doctor.findByIdAndUpdate(
    appointment.doctor,
    {
      averageRating: newAverage,
      totalRatings: newCount,
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: "success",
    message: "Appointment rated successfully",
    data: { appointment },
  });
});
