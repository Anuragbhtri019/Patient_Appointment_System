import Appointment from "../models/Appointment.js";
import cron from "node-cron";

/**
 * Parse appointment start datetime from:
 * - appointmentDate
 * - timeSlot (e.g. "02:00 PM", "2:00 PM", "14:00")
 */
export function getAppointmentStartTime(appointmentDate, timeSlot) {
  try {
    const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)?/i);

    if (!match) {
      console.warn(`[SCHEDULER] Invalid time slot: ${timeSlot}`);
      return null;
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3];

    if (period) {
      const upperPeriod = period.toUpperCase();

      if (upperPeriod === "PM" && hours !== 12) {
        hours += 12;
      }

      if (upperPeriod === "AM" && hours === 12) {
        hours = 0;
      }
    }

    const startTime = new Date(appointmentDate);

    startTime.setHours(hours, minutes, 0, 0);

    return startTime;
  } catch (error) {
    console.error(
      `[SCHEDULER ERROR] Failed parsing start time for slot ${timeSlot}`,
      error,
    );

    return null;
  }
}

/**
 * Calculate appointment end time.
 *
 * Assumption:
 * Every appointment lasts 1 hour.
 */
export function getAppointmentEndTime(appointmentDate, timeSlot) {
  const startTime = getAppointmentStartTime(appointmentDate, timeSlot);

  if (!startTime) {
    return null;
  }

  const endTime = new Date(startTime);

  endTime.setHours(endTime.getHours() + 1);

  return endTime;
}

/**
 * Determine whether an appointment should be completed.
 */
export function shouldAppointmentBeCompleted(appointment) {
  if (!appointment) return false;

  if (appointment.status !== "Upcoming") {
    return false;
  }

  const endTime = getAppointmentEndTime(
    appointment.appointmentDate,
    appointment.timeSlot,
  );

  if (!endTime) {
    return false;
  }

  return new Date() >= endTime;
}

/**
 * Update all completed appointments.
 *
 * Upcoming -> Completed
 */
export async function updateCompletedAppointments() {
  try {
    const upcomingAppointments = await Appointment.find({
      status: "Upcoming",
    }).select("_id appointmentDate timeSlot status");

    const appointmentIds = [];

    for (const appointment of upcomingAppointments) {
      if (shouldAppointmentBeCompleted(appointment)) {
        appointmentIds.push(appointment._id);
      }
    }

    if (appointmentIds.length === 0) {
      console.log("[SCHEDULER] No appointments require completion update");

      return {
        success: true,
        updatedCount: 0,
      };
    }

    const result = await Appointment.updateMany(
      {
        _id: {
          $in: appointmentIds,
        },
        status: "Upcoming",
      },
      {
        $set: {
          status: "Completed",
        },
      },
    );

    console.log(
      `[SCHEDULER] ${result.modifiedCount} appointment(s) marked as Completed`,
    );

    return {
      success: true,
      updatedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error(
      "[SCHEDULER ERROR] Failed updating appointment statuses:",
      error,
    );

    throw error;
  }
}

/**
 * Manual trigger.
 *
 * Used by admin endpoint.
 */
export async function manualUpdateAppointments() {
  return await updateCompletedAppointments();
}

/**
 * Realtime appointment status.
 *
 * Does not update database.
 */
export async function getRealtimeAppointmentStatus(appointmentId) {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "name email")
      .populate("doctor")
      .populate("schedule");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const endTime = getAppointmentEndTime(
      appointment.appointmentDate,
      appointment.timeSlot,
    );

    const hasCompleted =
      appointment.status === "Upcoming" && endTime && new Date() >= endTime;

    return {
      appointment,
      dbStatus: appointment.status,
      realtimeStatus: hasCompleted ? "Completed" : appointment.status,
      hasCompleted,
      appointmentEndTime: endTime,
      currentTime: new Date(),
      minutesUntilCompletion: endTime
        ? Math.max(0, Math.ceil((endTime.getTime() - Date.now()) / (1000 * 60)))
        : null,
    };
  } catch (error) {
    console.error(
      "[SCHEDULER ERROR] Failed getting realtime appointment status:",
      error,
    );

    throw error;
  }
}

/**
 * Scheduler initialization.
 *
 * Runs every 5 minutes.
 */
export function initializeAppointmentScheduler() {
  console.log("[SCHEDULER] Initializing appointment status scheduler...");

  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log(
        `[SCHEDULER] Running appointment status update at ${new Date().toISOString()}`,
      );

      await updateCompletedAppointments();
    } catch (error) {
      console.error("[SCHEDULER ERROR] Cron execution failed:", error);
    }
  });

  console.log("[SCHEDULER] Appointment scheduler started successfully");
}
