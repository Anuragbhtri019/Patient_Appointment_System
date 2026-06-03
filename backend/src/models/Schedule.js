import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    time: {
      type: String,
      required: [true, "Time slot is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, "Invalid time format. Use HH:MM AM/PM"],
    },
    consultationType: {
      type: String,
      enum: ["In-person", "Telehealth"],
      required: [true, "Consultation type is required"],
    },
    status: {
      type: String,
      enum: ["Available", "Booked"],
      default: "Available",
    },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    availableDate: {
      type: Date,
      required: [true, "Date is required"],
    },
    timeSlots: [timeSlotSchema],
  },
  { timestamps: true }
);

scheduleSchema.index({ doctor: 1, availableDate: 1 }, { unique: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;

