import cron from "node-cron";

import Appointment from "../models/Appointment.js";
export const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const result = await Appointment.updateMany(
        {
          status: "Upcoming",
          appointmentDate: { $lt: now },
        },
        { status: "completed" },
      );
      if (result.modifiedCount > 0) {
        console.log(`${result.modifiedCount} appointments auto-completed.`);
      }
    } catch (error) {
      console.error("Error in appointment completion:", error);
    }
  });
  console.log("Cron job for auto-completing appointments started.");
};
