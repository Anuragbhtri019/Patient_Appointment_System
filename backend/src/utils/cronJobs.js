import cron from "node-cron";

import Appointment from "../models/Appointment.js";
import { initializeAppointmentScheduler } from "../service/appointmentService.js";

export const startCronJobs = () => {
  console.log("[CRON] Starting cron jobs...");

  initializeAppointmentScheduler();

  console.log("[CRON] Cron jobs initialized successfully");
};
