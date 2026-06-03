import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";
import mongoose from "mongoose";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  try {
    await User.deleteMany({});
    await mongoose.disconnect();
  } catch (error) {
    console.error("Cleanup error:", error);
  }
});

describe("Auth Controller", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.user.email).toBe("john@example.com");
      expect(res.body.data.accessToken).toBeDefined();
    });

    it.skip("should reject duplicate email", async () => {
      const email = `jane-${Date.now()}@example.com`;
      await User.create({
        name: "Jane Doe",
        email,
        password: "password123",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email,
        password: "password123",
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe("fail");
    });

    it("should reject short password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "short",
      });

      expect(res.statusCode).toBe(422);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      const email = `john-${Date.now()}@example.com`;
      const user = await User.create({
        name: "John Doe",
        email,
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email,
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.accessToken).toBeDefined();
    });

    it.skip("should reject incorrect password", async () => {
      const email = `johndoe-${Date.now()}@example.com`;
      await User.create({
        name: "John Doe",
        email,
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe("fail");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return authenticated user", async () => {
      const email = `authuser-${Date.now()}@example.com`;
      const user = await User.create({
        name: "John Doe",
        email,
        password: "password123",
      });

      const token = user.generateAccessToken();

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe(email);
    });

    it.skip("should reject without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const email = `logoutuser-${Date.now()}@example.com`;
      const user = await User.create({
        name: "John Doe",
        email,
        password: "password123",
      });

      const token = user.generateAccessToken();

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });
});
