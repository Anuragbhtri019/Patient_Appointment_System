import Appointment from "../models/Appointment.js";
import Schedule from "../models/Schedule.js";
import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const bookAppointment = catchAsync(async (req, res) => {
  const { doctorId, scheduleId, slotId, consultationType } = req.body;
  const patientId = req.user._id;

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new AppError("Schedule not found", 404);
  }

  const slot = schedule.timeSlots.id(slotId);
  if (!slot) {
    throw new AppError("Slot not found", 404);
  }

  if (slot.status === "Booked") {
    throw new AppError("This slot is already booked", 400);
  }

  slot.status = "Booked";
  await schedule.save();

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    schedule: scheduleId,
    slotId,
    timeSlot: slot.time,
    consultationType,
    appointmentDate: schedule.availableDate,
    status: "Upcoming",
  });

  const populatedAppointment = await appointment
    .populate("patient")
    .populate("doctor")
    .populate("schedule");

  res.status(201).json({
    status: "success",
    data: { appointment: populatedAppointment },
  });
});

export const getMyAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate("doctor")
    .populate("schedule")
    .sort("-appointmentDate");

  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const past = appointments.filter((a) => a.status !== "Upcoming");

  res.status(200).json({
    status: "success",
    data: { upcoming, past, total: appointments.length },
  });
});

export const getAllAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.find()
    .populate("patient")
    .populate("doctor")
    .populate("schedule")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: { appointments },
  });
});

export const cancelAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new AppError("You can only cancel your own appointments", 403);
  }

  if (appointment.status !== "Upcoming") {
    throw new AppError("You can only cancel upcoming appointments", 400);
  }

  if (appointment.appointmentDate < new Date()) {
    throw new AppError("Cannot cancel past appointments", 400);
  }

  const schedule = await Schedule.findById(appointment.schedule);
  const slot = schedule.timeSlots.id(appointment.slotId);
  slot.status = "Available";
  await schedule.save();

  appointment.status = "Cancelled";
  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment cancelled successfully",
  });
});

export const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient")
    .populate("doctor")
    .populate("schedule");

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: { appointment },
  });
});
