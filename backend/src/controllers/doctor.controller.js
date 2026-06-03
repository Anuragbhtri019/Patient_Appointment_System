import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import Schedule from "../models/Schedule.js";
import { catchAsync } from "../utils/catchAsync.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import { cloudinary } from "../config/cloudinary.js";

export const getAllDoctors = catchAsync(async (req, res) => {
  const features = new APIFeatures(Doctor.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doctors = await features.query;
  res.status(200).json({
    status: "success",
    results: doctors.length,
    data: { doctors },
  });
});

export const getDoctorById = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("schedules");
  if (!doctor || !doctor.isActive) {
    throw new AppError("Doctor not found", 404);
  }
  res.status(200).json({
    status: "success",
    data: { doctor },
  });
});

export const createDoctor = catchAsync(async (req, res) => {
  const { name, specialization, email, hospitalBranch, branch } = req.body;
  let imageUrl = null;
  if (req.file) {
    imageUrl = req.file.path;
  }
  const doctor = await Doctor.create({
    name,
    specialization,
    email,
    hospitalBranch: hospitalBranch || branch,
    imageUrl,
    createdBy: req.user._id,
  });
  res.status(201).json({
    status: "success",
    data: { doctor },
  });
});

export const updateDoctor = catchAsync(async (req, res) => {
  const { name, specialization, email, hospitalBranch, branch } = req.body;
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  let imageUrl = doctor.imageUrl;
  if (req.file) {
    if (imageUrl) {
      const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    imageUrl = req.file.path;
  }
  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    {
      name: name || doctor.name,
      specialization: specialization || doctor.specialization,
      email: email || doctor.email,
      hospitalBranch: hospitalBranch || branch || doctor.hospitalBranch,
      imageUrl,
    },
    { new: true, runValidators: true },
  );
  res.status(200).json({
    status: "success",
    data: { doctor: updatedDoctor },
  });
});

export const deleteDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  await Doctor.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    message: "Doctor deleted successfully",
    data: null,
  });
});
