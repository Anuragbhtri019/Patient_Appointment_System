import multer from "multer";
import { storage, profileStorage } from "../config/cloudinary.js";


const FILE_FILTER = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png formats are allowed!"));
  }
};

// Used on doctor routes
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: FILE_FILTER,
});

// Used on profile routes
export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: FILE_FILTER,
});
