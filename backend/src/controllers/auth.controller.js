import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { cloudinary } from "../config/cloudinary.js";

// helpers

const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload) return null;
    return afterUpload
      .replace(/^v\d+\//, "") // strip version
      .replace(/\.[^/.]+$/, ""); // strip extension
  } catch {
    return null;
  }
};

const safeDestroyCloudinary = async (url) => {
  const publicId = extractPublicId(url);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Cloudinary destroy failed:", err.message);
    }
  }
};

const setCookieAndRespond = (res, user, statusCode = 200) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken };
};

// auth

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findByEmail(email);
  if (userExists)
    throw new AppError("User with this email already exists", 409);

  const user = await User.create({
    name,
    email,
    password,
    role: role || "patient",
  });
  const { accessToken } = setCookieAndRespond(res, user, 201);
  await user.save();

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

  const { accessToken } = setCookieAndRespond(res, user);
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      accessToken,
    },
  });
});

export const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token not found", 401);

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );
  } catch {
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

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ status: "success", data: { accessToken } });
});

export const logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.clearCookie("refreshToken");
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ status: "success", data: { user } });
});

// ── profile management───────────

export const updateProfile = catchAsync(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  // Check email uniqueness if user is changing it
  if (email && email !== req.user.email) {
    const taken = await User.findOne({ email, _id: { $ne: userId } });
    if (taken)
      throw new AppError(
        "This email is already in use by another account",
        409,
      );
  }

  const current = await User.findById(userId);
  if (!current) throw new AppError("User not found", 404);

  let profileImage = current.profileImage;

  if (req.file) {
    // Delete the old profile image from Cloudinary before replacing
    if (profileImage) await safeDestroyCloudinary(profileImage);
    profileImage = req.file.path;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      ...(name && { name }),
      ...(email && { email }),
      profileImage,
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: { user: updatedUser },
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Must select +password because it is excluded by default
  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new AppError("Current password is incorrect", 401);

  user.password = newPassword;
  await user.save(); // triggers the bcrypt pre-save hook

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

export const deleteProfileImage = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);

  if (!user.profileImage) {
    throw new AppError("No profile image to delete", 400);
  }

  await safeDestroyCloudinary(user.profileImage);

  user.profileImage = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Profile image removed",
    data: { user },
  });
});
