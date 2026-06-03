import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Doctor from "../src/models/Doctor.js";
import Schedule from "../src/models/Schedule.js";
import Appointment from "../src/models/Appointment.js";
import { connectDB } from "../src/config/db.js";
import mongoose from "mongoose";

let patientToken;
let patientId;
let adminToken;
let doctorId;
let scheduleId;
let slotId;

beforeAll(async () => {
  await connectDB();

  const patient = await User.create({
    name: "Patient User",
    email: `patient-appt-${Date.now()}@example.com`,
    password: "password123",
    role: "patient",
  });
  patientToken = patient.generateAccessToken();
  patientId = patient._id;

  const admin = await User.create({
    name: "Admin User",
    email: `admin-appt-${Date.now()}@example.com`,
    password: "password123",
    role: "admin",
  });
  adminToken = admin.generateAccessToken();

  const doctor = await Doctor.create({
    name: "Dr. Smith",
    specialization: "Cardiology",
    hospitalBranch: "Main Branch",
    createdBy: admin._id,
  });
  doctorId = doctor._id;

  const schedule = await Schedule.create({
    doctor: doctorId,
    availableDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    timeSlots: [
      {
        time: "09:00 AM",
        consultationType: "In-person",
        status: "Available",
      },
      {
        time: "10:00 AM",
        consultationType: "Telehealth",
        status: "Available",
      },
    ],
  });
  scheduleId = schedule._id;
  slotId = schedule.timeSlots[0]._id;
});

afterAll(async () => {
  try {
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Schedule.deleteMany({});
    await Appointment.deleteMany({});
    await mongoose.disconnect();
  } catch (error) {
    console.error("Cleanup error:", error);
  }
});

afterEach(async () => {
  await Appointment.deleteMany({});
  await Schedule.deleteMany({});
});

describe("Appointment Controller", () => {
  describe("POST /api/appointments", () => {
    it.skip("should book appointment successfully", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          scheduleId,
          slotId,
          consultationType: "In-person",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.appointment.status).toBe("Upcoming");
    });

    it.skip("should enforce 2-appointment limit", async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const futureDate2 = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const futureDate3 = new Date(Date.now() + 72 * 60 * 60 * 1000);

      const schedule1 = await Schedule.create({
        doctor: doctorId,
        availableDate: futureDate1,
        timeSlots: [
          {
            time: "09:00 AM",
            consultationType: "In-person",
            status: "Available",
          },
        ],
      });

      const schedule2 = await Schedule.create({
        doctor: doctorId,
        availableDate: futureDate2,
        timeSlots: [
          {
            time: "09:00 AM",
            consultationType: "In-person",
            status: "Available",
          },
        ],
      });

      const schedule3 = await Schedule.create({
        doctor: doctorId,
        availableDate: futureDate3,
        timeSlots: [
          {
            time: "09:00 AM",
            consultationType: "In-person",
            status: "Available",
          },
        ],
      });

      await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          scheduleId: schedule1._id,
          slotId: schedule1.timeSlots[0]._id,
          consultationType: "In-person",
        });

      await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          scheduleId: schedule2._id,
          slotId: schedule2.timeSlots[0]._id,
          consultationType: "In-person",
        });

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          scheduleId: schedule3._id,
          slotId: schedule3.timeSlots[0]._id,
          consultationType: "In-person",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "You cannot hold more than 2 active appointments",
      );
    });
  });

  describe("PATCH /api/appointments/:id/cancel", () => {
    it.skip("should cancel appointment successfully", async () => {
      const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        schedule: scheduleId,
        slotId,
        timeSlot: "09:00 AM",
        consultationType: "In-person",
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "Upcoming",
      });

      const res = await request(app)
        .patch(`/api/appointments/${appointment._id}/cancel`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });

  describe("GET /api/appointments/my-appointments", () => {
    it("should return patient appointments", async () => {
      const patient = await User.create({
        name: "Another Patient",
        email: `patient2-${Date.now()}@example.com`,
        password: "password123",
      });

      await Appointment.create({
        patient: patient._id,
        doctor: doctorId,
        schedule: scheduleId,
        slotId,
        timeSlot: "09:00 AM",
        consultationType: "In-person",
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "Upcoming",
      });

      const token = patient.generateAccessToken();
      const res = await request(app)
        .get("/api/appointments/my-appointments")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.upcoming.length).toBe(1);
    });
  });
});
