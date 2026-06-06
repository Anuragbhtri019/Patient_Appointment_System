import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";
import Schedule from "../models/Schedule.js";
import { catchAsync } from "../utils/catchAsync.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import { cloudinary } from "../config/cloudinary.js";

export const getAllDoctors = catchAsync(async (req, res) => {
  const { consultationType, ...otherFilters } = req.query;
  if (consultationType) {
    const doctors = await Doctor.aggregate([
      {
        $lookup: {
          from: "schedules",
          localField: "_id",
          foreignField: "doctor",
          as: "schedules",
        },
      },
      {
        $addFields: {
          hasAvailableSlot: {
            $anyElementTrue: {
              $map: {
                input: "$schedules",
                as: "schedule",
                in: {
                  $anyElementTrue: {
                    $map: {
                      input: "$$schedule.timeSlots",
                      as: "slot",
                      in: {
                        $and: [
                          {
                            $eq: ["$$slot.consultationType", consultationType],
                          },
                          { $eq: ["$$slot.status", "Available"] },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $match: { hasAvailableSlot: true } },
      { $project: { schedules: 0, hasAvailableSlot: 0 } },
      { $sort: { createdAt: -1 } },
      { $skip: ((req.query.page || 1) - 1) * (req.query.limit || 10) },
      { $limit: parseInt(req.query.limit) || 10 },
    ]);

    return res.status(200).json({
      status: "success",
      results: doctors.length,
      data: { doctors },
    });
  }

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
  res.status(200).json({ status: "success", data: { doctor } });
});

export const createDoctor = catchAsync(async (req, res) => {
  const { name, specialization, email, hospitalBranch, branch } = req.body;

  let imageUrl = null;
  if (req.file) {
    // multer-storage-cloudinary puts the secure URL on req.file.path
    imageUrl = req.file.path;
  }

  const doctor = await Doctor.create({
    name,
    specialization,
    email,
    hospitalBranch,
    imageUrl,
    createdBy: req.user._id,
  });

  res.status(201).json({ status: "success", data: { doctor } });
});

export const updateDoctor = catchAsync(async (req, res) => {
  const { name, specialization, email, hospitalBranch } = req.body;

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  let imageUrl = doctor.imageUrl;

  if (req.file) {
    // Delete old image from Cloudinary before replacing it
    if (imageUrl) {
      try {
        const afterUpload = imageUrl.split("/upload/")[1];
        if (afterUpload) {
          const publicId = afterUpload
            .replace(/^v\d+\//, "")
            .replace(/\.[^/.]+$/, "");
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error("Failed to delete old Cloudinary image:", err.message);
      }
    }
    imageUrl = req.file.path;
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    {
      name: name || doctor.name,
      specialization: specialization || doctor.specialization,
      email: email || doctor.email,
      hospitalBranch: hospitalBranch || doctor.hospitalBranch,
      imageUrl,
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({ status: "success", data: { doctor: updatedDoctor } });
});

export const deleteDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  // Clean up image from Cloudinary when doctor is deleted
  if (doctor.imageUrl) {
    try {
      const afterUpload = doctor.imageUrl.split("/upload/")[1];
      if (afterUpload) {
        const publicId = afterUpload
          .replace(/^v\d+\//, "")
          .replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error(
        "Failed to delete Cloudinary image on doctor delete:",
        err.message,
      );
    }
  }

  await Doctor.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Doctor deleted successfully",
    data: null,
  });
});
