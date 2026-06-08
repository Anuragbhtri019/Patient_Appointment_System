import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const { default: app } = await import("./app.js");
    const { connectDB } = await import("./config/db.js");
    const { startCronJobs } = await import("./utils/cronJobs.js");

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
