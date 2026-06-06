import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide doctor name"],
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // sparse allows multiple documents with null/missing email
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    specialization: {
      type: String,
      enum: [
        "Cardiology",
        "Dermatology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Psychiatry",
        "Pulmonology",
        "Rheumatology",
        "Gastroenterology",
        "Urology",
        "General Medicine",
        "ENT",
        "General Practice",
        "Gynecology",
        "Oncology",
      ],
      required: [true, "Please provide specialization"],
    },
    hospitalBranch: {
      type: String,
      required: [true, "Please provide hospital branch"],
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

doctorSchema.virtual("schedules", {
  ref: "Schedule",
  localField: "_id",
  foreignField: "doctor",
});

doctorSchema.virtual("fullInfo").get(function () {
  return `${this.name} - ${this.specialization} at ${this.hospitalBranch}`;
});

doctorSchema.index({ specialization: 1, hospitalBranch: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
