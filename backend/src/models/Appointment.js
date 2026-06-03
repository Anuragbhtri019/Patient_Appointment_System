import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: [true, "Schedule is required"],
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Slot ID is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    consultationType: {
      type: String,
      required: [true, "Consultation type is required"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    ratedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;

