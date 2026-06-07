import Appointment from "../models/Appointment.js";
import cron from "node-cron";

/**
 * Calculate appointment end time
 * Assumes 1-hour appointment duration
 *
 * @param {Date} appointmentDate - Date of appointment
 * @param {String} timeSlot - Time slot (e.g., "02:00 PM" or "14:00")
 * @returns {Date} End time of appointment (1 hour after start)
 */
function getAppointmentEndTime(appointmentDate, timeSlot) {
  try {
    // Parse time slot - handles both "02:00 PM" and "14:00" formats
    const timeParts = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeParts) {
      console.warn(`Could not parse time slot: ${timeSlot}`);
      return null;
    }

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const period = timeParts[3];

    // Convert to 24-hour format if AM/PM provided
    if (period) {
      if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    // Create datetime for appointment end (1 hour after start)
    const endTime = new Date(appointmentDate);
    endTime.setHours(hours + 1, minutes, 0, 0);

    return endTime;
  } catch (error) {
    console.error(`Error parsing time slot: ${timeSlot}`, error);
    return null;
  }
}

/**
 * Update completed appointments
 * Changes status from "Upcoming" to "Completed"
 * when appointment time + 1 hour has elapsed
 *
 * This allows appointments to be marked as "in progress" for their 1-hour duration,
 * then marked as "Completed" after the appointment window closes
 */
export async function updateCompletedAppointments() {
  try {
    const now = new Date();

    // Find all upcoming appointments
    const upcomingAppointments = await Appointment.find({
      status: "Upcoming",
    });

    // Filter for appointments where 1 hour has passed
    const appointmentsToUpdate = upcomingAppointments.filter((apt) => {
      const endTime = getAppointmentEndTime(apt.appointmentDate, apt.timeSlot);
      if (!endTime) return false;

      // Check if current time is >= appointment end time (1 hour after start)
      return now >= endTime;
    });

    if (appointmentsToUpdate.length > 0) {
      const appointmentIds = appointmentsToUpdate.map((apt) => apt._id);

      // Update all appointments that have completed
      const result = await Appointment.updateMany(
        { _id: { $in: appointmentIds } },
        { status: "Completed" },
        { timestamps: false }, // Don't update timestamps, only status
      );

      console.log(
        `[✓ APPOINTMENT STATUS] Updated ${result.modifiedCount} appointments to "Completed"`,
      );
      console.log(`[INFO] Appointment IDs: ${appointmentIds.join(", ")}`);
    } else {
      console.log("[INFO] No completed appointments to update");
    }
  } catch (error) {
    console.error(
      "[✗ ERROR] Failed to update appointment statuses:",
      error.message,
    );
  }
}

/**
 * ALTERNATIVE: Update appointments immediately when time passes
 * Use this if you want status to change AT the appointment time,
 * not 1 hour later
 *
 * Replace updateCompletedAppointments() call with this to use
 */
export async function updatePassedAppointments() {
  try {
    const now = new Date();

    // Find all upcoming appointments
    const upcomingAppointments = await Appointment.find({
      status: "Upcoming",
    });

    // Filter for appointments where start time has passed
    const appointmentsToUpdate = upcomingAppointments.filter((apt) => {
      const timeParts = apt.timeSlot.match(/(\d+):(\d+)/);
      if (!timeParts) return false;

      let hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);

      // Create date object for appointment start time
      const startTime = new Date(apt.appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      // Check if appointment start time has passed
      return now >= startTime;
    });

    if (appointmentsToUpdate.length > 0) {
      const appointmentIds = appointmentsToUpdate.map((apt) => apt._id);

      const result = await Appointment.updateMany(
        { _id: { $in: appointmentIds } },
        { status: "Completed" },
        { timestamps: false },
      );

      console.log(
        `[✓ APPOINTMENT STATUS] Updated ${result.modifiedCount} appointments to "Completed" (immediately)"`,
      );
    } else {
      console.log("[INFO] No passed appointments to update");
    }
  } catch (error) {
    console.error(
      "[✗ ERROR] Failed to update appointment statuses:",
      error.message,
    );
  }
}

/**
 * Initialize the appointment status scheduler
 * Sets up automatic status updates via cron job
 * 
 * Call this in server.js during startup
 * 
 * Cron schedule format: "minute hour day month dayOfWeek"
 * 
 
 Examples:

    //   Every 5 minutes (RECOMMENDED) 
     //  Every 5 minutes (RECOMMENDED)
  *   "* * * * *"     = Every minute (More frequent, more load)
   *   "0 * * * *"     = Every hour (Less frequent, possible delays)
 
     */
export function initializeAppointmentScheduler() {
  console.log("[SCHEDULER] Initializing appointment status auto-updater...");

  // OPTION 1: Update 1 hour after appointment time (RECOMMENDED)
  // This means appointments stay "Upcoming" during their 1-hour slot,
  // then change to "Completed" after the window closes
  cron.schedule("*/5 * * * *", async () => {
    console.log(
      `[CRON] Running appointment status update at ${new Date().toLocaleString()}...`,
    );
    await updateCompletedAppointments();
  });

  console.log(
    "[✓ SCHEDULER] Appointment status updater initialized successfully",
  );
  console.log("[INFO] Scheduler: Runs every 5 minutes");
  console.log("[INFO] Updates: Appointments 1+ hour after scheduled time");
  console.log("[INFO] Next run: Approximately 5 minutes from server startup");
}

/**
 * Manually trigger appointment status update
 * Useful for testing or if cron job fails
 *
 * Can be called from an API endpoint or admin panel
 *
 * @param {String} option - 'complete-1h' or 'complete-now'
 * @returns {Object} Update result with count
 */

export async function manualUpdateAppointments(option = "complete-1h") {
  try {
    let result;
    const now = new Date();

    if (option === "complete-1h") {
      // Mark as completed 1 hour after appointment ends
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      result = await Appointment.updateMany(
        {
          status: "Upcoming",
          appointmentDate: { $lte: oneHourAgo },
        },
        { status: "Completed" },
      );
    } else if (option === "complete-now") {
      // Mark as completed immediately when appointment time passes
      result = await Appointment.updateMany(
        {
          status: "Upcoming",
          appointmentDate: { $lte: now },
        },
        { status: "Completed" },
      );
    } else {
      throw new Error(
        `Invalid option: ${option}. Use 'complete-1h' or 'complete-now'`,
      );
    }

    console.log(
      `[✓ MANUAL UPDATE] Updated ${result.modifiedCount} appointments using option: ${option}`,
    );

    return {
      success: true,
      option,
      updatedCount: result.modifiedCount,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[✗ ERROR] Manual update failed:", error.message);
    throw error;
  }
}

/**
 * Get real-time status of an appointment
 * Checks if appointment should be marked as completed
 * without updating the database
 *
 * Useful for frontend to show accurate status in real-time
 *
 * @param {String} appointmentId - ID of appointment
 * @returns {Object} Appointment with real-time status info
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

    const now = new Date();

    // Calculate appointment end time
    const endTime = getAppointmentEndTime(
      appointment.appointmentDate,
      appointment.timeSlot,
    );

    // Determine real-time status
    let realtimeStatus = appointment.status;
    if (appointment.status === "Upcoming" && endTime && now >= endTime) {
      realtimeStatus = "Completed";
    }

    return {
      appointment,
      realtimeStatus, // Status based on current time
      dbStatus: appointment.status, // Status in database
      appointmentEnd: endTime,
      currentTime: now,
      hasCompleted: endTime && now >= endTime,
      minutesUntilComplete: endTime
        ? Math.max(0, Math.ceil((endTime - now) / 60000))
        : null,
    };
  } catch (error) {
    console.error("[✗ ERROR] Failed to get realtime status:", error.message);
    throw error;
  }
}
