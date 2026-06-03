import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import User from "../models/User.js";

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("You are not logged in. Please log in to get access.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new AppError("The user belonging to this token does no longer exist.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Your token has expired! Please log in again.", 401);
    }
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid token. Please log in again!", 401);
    }
    throw error;
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };
};

