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
    role: "patient",
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

  res.cookie("refreshToken", newRefreshToken, {
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

//  profile management

export const updateProfile = catchAsync(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  //  Check email uniqueness with better validation
  if (email && email !== req.user.email) {
    // Normalize email for comparison
    const emailLower = email.toLowerCase().trim();
    const currentEmailLower = req.user.email.toLowerCase().trim();

    // Check if user is actually changing email
    if (emailLower !== currentEmailLower) {
      // Check if email already exists
      const taken = await User.findOne({
        email: emailLower,
        _id: { $ne: userId },
      });

      if (taken) {
        throw new AppError(
          "This email is already in use by another account. Please choose a different email.",
          409,
        );
      }
    }
  }

  const current = await User.findById(userId);
  if (!current) throw new AppError("User not found", 404);

  let profileImage = current.profileImage;

  if (req.file) {
    // Delete the old profile image from Cloudinary before replacing
    if (profileImage) await safeDestroyCloudinary(profileImage);
    profileImage = req.file.path;
  }

  //  Normalize and validate all inputs
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      profileImage,
    },
    { new: true, runValidators: true },
  );

  //  Log email changes for audit trail
  if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
    console.log(
      `[SECURITY AUDIT] User ${userId} changed email from ${req.user.email} to ${email.toLowerCase()}`,
    );

    //For audit log to be used during the production

    // await AuditLog.create({
    //    userId,
    //  action: "EMAIL_CHANGE",
    //   oldValue: req.user.email,
    //    newValue: email.toLowerCase(),
    //   timestamp: new Date(),
    // });
  }

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

  //  Log password changes
  console.log(`[SECURITY AUDIT] User ${req.user._id} changed their password`);

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

export const deleteProfileImage = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "_id name email role profileImage",
  );
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

export const checkEmailAvailability = catchAsync(async (req, res) => {
  const { email } = req.body;

  // Validate email format
  if (!email) {
    throw new AppError("Please provide an email address", 400);
  }

  // Simple email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Please provide a valid email format", 400);
  }

  // Normalize email for checking
  const emailLower = email.toLowerCase().trim();

  // Check if current user (if authenticated) already has this email
  if (req.user && emailLower === req.user.email.toLowerCase()) {
    // Email is same as current user's email - it's "available" (no change)
    return res.status(200).json({
      status: "success",
      data: {
        available: true,
        email: emailLower,
        message: "This is your current email address",
      },
    });
  }

  // Check if email exists for another user
  const existingUser = await User.findOne({
    email: emailLower,
    ...(req.user && { _id: { $ne: req.user._id } }), // Exclude current user if authenticated
  });

  res.status(200).json({
    status: "success",
    data: {
      available: !existingUser,
      email: emailLower,
      ...(existingUser && {
        message: "This email is already in use by another account",
      }),
    },
  });
});

/*
Request email change with verification
 * 
 * For production systems, consider requiring email verification:
 * 1. User requests email change
 * 2. Verification email sent to NEW email address
 * 3. User clicks verification link
 * 4. Email is updated only after verification
 * 
/*
export const requestEmailChange = catchAsync(async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user._id;
 
  // Validate new email format
  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    throw new AppError("Please provide a valid email", 400);
  }
 
  // Check if email already exists
  const taken = await User.findOne({
    email: newEmail.toLowerCase(),
    _id: { $ne: userId }
  });
 
  if (taken) {
    throw new AppError(
      "This email is already in use by another account",
      409,
    );
  }
 
  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
 
  const verificationExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
 
  // Save pending email change
  await User.findByIdAndUpdate(userId, {
    pendingEmail: newEmail.toLowerCase(),
    emailVerificationToken: verificationTokenHash,
    emailVerificationExpires: verificationExpires,
  });
 
  //  Send verification email to new address
  // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  // await sendEmail({...});
 
  res.status(200).json({
    status: "success",
    message: "Verification email sent to your new email address. Please verify within 30 minutes.",
  });
});
 
export const verifyEmailChange = catchAsync(async (req, res) => {
  const { token } = req.params;
  const userId = req.user._id;
 
  // Hash token
  const verificationTokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
 
  // Find user with valid token
  const user = await User.findOne({
    _id: userId,
    emailVerificationToken: verificationTokenHash,
    emailVerificationExpires: { $gt: Date.now() },
  });
 
  if (!user) {
    throw new AppError(
      "Email verification token is invalid or has expired",
      400,
    );
  }
 
  // Update email and clear verification fields
  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
 
  await user.save();
 
  res.status(200).json({
    status: "success",
    message: "Email successfully verified and updated",
    data: { user },
  });
});
*/
