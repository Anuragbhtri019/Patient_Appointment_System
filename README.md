# Patient Appointment System

A full-stack healthcare management application that enables patients to book appointments with doctors, manage their medical schedules, and rate healthcare providers. The system features a robust backend API, an intuitive frontend interface, and real-time appointment management.

frontend : https://patient-appointment-system-7jim7uioz-anuragbhtri019s-projects.vercel.app/search
backend : https://patient-appointment-system-1.onrender.com/

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Design & Architecture](#system-design--architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Seed Script](#seed-script)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [Deployment Guide](#deployment-guide)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)
- [License](#license)

## 🎯 Project Overview

The Patient Appointment System is a healthcare platform designed to streamline the process of managing doctor appointments. Patients can discover doctors by specialization, view available time slots, book appointments, and provide ratings after their visits. The system supports both in-person and telehealth consultations.

### Key Features

- **User Authentication**: Secure registration and login for patients and administrators
- **Doctor Management**: Create and manage doctor profiles with specialization and hospital branch details
- **Appointment Scheduling**: View available time slots and book appointments with doctors
- **Schedule Management**: Doctors can manage their availability through customizable time slots
- **Rating System**: Patients can rate doctors and consultations after appointments are completed
- **Real-time Availability**: Dynamic status updates for available and booked slots
- **Role-based Access Control**: Separate permissions for patients, doctors, and administrators
- **Image Upload**: Cloudinary integration for doctor profile images
- **Input Validation**: Comprehensive data validation using express-validator
- **Error Handling**: Centralized error handling with custom error messages
- **Rate Limiting**: Protection against abuse with request rate limiting
- **API Documentation**: Interactive Swagger UI for API exploration

## 🏗️ System Design & Architecture

### ER Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        Database Schema                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐        ┌──────────────────┐                  │
│  │      Users       │        │     Doctors      │                  │
│  ├──────────────────┤        ├──────────────────┤                  │
│  │ _id (PK)         │        │ _id (PK)         │                  │
│  │ name             │        │ name             │                  │
│  │ email (unique)   │        │ specialization   │                  │
│  │ password (hash)  │        │ hospitalBranch   │                  │
│  │ role             │        │ imageUrl         │                  │
│  │ refreshToken     │        │ averageRating    │                  │
│  │ timestamps       │        │ totalRatings     │                  │
│  └──────────────────┘        │ isActive         │                  │
│           │                  │ createdBy (FK)   │                  │
│           │                  │ timestamps       │                  │
│           │                  └──────────────────┘                  │
│           │                            │                           │
│           │ 1:N                        │ 1:N                       │
│           │                            │                           │
│           └────────────────┬───────────┘                           │
│                            │                                       │
│                    ┌───────▼────────┐                              │
│                    │   Schedules    │                              │
│                    ├────────────────┤                              │
│                    │ _id (PK)       │                              │
│                    │ doctor (FK)    │                              │
│                    │ availableDate  │                              │
│                    │ timeSlots []   │                              │
│                    │  - _id         │                              │
│                    │  - time        │                              │
│                    │  - type        │                              │
│                    │  - status      │                              │
│                    │ timestamps     │                              │
│                    └───────┬────────┘                              │
│                            │                                       │
│                            │ 1:N                                   │
│                            │                                       │
│                    ┌───────▼────────┐                              │
│                    │  Appointments  │                              │
│                    ├────────────────┤                              │
│                    │ _id (PK)       │                              │
│                    │ patient (FK)   │                              │
│                    │ doctor (FK)    │                              │
│                    │ schedule (FK)  │                              │
│                    │ slotId         │                              │
│                    │ timeSlot       │                              │
│                    │ consultType    │                              │
│                    │ appointDate    │                              │
│                    │ status         │                              │
│                    │ rating         │                              │
│                    │ ratedAt        │                              │
│                    │ timestamps     │                              │
│                    └────────────────┘                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                        │
│  - Doctor Discovery & Search                                        │
│  - Appointment Booking Interface                                    │
│  - User Dashboard & Profile Management                              │
│  - Rating & Review System                                           │
└────────────────┬────────────────────────────────────────────────────┘
                 │ HTTP/REST API
┌────────────────▼──────────────────────────────────────────────────┐
│                    Backend (Express.js)                           │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Routes Layer                                               │   │
│  │ - Auth Routes | Doctor Routes | Appointment Routes         │   │
│  │ - Schedule Routes | Rating Routes                          │   │
│  └────────────────┬───────────────────────────────────────────┘   │
│  ┌────────────────▼───────────────────────────────────────────┐   │
│  │ Middleware Layer                                           │   │
│  │ - Authentication | Validation | Error Handling             │   │
│  │ - Rate Limiting | File Upload | Request Logging            │   │
│  └────────────────┬───────────────────────────────────────────┘   │
│  ┌────────────────▼───────────────────────────────────────────┐   │
│  │ Controllers Layer                                          │   │
│  │ - Auth Controller | Doctor Controller                      │   │
│  │ - Appointment Controller | Schedule Controller             │   │
│  │ - Rating Controller                                        │   │
│  └────────────────┬───────────────────────────────────────────┘   │
│  ┌────────────────▼───────────────────────────────────────────┐   │
│  │ Services & Utilities                                       │   │
│  │ - Validators | API Features | Error Handling               │   │
│  │ - Cron Jobs | Rating Utils                                 │   │
│  └────────────────┬───────────────────────────────────────────┘   │
│  ┌────────────────▼───────────────────────────────────────────┐   │
│  │ Models (Mongoose)                                          │   │
│  │ - User | Doctor | Schedule | Appointment                   │   │
│  └────────────────┬───────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────────┐
│          Data Layer (MongoDB Atlas)                               │
│  - Persistent data storage for all application entities           │
│  - Indexed queries for performance optimization                   │
└───────────────────────────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────────┐
│        External Services Integration                              │
│  - Cloudinary: Image storage and optimization                     │
│  - JWT: Secure authentication tokens                              │
│  - Node-cron: Scheduled tasks (appointment status updates)        │
└───────────────────────────────────────────────────────────────────┘
```

## 🛠️ Frontend Description

### UI Design

- **Modern & Responsive**: Built with Tailwind CSS for a clean, mobile-friendly interface
- **Component-based Architecture**: Reusable React components for consistency
- **Real-time Feedback**: Toast notifications for user actions and feedback
- **Intuitive Navigation**: React Router for smooth page transitions

### Tools Used

- **React 19**: Latest React version with concurrent rendering features
- **Vite**: Fast build tool for rapid development and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Router**: Client-side routing for SPA navigation
- **Axios**: Promise-based HTTP client for API calls
- **React Hot Toast**: Non-intrusive notification system
- **Heroicons & React Icons**: Comprehensive icon libraries
- **Headless UI**: Unstyled, accessible components for custom designs

## 🔧 Backend Description

### API Endpoints

#### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new user (patient)
- `POST /login` - Login with email and password
- `POST /logout` - Logout and invalidate refresh token
- `POST /refresh-token` - Get new access token using refresh token

#### Doctor Routes (`/api/doctors`)

- `GET /` - Get all doctors (with filtering by specialization, hospital branch)
- `GET /:id` - Get doctor details with ratings
- `POST /` - Create new doctor (admin only)
- `PATCH /:id` - Update doctor information (admin only)
- `DELETE /:id` - Delete doctor (admin only)

#### Schedule Routes (`/api/schedules`)

- `GET /` - Get all schedules (with filtering)
- `GET /:id` - Get specific schedule with time slots
- `POST /` - Create schedule for a doctor
- `PATCH /:id` - Update schedule time slots
- `DELETE /:id` - Delete schedule

#### Appointment Routes (`/api/appointments`)

- `GET /` - Get user's appointments (patient view) or all appointments (admin)
- `GET /:id` - Get appointment details
- `POST /` - Book new appointment
- `PATCH /:id` - Update appointment status
- `DELETE /:id` - Cancel appointment

#### Rating Routes (`/api/ratings`)

- `POST /` - Submit rating for completed appointment
- `GET /doctor/:doctorId` - Get doctor's ratings and average
- `DELETE /:id` - Delete rating (admin or owner)

### Key Technologies

- **Express.js**: Fast and minimalist web framework
- **MongoDB & Mongoose**: Document-based database with schema validation
- **JWT**: Secure token-based authentication
- **Bcryptjs**: Password hashing and security
- **Cloudinary**: Cloud storage for images
- **Swagger/OpenAPI**: API documentation and testing interface
- **Jest & Supertest**: Unit and integration testing framework
- **Node-cron**: Scheduled tasks for appointment status updates
- **Express-validator**: Input validation and sanitization
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin resource sharing configuration
- **Morgan**: HTTP request logging

## Prerequisites

Before starting, ensure you have the following installed:

### Required

- **Node.js** v18 or higher - [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### External Accounts Required

- **MongoDB Atlas Account** - [Create Free Cluster](https://www.mongodb.com/cloud/atlas/register)
  - Create a database cluster
  - Whitelist your IP address
  - Get your connection string
- **Cloudinary Account** - [Sign Up](https://cloudinary.com/users/register/free)
  - Create API credentials
  - Get your Cloud Name, API Key, and API Secret

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/patient-appointment-system.git
cd patient-appointment-system
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - MONGODB_URI: Your MongoDB Atlas connection string
# - CLOUDINARY_NAME: Your Cloudinary cloud name
# - CLOUDINARY_API_KEY: Your Cloudinary API key
# - CLOUDINARY_API_SECRET: Your Cloudinary API secret
# - JWT_SECRET: A secure random string (min 32 characters)
# - PORT: 5000 (default)
# - CLIENT_URL: http://localhost:5173

nano .env  # or use your preferred editor
```

Example `.env` configuration:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/patient_appointment_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production_minimum_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
BCRYPT_ROUNDS=12
```

Start the backend development server:

```bash
npm run dev
```

The backend will start on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
# From the root directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# VITE_API_BASE_URL=/api  (or http://localhost:5000/api for separate backend)

npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 4: Verify Installation

1. Open `http://localhost:5173` in your browser
2. Try to register a new account
3. Login with your credentials
4. Check that you can browse doctors and schedules
5. The backend API should be accessible at `http://localhost:5000/api/docs` (Swagger UI)

## Seed Script

The seed script populates the database with realistic test data using Faker.js. This includes:

- **1 Admin User** - For managing doctors and system configuration
- **3 Patient Users** - For testing patient functionality
- **5 Doctors** - With different specializations and hospital branches
- **10 Schedules** - With diverse time slots and consultation types

### Running the Seed Script

```bash
cd backend

# Install Faker.js if not already installed
npm install @faker-js/faker --save-dev

# Run the seed script
npm run seed
```

**Important:** The seed script will:

1. Connect to MongoDB using your configured MONGODB_URI
2. Clear existing collections to avoid duplicates
3. Create all test data
4. Display created credentials in the console

**Default Test Credentials:**

```
Admin User:
Email: admin@example.com
Password: Admin@12345

Patient Users:
Email: patient1@example.com - patient3@example.com
Password: Patient@12345 (same for all)
```

**Note:** Always run seed script in development environment only. Never use in production!

## API Documentation

The API documentation is available in two formats:

### Interactive Swagger UI

```
URL: http://localhost:5000/api/docs
```

Access the interactive Swagger interface to:

- View all available endpoints
- See request/response examples
- Test API endpoints directly
- Download OpenAPI specification

### Example API Calls

#### Register a New Patient

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### Get All Doctors with Specialization Filter

```bash
curl -X GET "http://localhost:5000/api/doctors?specialization=Cardiology" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Book an Appointment

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "doctor": "DOCTOR_ID",
    "schedule": "SCHEDULE_ID",
    "slotId": "SLOT_ID",
    "consultationType": "In-person"
  }'
```

#### Rate a Doctor (After Appointment)

```bash
curl -X POST http://localhost:5000/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "appointment": "APPOINTMENT_ID",
    "rating": 5,
    "comment": "Great doctor, very professional!"
  }'
```

## 🧪 Running Tests

The project includes comprehensive unit and integration tests using Jest and Supertest.

### Run All Tests

```bash
cd backend
npm test
```

### Run Tests in Watch Mode

```bash
cd backend
npm run test:watch
```

### Run Specific Test File

```bash
npm test -- tests/auth.test.js
```

### Check Test Coverage

```bash
npm test -- --coverage
```

Tests cover:

- Authentication flow (register, login, refresh tokens)
- Doctor CRUD operations
- Appointment booking and management
- Schedule creation and availability
- Input validation
- Error handling
- Authorization checks

## Deployment Guide

### Backend Deployment (Render.com)

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub or email

2. **Create a New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: patient-appointment-backend
     - **Region**: Choose closest to users
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Set Environment Variables**
   - In Render Dashboard → Settings → Environment Variables, add:

   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your_mongodb_uri>
   JWT_SECRET=<strong_random_string_32+_chars>
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   CLOUDINARY_NAME=<your_cloudinary_name>
   CLOUDINARY_API_KEY=<your_api_key>
   CLOUDINARY_API_SECRET=<your_api_secret>
   CLIENT_URL=<your_frontend_url>
   BCRYPT_ROUNDS=12
   ```

4. **Deploy**
   - Render automatically deploys on GitHub push
   - Your backend URL will be: `https://patient-appointment-backend.onrender.com`

### Frontend Deployment (Vercel)

1. **Create a Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Your Project**
   - Click "New Project"
   - Select your GitHub repository
   - Select the `frontend` folder as root directory

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables**
   - In Project Settings → Environment Variables, add:

   ```
   VITE_API_BASE_URL=https://patient-appointment-backend.onrender.com/api
   ```

5. **Deploy**
   - Vercel automatically deploys on GitHub push
   - Your frontend URL will be provided in the dashboard

### Database Configuration for Production

1. **MongoDB Atlas Security**
   - Create a dedicated database user
   - Use strong passwords
   - Whitelist production server IPs
   - Enable IP access list restrictions
   - Use encrypted connections (SSL/TLS)

2. **Backup Strategy**
   - Enable automated backups (24-hour backup windows)
   - Test restoration procedures regularly
   - Store backup credentials securely

## Known Limitations & Future Improvements

### Current Limitations

1. **Real-time Updates**
   - Currently uses polling for availability updates
   - Solution: Implement Socket.io for real-time updates

2. **Email Notifications**
   - No email confirmations or reminders
   - Solution: Integrate Nodemailer or SendGrid for email notifications

3. **Calendar Integration**
   - No Google Calendar or Outlook integration
   - Solution: Add OAuth2 integration with calendar providers

4. **Payment Processing**
   - No appointment payment system
   - Solution: Integrate Stripe or PayPal

5. **Video Consultation**
   - Telehealth is text-based only
   - Solution: Integrate Jitsi or Zoom API for video calls

6. **Mobile Optimization**
   - Limited mobile-specific optimizations
   - Solution: Create native mobile apps (React Native/Flutter)

### Planned Improvements

1. **Real-time Communication**

   ```
   - Socket.io integration for live appointment status
   - Real-time notification system
   - Live chat between patient and doctor
   ```

2. **Advanced Scheduling**

   ```
   - Recurring appointments
   - Appointment rescheduling
   - Buffer time between appointments
   - Multiple time zone support
   ```

3. **Analytics Dashboard**

   ```
   - Admin dashboard with analytics
   - Doctor performance metrics
   - Appointment statistics
   - User engagement tracking
   ```

4. **Medical Records**

   ```
   - Secure medical history storage
   - Prescription management
   - Lab report uploads
   - Patient medical timeline
   ```

5. **Enhanced Rating System**

   ```
   - Verified patient reviews
   - Photo/video reviews
   - Response system for doctors
   - Helpful vote system
   ```

6. **Admin Features**
   ```
   - Advanced user management
   - System logs and audit trails
   - Bulk operations
   - Report generation
   - SMS notifications
   ```

## 📄 License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software for personal and commercial purposes.
See [LICENSE](./LICENSE) file for complete details.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or suggestions, please:

- Open an issue on GitHub
- Check existing documentation
- Review API documentation at `/api/docs`

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Maintainer**: Anurag Bhattarai
