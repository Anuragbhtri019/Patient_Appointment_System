import v2 from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const cloudinary = v2.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doctors",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "auto",
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export { cloudinary, storage };
