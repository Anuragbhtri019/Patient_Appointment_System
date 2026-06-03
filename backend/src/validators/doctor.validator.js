import { body } from "express-validator";

const specializations = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Rheumatology",
  "Gastroenterology",
  "Urology",
  "General Medicine",
  "ENT",
  "General Practice",
  "Gynecology",
  "Oncology",
];

export const createDoctorRules = () => [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Doctor's name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Doctor's name must be at least 2 characters long"),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Doctor's specialization is required")
    .isIn(specializations)
    .withMessage(
      `Please select a valid specialization from : ${specializations.join(", ")}`,
    ),
  body("hospitalBranch")
    .trim()
    .custom((value, { req }) => {
      if (value || req.body.branch) {
        return true;
      }
      throw new Error("Doctor's hospital branch is required");
    }),
];

export const updateDoctorRules = () => [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Doctor's name must be at least 2 characters long"),
  body("specialization")
    .optional()
    .trim()
    .isIn(specializations)
    .withMessage(
      `Please select a valid specialization from : ${specializations.join(", ")}`,
    ),
  body("hospitalBranch")
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (value || req.body.branch) {
        return true;
      }
      throw new Error("Doctor's hospital branch cannot be empty");
    }),
];
