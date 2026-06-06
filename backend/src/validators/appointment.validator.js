import { body } from "express-validator";

export const bookAppointmentRules = () => [
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isMongoId()
    .withMessage("Invalid doctor ID"),
  body("scheduleId")
    .notEmpty()
    .withMessage("Schedule ID is required")
    .isMongoId()
    .withMessage("Invalid schedule ID"),
  body("slotId")
    .notEmpty()
    .withMessage("Slot ID is required")
    .isMongoId()
    .withMessage("Invalid slot ID"),
  body("consultationType")
    .notEmpty()
    .withMessage("Consultation type is required")
    .isIn(["In-person", "Telehealth"])
    .withMessage(
      'Consultation type must be either "In-person" or "Telehealth"',
    ),
];

export const cancelAppointmentRules = () => [
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Cancellation reason must not exceed 500 characters"),
];

export const rateAppointmentRules = () => [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("feedback")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Feedback must not exceed 1000 characters"),
];
