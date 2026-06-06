import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for doctor images  →  folder: "doctors"
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doctors",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
    public_id: (req, file) => {
      const timestamp = Date.now();
      const name = file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/\s+/g, "_");
      return `${timestamp}-${name}`;
    },
  },
});

// Storage for user profile images  →  folder: "profiles"
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user?._id || "unknown";
      return `${userId}-${timestamp}`;
    },
  },
});

export { cloudinary, storage, profileStorage };
