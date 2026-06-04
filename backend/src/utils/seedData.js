import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Schedule from "../models/Schedule.js";
import Appointment from "../models/Appointment.js";

dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Clear collections
const clearCollections = async () => {
  try {
    console.log("\n  Clearing existing data...");
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Schedule.deleteMany({});
    await Appointment.deleteMany({});
    console.log(" Collections cleared");
  } catch (error) {
    console.error(" Error clearing collections:", error.message);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    console.log("\n Creating admin user...");
    const admin = new User({
      name: "System Administrator",
      email: "admin@example.com",
      password: "Admin@12345",
      role: "admin",
    });
    await admin.save();
    console.log(" Admin user created");
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: Admin@12345`);
    return admin._id;
  } catch (error) {
    console.error(" Error creating admin:", error.message);
    process.exit(1);
  }
};

// Create patient users
const createPatients = async () => {
  try {
    console.log("\n👥 Creating patient users...");
    const patients = [];

    for (let i = 1; i <= 3; i++) {
      const patient = new User({
        name: faker.person.fullName(),
        email: `patient${i}@example.com`,
        password: "Patient@12345",
        role: "patient",
      });
      await patient.save();
      patients.push(patient);
      console.log(`   Patient ${i} created - Email: patient${i}@example.com`);
    }

    console.log(` Total patients created: ${patients.length}`);
    return patients;
  } catch (error) {
    console.error(" Error creating patients:", error.message);
    process.exit(1);
  }
};

// Create doctors
const createDoctors = async (adminId) => {
  try {
    console.log("\n  Creating doctor profiles...");

    const specializations = [
      "Cardiology",
      "Dermatology",
      "Neurology",
      "Orthopedics",
      "Pediatrics",
    ];

    const hospitalBranches = [
      "Downtown Medical Center",
      "Uptown Health Plaza",
      "Westside Hospital",
      "Eastridge Medical Complex",
      "Central Health Hub",
    ];

    const doctors = [];

    for (let i = 0; i < 5; i++) {
      const doctor = new Doctor({
        name: faker.person.fullName(),
        specialization: specializations[i],
        hospitalBranch: hospitalBranches[i],
        imageUrl: null,
        averageRating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
        totalRatings: faker.number.int({ min: 5, max: 50 }),
        isActive: true,
        createdBy: adminId,
      });
      await doctor.save();
      doctors.push(doctor);
      console.log(
        `    Doctor ${i + 1}: ${doctor.name} - ${doctor.specialization}`,
      );
    }

    console.log(` Total doctors created: ${doctors.length}`);
    return doctors;
  } catch (error) {
    console.error(" Error creating doctors:", error.message);
    process.exit(1);
  }
};

// Create schedules with unique dates per doctor
const createSchedules = async (doctors) => {
  try {
    console.log("\n Creating schedules with time slots...");

    const consultationTypes = ["In-person", "Telehealth"];
    const timeSlots = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
    ];

    const schedules = [];
    let slotCount = 0;

    // Create 2 schedules per doctor (10 total) with unique dates
    for (const doctor of doctors) {
      const usedDates = new Set(); // Track used dates for this doctor

      for (let i = 0; i < 2; i++) {
        let scheduleDate;
        let attempts = 0;

        // Keep generating dates until we get a unique one
        do {
          scheduleDate = new Date();
          scheduleDate.setDate(
            scheduleDate.getDate() + faker.number.int({ min: 1, max: 30 }),
          );
          scheduleDate.setHours(0, 0, 0, 0);
          attempts++;

          // Safety check to prevent infinite loop
          if (attempts > 100) {
            console.warn(
              `     Could not find unique date for doctor after 100 attempts`,
            );
            break;
          }
        } while (usedDates.has(scheduleDate.getTime()));

        usedDates.add(scheduleDate.getTime());

        // Create time slots for this schedule
        const slots = timeSlots
          .slice(0, faker.number.int({ min: 5, max: 10 }))
          .map((time) => ({
            time,
            consultationType: faker.helpers.arrayElement(consultationTypes),
            status: "Available",
          }));

        const schedule = new Schedule({
          doctor: doctor._id,
          availableDate: scheduleDate,
          timeSlots: slots,
        });

        await schedule.save();
        schedules.push(schedule);
        slotCount += slots.length;

        console.log(
          `     Schedule for ${doctor.name} on ${scheduleDate.toDateString()} - ${slots.length} slots`,
        );
      }
    }

    console.log(` Total schedules created: ${schedules.length}`);
    console.log(` Total time slots created: ${slotCount}`);
    return schedules;
  } catch (error) {
    console.error(" Error creating schedules:", error.message);
    process.exit(1);
  }
};

// Create appointments
const createAppointments = async (patients, schedules) => {
  try {
    console.log("\n Creating appointments...");

    const statuses = ["Upcoming", "Completed", "Cancelled"];
    const appointments = [];

    // Limit to 8 appointments or less if not enough schedules
    const appointmentCount = Math.min(8, schedules.length);

    for (let i = 0; i < appointmentCount; i++) {
      const patient = faker.helpers.arrayElement(patients);
      const schedule = schedules[i]; // Use schedules in order to avoid duplicates

      // Ensure schedule has time slots
      if (!schedule.timeSlots || schedule.timeSlots.length === 0) {
        console.log(
          `    Schedule ${i + 1} has no time slots, skipping appointment`,
        );
        continue;
      }

      const slot = schedule.timeSlots[0]; // Use first slot
      const status = faker.helpers.arrayElement(statuses);

      const appointment = new Appointment({
        patient: patient._id,
        doctor: schedule.doctor,
        schedule: schedule._id,
        slotId: slot._id,
        timeSlot: slot.time,
        consultationType: slot.consultationType,
        appointmentDate: schedule.availableDate,
        status,
        rating:
          status === "Completed" ? faker.number.int({ min: 3, max: 5 }) : null,
        ratedAt: status === "Completed" ? new Date() : null,
      });

      // Update slot status to Booked
      schedule.timeSlots = schedule.timeSlots.map((s) => {
        if (s._id.equals(slot._id)) {
          return { ...s.toObject(), status: "Booked" };
        }
        return s;
      });
      await schedule.save();

      await appointment.save();
      appointments.push(appointment);

      console.log(
        `     Appointment ${i + 1}: ${patient.name} with Dr. on ${schedule.availableDate.toDateString()}`,
      );
    }

    console.log(` Total appointments created: ${appointments.length}`);
    return appointments;
  } catch (error) {
    console.error(" Error creating appointments:", error.message);
    process.exit(1);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║          Patient Appointment System - Database Seeding   ║");
    console.log("╚════════════════════════════════════════════════════════╝");

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearCollections();

    // Create data
    const adminId = await createAdmin();
    const patients = await createPatients();
    const doctors = await createDoctors(adminId);
    const schedules = await createSchedules(doctors);
    const appointments = await createAppointments(patients, schedules);

    // Summary
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║                   Seeding Complete!                 ║");
    console.log("╚════════════════════════════════════════════════════════╝");

    console.log("\n Summary:");
    console.log(`   • Admin Users: 1`);
    console.log(`   • Patient Users: ${patients.length}`);
    console.log(`   • Doctors: ${doctors.length}`);
    console.log(`   • Schedules: ${schedules.length}`);
    console.log(`   • Appointments: ${appointments.length}`);

    console.log("\n Test Credentials:");
    console.log("   Admin Account:");
    console.log("   └─ Email: admin@example.com");
    console.log("   └─ Password: Admin@12345");
    console.log("\n   Patient Accounts:");
    console.log("   ├─ Email: patient1@example.com");
    console.log("   ├─ Email: patient2@example.com");
    console.log("   ├─ Email: patient3@example.com");
    console.log("   └─ Password: Patient@12345 (for all)");

    console.log("\n Next Steps:");
    console.log("   1. Start the backend server: npm run dev");
    console.log("   2. Start the frontend: cd frontend && npm run dev");
    console.log("   3. Visit http://localhost:5173");
    console.log("   4. Login with test credentials above");
    console.log("   5. View API docs at http://localhost:5000/api/docs");

    console.log("\n Important:");
    console.log("   • This seed script is for DEVELOPMENT ONLY");
    console.log("   • Never run this in production environment");
    console.log("   • All test data can be deleted at any time");

    // Close database connection
    await mongoose.connection.close();
    console.log("\n Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n Fatal error during seeding:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed
seedDatabase();
