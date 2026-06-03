import multer from "multer";
import { storage } from "../config/cloudinary.js";

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, and .png formats are allowed!"));
    }
  },
});

