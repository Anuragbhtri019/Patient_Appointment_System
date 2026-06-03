import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import { registerRules } from "../validators/auth.validator.js";
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { loginRules } from "../validators/auth.validator.js";

const router = express.Router();
router.post("/register", validate(registerRules()), authController.register);
router.post("/login", validate(loginRules()), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

export default router;
