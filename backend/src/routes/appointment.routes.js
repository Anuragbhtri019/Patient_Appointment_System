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

router.get(
  "/",
  protect,
  restrictTo("admin"),
  appointmentController.getAllAppointments
);

router.get(
  "/my-appointments",
  protect,
  appointmentController.getMyAppointments
);

router.post(
  "/",
  protect,
  checkAppointmentLimit,
  validate(bookAppointmentRules()),
  appointmentController.bookAppointment
);

router.patch(
  "/:id/cancel",
  protect,
  validate(cancelAppointmentRules()),
  appointmentController.cancelAppointment
);

router.get("/:id", protect, appointmentController.getAppointmentById);

export default router;

