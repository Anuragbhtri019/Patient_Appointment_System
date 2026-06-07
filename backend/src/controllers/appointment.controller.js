import Appointment from "../models/Appointment.js";
import Schedule from "../models/Schedule.js";
import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  manualUpdateAppointments,
  getRealtimeAppointmentStatus,
} from "../service/appointmentService.js";

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
  if (slot.consultationType !== consultationType) {
    throw new AppError(
      `This slot is only available for ${slot.consultationType} consultations`,
      400,
    );
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

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("patient", "name email")
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
    .populate("patient", "name email")
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
  if (schedule) {
    const slot = schedule.timeSlots.id(appointment.slotId);
    if (slot) {
      slot.status = "Available";
      await schedule.save();
    }
  }

  appointment.status = "Cancelled";
  if (req.body.reason) {
    appointment.cancellationReason = req.body.reason;
  }
  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment cancelled successfully",
  });
});

export const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient", "name email")
    .populate("doctor")
    .populate("schedule");

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (
    appointment.patient._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You do not have permission to view this appointment",
      403,
    );
  }

  res.status(200).json({
    status: "success",
    data: { appointment },
  });
});

export const updateAppointmentStatuses = catchAsync(async (req, res) => {
  // Optional: Add admin check if you want this restricted
  // if (req.user.role !== "admin") {
  //   throw new AppError("Only admins can manually update appointment statuses", 403);
  // }

  const { option } = req.body;

  if (!option) {
    throw new AppError(
      'Please provide an option: "complete-1h" or "complete-now"',
      400,
    );
  }

  if (option !== "complete-1h" && option !== "complete-now") {
    throw new AppError(
      'Invalid option. Use "complete-1h" or "complete-now"',
      400,
    );
  }

  // Call the service function to update statuses
  const result = await manualUpdateAppointments(option);

  res.status(200).json({
    status: "success",
    message: `Updated ${result.updatedCount} appointments to Completed`,
    data: {
      updatedCount: result.updatedCount,
      option: result.option,
      timestamp: result.timestamp,
    },
  });
});

export const checkAppointmentStatus = catchAsync(async (req, res) => {
  try {
    const result = await getRealtimeAppointmentStatus(req.params.id);

    // Permission check - user can only check their own appointments, or admin can check any
    if (
      result.appointment.patient._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new AppError(
        "You do not have permission to view this appointment",
        403,
      );
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.message === "Appointment not found") {
      throw new AppError("Appointment not found", 404);
    }
    throw error;
  }
});

export const checkMultipleAppointmentStatuses = catchAsync(async (req, res) => {
  const { appointmentIds } = req.body;

  if (!appointmentIds || !Array.isArray(appointmentIds)) {
    throw new AppError("Please provide appointmentIds as an array", 400);
  }

  if (appointmentIds.length === 0) {
    throw new AppError("appointmentIds array cannot be empty", 400);
  }

  if (appointmentIds.length > 100) {
    throw new AppError("Cannot check more than 100 appointments at once", 400);
  }

  // Get all appointments
  const appointments = await Appointment.find({
    _id: { $in: appointmentIds },
  });

  // Permission check - filter out appointments user can't see
  const authorizedAppointments = appointments.filter((apt) => {
    return (
      apt.patient._id.toString() === req.user._id.toString() ||
      req.user.role === "admin"
    );
  });

  if (authorizedAppointments.length === 0) {
    throw new AppError(
      "You don't have permission to view any of these appointments",
      403,
    );
  }

  // Calculate real-time statuses
  const now = new Date();
  const results = authorizedAppointments.map((apt) => {
    const timeParts = apt.timeSlot.match(/(\d+):(\d+)/);
    let realtimeStatus = apt.status;
    let hasCompleted = false;

    if (timeParts && apt.status === "Upcoming") {
      let hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);

      const appointmentEnd = new Date(apt.appointmentDate);
      appointmentEnd.setHours(hours + 1, minutes, 0, 0);

      if (now >= appointmentEnd) {
        realtimeStatus = "Completed";
        hasCompleted = true;
      }
    }

    return {
      id: apt._id,
      realtimeStatus,
      dbStatus: apt.status,
      hasCompleted,
      appointmentDate: apt.appointmentDate,
      timeSlot: apt.timeSlot,
    };
  });

  // Count statuses
  const completed = results.filter(
    (r) => r.realtimeStatus === "Completed",
  ).length;
  const upcoming = results.filter(
    (r) => r.realtimeStatus === "Upcoming",
  ).length;
  const cancelled = results.filter(
    (r) => r.realtimeStatus === "Cancelled",
  ).length;

  res.status(200).json({
    status: "success",
    data: {
      appointments: results,
      summary: {
        total: results.length,
        completed,
        upcoming,
        cancelled,
      },
    },
  });
});

export const getAppointmentsGroupedByStatus = catchAsync(async (req, res) => {
  // Get all appointments for the user or all if admin
  const query = req.user.role === "admin" ? {} : { patient: req.user._id };

  const appointments = await Appointment.find(query)
    .populate("patient", "name email")
    .populate("doctor", "name specialization")
    .populate("schedule");

  const now = new Date();
  const grouped = {
    upcoming: [],
    completed: [],
    cancelled: [],
  };

  // Process each appointment
  appointments.forEach((apt) => {
    if (apt.status === "Cancelled") {
      grouped.cancelled.push({
        ...apt.toObject(),
        realtimeStatus: "Cancelled",
      });
    } else if (apt.status === "Upcoming") {
      // Check if 1 hour has passed
      const timeParts = apt.timeSlot.match(/(\d+):(\d+)/);
      if (timeParts) {
        let hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);

        const appointmentEnd = new Date(apt.appointmentDate);
        appointmentEnd.setHours(hours + 1, minutes, 0, 0);

        if (now >= appointmentEnd) {
          grouped.completed.push({
            ...apt.toObject(),
            realtimeStatus: "Completed",
          });
        } else {
          grouped.upcoming.push({
            ...apt.toObject(),
            realtimeStatus: "Upcoming",
          });
        }
      } else {
        grouped.upcoming.push({
          ...apt.toObject(),
          realtimeStatus: "Upcoming",
        });
      }
    } else {
      // Status is "Completed" in database
      grouped.completed.push({
        ...apt.toObject(),
        realtimeStatus: "Completed",
      });
    }
  });

  res.status(200).json({
    status: "success",
    data: {
      upcoming: grouped.upcoming,
      completed: grouped.completed,
      cancelled: grouped.cancelled,
      counts: {
        upcoming: grouped.upcoming.length,
        completed: grouped.completed.length,
        cancelled: grouped.cancelled.length,
        total: appointments.length,
      },
    },
  });
});
