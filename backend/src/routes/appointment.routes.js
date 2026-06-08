import express from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  bookAppointmentRules,
  cancelAppointmentRules,
} from "../validators/appointment.validator.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { checkAppointmentLimit } from "../middleware/appointmentLimit.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("patient"), // ← ADDED: Only patients can book
  checkAppointmentLimit,
  validate(bookAppointmentRules()),
  appointmentController.bookAppointment,
);

router.get(
  "/my-appointments",
  protect,
  appointmentController.getMyAppointments,
);

router.get(
  "/grouped-by-status",
  protect,
  appointmentController.getAppointmentsGroupedByStatus,
);

router.patch(
  "/:id/cancel",
  protect,
  validate(cancelAppointmentRules()),
  appointmentController.cancelAppointment,
);

router.get(
  "/:id/check-status",
  protect,
  appointmentController.checkAppointmentStatus,
);

router.get("/:id", protect, appointmentController.getAppointmentById);

router.get(
  "/",
  protect,
  restrictTo("admin"), // Only admins can see all appointments
  appointmentController.getAllAppointments,
);

router.post(
  "/update-statuses",
  protect,
  restrictTo("admin"), // Only admins can trigger manual updates
  appointmentController.updateAppointmentStatuses,
);

router.post(
  "/check-statuses",
  protect,
  restrictTo("admin"), // Only admins can do bulk checks
  appointmentController.checkMultipleAppointmentStatuses,
);
export default router;
