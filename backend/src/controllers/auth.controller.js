import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findByEmail(email);
  if (userExists) {
    throw new AppError("User with this email already exists", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "patient",
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
  });
});

export const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: { accessToken },
  });
});

export const logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
