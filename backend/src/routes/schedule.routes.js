import express from "express";
import * as scheduleController from "../controllers/schedule.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/doctor/:doctorId", scheduleController.getSchedulesByDoctor);

router.post("/", protect, restrictTo("admin"), scheduleController.createSchedule);

router.patch("/:id", protect, restrictTo("admin"), scheduleController.updateSchedule);

router.delete("/:id", protect, restrictTo("admin"), scheduleController.deleteSchedule);

export default router;

