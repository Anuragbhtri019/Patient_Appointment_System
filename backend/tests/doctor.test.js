import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Doctor from "../src/models/Doctor.js";
import { connectDB } from "../src/config/db.js";
import mongoose from "mongoose";

let adminToken;
let adminUser;

beforeAll(async () => {
  await connectDB();

  adminUser = await User.create({
    name: "Admin User",
    email: `admin-doctor-${Date.now()}@example.com`,
    password: "password123",
    role: "admin",
  });
  adminToken = adminUser.generateAccessToken();
});

afterAll(async () => {
  try {
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await mongoose.disconnect();
  } catch (error) {
    console.error("Cleanup error:", error);
  }
});

afterEach(async () => {
  await Doctor.deleteMany({});
});

describe("Doctor Controller", () => {
  describe("GET /api/doctors", () => {
    it("should return all active doctors", async () => {
      await Doctor.create({
        name: "Dr. Smith",
        specialization: "Cardiology",
        hospitalBranch: "Main Branch",
        isActive: true,
        createdBy: adminUser._id,
      });

      await Doctor.create({
        name: "Dr. Johnson",
        specialization: "Dermatology",
        hospitalBranch: "Main Branch",
        isActive: true,
        createdBy: adminUser._id,
      });

      const res = await request(app).get("/api/doctors");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.results).toBe(2);
    });

    it("should filter doctors by specialization", async () => {
      await Doctor.create({
        name: "Dr. Smith",
        specialization: "Cardiology",
        hospitalBranch: "Main Branch",
        isActive: true,
        createdBy: adminUser._id,
      });

      await Doctor.create({
        name: "Dr. Johnson",
        specialization: "Dermatology",
        hospitalBranch: "Main Branch",
        isActive: true,
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .get("/api/doctors")
        .query({ specialization: "Cardiology" });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(1);
      expect(res.body.data.doctors[0].specialization).toBe("Cardiology");
    });

    it("should filter doctors by hospital branch", async () => {
      await Doctor.create({
        name: "Dr. Smith",
        specialization: "Cardiology",
        hospitalBranch: "Main Branch",
        isActive: true,
        createdBy: adminUser._id,
      });

      await Doctor.create({
        name: "Dr. Johnson",
        specialization: "Dermatology",
        hospitalBranch: "Downtown Branch",
        isActive: true,
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .get("/api/doctors")
        .query({ hospitalBranch: "Main Branch" });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(1);
    });

    it("should paginate doctors", async () => {
      for (let i = 0; i < 15; i++) {
        await Doctor.create({
          name: `Dr. Doctor${i}`,
          specialization: "Cardiology",
          hospitalBranch: "Main Branch",
          isActive: true,
          createdBy: adminUser._id,
        });
      }

      const res = await request(app)
        .get("/api/doctors")
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(10);
    });
  });

  describe("POST /api/doctors", () => {
    it("should create doctor with valid data", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dr. Smith",
          specialization: "Cardiology",
          hospitalBranch: "Main Branch",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.doctor.name).toBe("Dr. Smith");
    });

    it("should reject invalid specialization", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dr. Smith",
          specialization: "InvalidSpecialization",
          hospitalBranch: "Main Branch",
        });

      expect(res.statusCode).toBe(422);
    });

    it.skip("should reject non-admin user", async () => {
      const email = `patient-${Date.now()}@example.com`;
      const patient = await User.create({
        name: "Patient",
        email,
        password: "password123",
        role: "patient",
      });
      const patientToken = patient.generateAccessToken();

      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          name: "Dr. Smith",
          specialization: "Cardiology",
          hospitalBranch: "Main Branch",
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("PATCH /api/doctors/:id", () => {
    it("should update doctor successfully", async () => {
      const doctor = await Doctor.create({
        name: "Dr. Smith",
        specialization: "Cardiology",
        hospitalBranch: "Main Branch",
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .patch(`/api/doctors/${doctor._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          hospitalBranch: "Downtown Branch",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.doctor.hospitalBranch).toBe("Downtown Branch");
    });
  });

  describe("DELETE /api/doctors/:id", () => {
    it("should soft delete doctor", async () => {
      const doctor = await Doctor.create({
        name: "Dr. Smith",
        specialization: "Cardiology",
        hospitalBranch: "Main Branch",
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .delete(`/api/doctors/${doctor._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      const deletedDoctor = await Doctor.findById(doctor._id);
      expect(deletedDoctor).toBeNull();
    });
  });
});
