import express from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createDoctorRules,
  updateDoctorRules,
} from "../validators/doctor.validator.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();
router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);

router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  validate(createDoctorRules()),
  doctorController.createDoctor,
);

router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  validate(updateDoctorRules()),
  doctorController.updateDoctor,
);

router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  doctorController.deleteDoctor,
);

export default router;
