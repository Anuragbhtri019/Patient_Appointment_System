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
      enum: ["In-person", "Telehealth"],
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
    //  The rateAppointmentRules() validator validates a 'feedback'
    // field but the model had no such field — it was silently dropped on save.
    // Added here so feedback is persisted and the validator is meaningful.
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, "Feedback must not exceed 1000 characters"],
      default: null,
    },
    //  The cancelAppointmentRules() validator validates a 'reason'
    // field but the model had no such field and the cancel controller never
    // read or saved it. Added here so cancellation reason is persisted.
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason must not exceed 500 characters"],
      default: null,
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ patient: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
