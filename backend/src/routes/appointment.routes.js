import express from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  bookAppointmentRules,
  cancelAppointmentRules,
} from "../validators/appointment.validator.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { checkAppointmentLimit } from "../middleware/appointmentLimit.middleware.js";

import {
  updateAppointmentStatuses,
  checkAppointmentStatus,
  checkMultipleAppointmentStatuses,
  getAppointmentsGroupedByStatus,
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  restrictTo("admin"),
  appointmentController.getAllAppointments,
);

router.get(
  "/my-appointments",
  protect,
  appointmentController.getMyAppointments,
);

router.post(
  "/",
  protect,
  checkAppointmentLimit,
  validate(bookAppointmentRules()),
  appointmentController.bookAppointment,
);

router.patch(
  "/:id/cancel",
  protect,
  validate(cancelAppointmentRules()),
  appointmentController.cancelAppointment,
);

router.post("/", protect, appointmentController.bookAppointment);
router.get("/", protect, appointmentController.getMyAppointments);
router.get("/all", protect, appointmentController.getAllAppointments);
router.get("/:id", protect, appointmentController.getAppointmentById);
router.patch("/:id/cancel", protect, appointmentController.cancelAppointment);
router.get("/:id", protect, appointmentController.getAppointmentById);
router.post("/update-statuses", protect, updateAppointmentStatuses);
router.get("/:id/check-status", protect, checkAppointmentStatus);
router.post("/check-statuses", protect, checkMultipleAppointmentStatuses);
router.get("/grouped-by-status", protect, getAppointmentsGroupedByStatus);

export default router;
