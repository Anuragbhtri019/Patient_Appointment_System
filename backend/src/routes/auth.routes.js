import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
} from "../validators/auth.validator.js";
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/register", validate(registerRules()), authController.register);

router.post("/login", validate(loginRules()), authController.login);

router.post("/refresh", authController.refresh);

router.post("/logout", protect, authController.logout);

router.get("/me", protect, authController.getMe);

router.patch(
  "/profile",
  protect,
  upload.single("profileImage"),
  validate(updateProfileRules()),
  authController.updateProfile,
);

router.patch(
  "/change-password",
  protect,
  validate(changePasswordRules()),
  authController.changePassword,
);

router.delete("/profile-image", protect, authController.deleteProfileImage);

export default router;
