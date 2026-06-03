import express from "express";
import * as ratingController from "../controllers/rating.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { rateAppointmentRules } from "../validators/appointment.validator.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/:appointmentId/rate",
  protect,
  validate(rateAppointmentRules()),
  ratingController.rateAppointment
);

export default router;

