import Appointment from "../models/Appointment.js";
import Schedule from "../models/Schedule.js";
import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  manualUpdateAppointments,
  getRealtimeAppointmentStatus,
} from "../service/appointmentService.js";

// PATIENT FUNCTIONS
/**
 * Book an appointment
 * POST /api/appointments
 * Access: Patient only
 *
 * FIXED: Added role check to prevent admins from booking
 */
export const bookAppointment = catchAsync(async (req, res) => {
  const { doctorId, scheduleId, slotId, consultationType } = req.body;
  const patientId = req.user._id;

  // ✓ FIX #1: Check that user is actually a patient
  if (req.user.role !== "patient") {
    throw new AppError(
      "Only patients can book appointments. Your account appears to be an admin account.",
      403,
    );
  }

  // Get the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new AppError("Schedule not found", 404);
  }

  // Find the specific time slot
  const slot = schedule.timeSlots.id(slotId);
  if (!slot) {
    throw new AppError("Slot not found", 404);
  }

  // Check if slot is already booked
  if (slot.status === "Booked") {
    throw new AppError("This slot is already booked", 400);
  }

  // Check if consultation type matches
  if (slot.consultationType !== consultationType) {
    throw new AppError(
      `This slot is only available for ${slot.consultationType} consultations`,
      400,
    );
  }

  // Mark slot as booked
  slot.status = "Booked";
  await schedule.save();

  // Create appointment
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

  // Return populated appointment
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("patient", "name email")
    .populate("doctor")
    .populate("schedule");

  res.status(201).json({
    status: "success",
    data: { appointment: populatedAppointment },
  });
});

/**
 * Get user's own appointments
 * GET /api/appointments/my-appointments
 * Access: Authenticated users (gets their own appointments)
 */
export const getMyAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate("doctor")
    .populate("schedule")
    .sort("-appointmentDate");

  // Separate into upcoming and past
  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const past = appointments.filter((a) => a.status !== "Upcoming");

  res.status(200).json({
    status: "success",
    data: { upcoming, past, total: appointments.length },
  });
});

/**
 * Cancel an appointment
 * PATCH /api/appointments/:id/cancel
 * Access: Patient (owner of appointment)
 */
export const cancelAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  // Check ownership - patient can only cancel their own appointments
  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new AppError("You can only cancel your own appointments", 403);
  }

  // Can only cancel upcoming appointments
  if (appointment.status !== "Upcoming") {
    throw new AppError("You can only cancel upcoming appointments", 400);
  }

  // Cannot cancel past appointments
  if (appointment.appointmentDate < new Date()) {
    throw new AppError("Cannot cancel past appointments", 400);
  }

  // Free up the schedule slot
  const schedule = await Schedule.findById(appointment.schedule);
  if (schedule) {
    const slot = schedule.timeSlots.id(appointment.slotId);
    if (slot) {
      slot.status = "Available";
      await schedule.save();
    }
  }

  // Update appointment status
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

/**
 * Get a specific appointment
 * GET /api/appointments/:id
 * Access: Patient (owner) or Admin
 */
export const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient", "name email")
    .populate("doctor")
    .populate("schedule");

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  // Check permission
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

// ADMIN FUNCTIONS
/**
 * Get all appointments (admin dashboard)
 * GET /api/appointments
 * Access: Admin only
 */
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

/**
 * Manually update appointment statuses
 * POST /api/appointments/update-statuses
 * Access: Admin only
 *
 * Triggers the appointment status update logic that normally runs on schedule
 */
export const updateAppointmentStatuses = catchAsync(async (req, res) => {
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

/**
 * Check real-time status of a single appointment
 * GET /api/appointments/:id/check-status
 * Access: Patient (owner) or Admin
 *
 * Returns real-time status based on current time without updating DB
 */
export const checkAppointmentStatus = catchAsync(async (req, res) => {
  try {
    const result = await getRealtimeAppointmentStatus(req.params.id);

    // Check permission
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

/**
 * Check real-time status of multiple appointments
 * POST /api/appointments/check-statuses
 * Access: Admin only
 *
 * Bulk check real-time status without updating DB
 */
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

  // Calculate real-time statuses
  const now = new Date();
  const results = appointments.map((apt) => {
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

/**
 * Get appointments grouped by real-time status
 * GET /api/appointments/grouped-by-status
 * Access: Authenticated users
 *
 * Returns appointments grouped by their real-time status
 * Patients see only their own, admins see all
 */
export const getAppointmentsGroupedByStatus = catchAsync(async (req, res) => {
  // Build query based on role
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
