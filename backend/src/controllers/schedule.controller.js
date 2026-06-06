import Schedule from "../models/Schedule.js";
import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createSchedule = catchAsync(async (req, res) => {
  const { doctorId, availableDate, timeSlots } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const existingSchedule = await Schedule.findOne({
    doctor: doctorId,
    availableDate: new Date(availableDate),
  });

  if (existingSchedule) {
    throw new AppError("Schedule already exists for this date", 409);
  }

  const schedule = await Schedule.create({
    doctor: doctorId,
    availableDate: new Date(availableDate),
    timeSlots,
  });

  const populatedSchedule = await schedule.populate("doctor");

  res.status(201).json({
    status: "success",
    data: { schedule: populatedSchedule },
  });
});

export const getSchedulesByDoctor = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  let query = { doctor: doctorId };
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    query.availableDate = { $gte: startDate, $lt: endDate };
  }

  const schedules = await Schedule.find(query)
    .populate("doctor")
    .sort("availableDate");

  res.status(200).json({
    status: "success",
    results: schedules.length,
    data: { schedules },
  });
});

export const updateSchedule = catchAsync(async (req, res) => {
  const { timeSlots } = req.body;

  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) {
    throw new AppError("Schedule not found", 404);
  }

  const updatedSchedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { timeSlots },
    { new: true, runValidators: true },
  ).populate("doctor");

  res.status(200).json({
    status: "success",
    data: { schedule: updatedSchedule },
  });

  res.status(200).json({
    status: "success",
    data: { schedule },
  });
});

export const deleteSchedule = catchAsync(async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (!schedule) {
    throw new AppError("Schedule not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Schedule deleted successfully",
  });
});
