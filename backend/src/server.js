import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startCronJobs } from "./utils/cronJobs.js";

dotenv.config();

const PORT =
  process.env.PORT || "https://patient-appointment-system-1.onrender.com/";

const startServer = async () => {
  try {
    await connectDB();
    startCronJobs();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();
