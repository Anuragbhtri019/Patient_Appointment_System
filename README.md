# Patient Appointment System

A comprehensive web-based healthcare appointment management platform designed to streamline the booking process between patients and medical professionals. This full-stack application enables patients to discover, schedule, and manage their medical appointments while providing administrators with powerful tools to manage doctors, schedules, and system operations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Frontend Documentation](#frontend-documentation)
- [Backend Documentation](#backend-documentation)
- [Installation Guide](#installation-guide)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Patient Appointment System is a modern, scalable solution built with cutting-edge technologies to revolutionize how patients interact with healthcare providers. The platform addresses the growing need for efficient appointment management in the healthcare industry by providing a user-friendly interface for patients and comprehensive administrative tools for healthcare managers.

### Key Objectives

- **Patient Empowerment**: Allow patients to search for doctors by specialization, location, and ratings
- **Simplified Booking**: Provide an intuitive appointment booking experience with real-time slot availability
- **Quality Assurance**: Enable patients to rate and review their medical consultations
- **Administrative Control**: Give admins full control over doctor profiles, schedules, and system operations
- **Data Security**: Implement robust authentication and authorization mechanisms

---

## Features

### Patient Features

- **User Registration & Authentication**: Secure sign-up and login with JWT-based authentication
- **Doctor Discovery**: Search and filter doctors by specialization, hospital branch, and ratings
- **Appointment Booking**: Real-time availability checking with intuitive slot selection
- **Consultation Type Selection**: Choose between in-person and telehealth consultations
- **Appointment Management**: View, track, and cancel upcoming appointments
- **Feedback & Ratings**: Rate completed appointments and provide detailed feedback
- **Profile Management**: Update personal information and manage profile pictures
- **Appointment History**: Track past, upcoming, and cancelled appointments

### Administrator Features

- **Doctor Management**: Add, edit, deactivate, and remove doctors from the system
- **Schedule Management**: Create and manage doctor availability schedules
- **Appointment Oversight**: View all system appointments and monitor booking statistics
- **User Management**: Manage patient and admin accounts
- **Dashboard Analytics**: Track system usage and appointment metrics
- **Content Moderation**: Monitor patient ratings and feedback

### System Features

- **Rate Limiting**: Protection against abuse with intelligent request throttling
- **Data Validation**: Comprehensive input validation at both frontend and backend
- **Error Handling**: Graceful error management with meaningful user feedback
- **Image Management**: Cloud-based image storage using Cloudinary
- **Cron Jobs**: Automated appointment status updates
- **JWT Refresh Tokens**: Secure token management for extended sessions

---

## Tech Stack

### Frontend

| Technology          | Version | Purpose                                        |
| ------------------- | ------- | ---------------------------------------------- |
| **React**           | 19.2.6  | UI library for building interactive interfaces |
| **Vite**            | 8.0.12  | Fast build tool and development server         |
| **React Router**    | 7.16.0  | Client-side routing and navigation             |
| **Tailwind CSS**    | 3.4.19  | Utility-first CSS framework                    |
| **Axios**           | 1.16.1  | HTTP client for API communication              |
| **React Hot Toast** | 2.6.0   | Notification system                            |
| **React Icons**     | 5.6.0   | Icon library for UI components                 |
| **date-fns**        | 4.4.0   | Date and time utilities                        |
| **Headless UI**     | 2.2.10  | Unstyled, accessible UI components             |

### Backend

| Technology            | Version | Purpose                        |
| --------------------- | ------- | ------------------------------ |
| **Node.js**           | -       | JavaScript runtime environment |
| **Express**           | 5.2.1   | Web application framework      |
| **MongoDB**           | -       | NoSQL database                 |
| **Mongoose**          | 8.18.0  | MongoDB object modeling        |
| **JWT**               | 9.0.2   | Token-based authentication     |
| **bcryptjs**          | 3.0.2   | Password hashing and security  |
| **Multer**            | 2.0.2   | File upload middleware         |
| **Cloudinary**        | 1.41.3  | Cloud image storage            |
| **Express Validator** | 7.2.1   | Request validation middleware  |
| **Helmet**            | 8.1.0   | Security headers middleware    |
| **CORS**              | 2.8.5   | Cross-origin request handling  |
| **node-cron**         | 4.2.1   | Scheduled job execution        |
| **Swagger**           | 6.2.8   | API documentation              |

### Development Tools

- **Jest**: Unit and integration testing
- **Supertest**: HTTP assertion library for API testing
- **Nodemon**: Automatic server restart during development
- **ESLint**: Code quality and style enforcement
- **MongoDB Memory Server**: In-memory database for testing

---

## System Architecture

### Architecture Overview

The Patient Appointment System follows a **three-tier architecture** pattern, separating concerns into presentation, business logic, and data layers.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│              (React Frontend - Vite + Tailwind)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Auth, Patient, Admin Dashboard               │   │
│  │  Components: Cards, Modals, Forms, Filters           │   │
│  │  State Management: Context API + Custom Hooks        │   │
│  │  API Integration: Axios with interceptors            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    (HTTP/REST API)
                           ↓
┌────────────────────────────────────────────────────────────┐
│                   API LAYER (Express)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Authentication: JWT + Refresh Token Strategy         │  │
│  │ Authorization: Role-based Access Control (RBAC)      │  │
│  │ Validation: Express Validator middleware             │  │
│  │ Error Handling: Centralized error handler            │  │
│  │ Rate Limiting: Request throttling protection         │  │
│  │ Security: Helmet, CORS, Input sanitization           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │   Controllers   │  │   Services      │  │ Validators │  │
│  │                 │  │                 │  │            │  │
│  │ • Auth          │  │ • AppointmentSvc│  │ • Auth     │  │
│  │ • Doctor        │  │ • RatingUtils   │  │ • Doctor   │  │
│  │ • Appointment   │  │ • CronJobs      │  │ • Apt      │  │
│  │ • Schedule      │  │ • DateHandling  │  │ • Schedule │  │
│  │ • Rating        │  │                 │  │            │  │
│  └─────────────────┘  └─────────────────┘  └────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
                     (Mongoose ODM)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER (MongoDB)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Collections:                                        │   │
│  │  • users (Patients, Admins)                          │   │
│  │  • doctors (Healthcare professionals)                │   │
│  │  • schedules (Doctor availability)                   │   │
│  │  • appointments (Booking records)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Request-Response Flow

1. **Client Request**: User interacts with the React frontend
2. **API Call**: Frontend makes HTTP request via Axios to backend API
3. **Authentication Check**: Middleware verifies JWT token
4. **Authorization Verification**: Route protection ensures user has required role
5. **Input Validation**: Express Validator checks request data
6. **Business Logic**: Controller processes request and calls services
7. **Database Operation**: Mongoose models interact with MongoDB
8. **Response Generation**: Server sends JSON response back to client
9. **UI Update**: Frontend updates state and re-renders components

---

## Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│       USER          │
├─────────────────────┤
│ _id (PK)            │
│ name                │
│ email (UNIQUE)      │◄──────────┐
│ password            │           │
│ role (patient/admin)│           │
│ profileImage        │           │
│ refreshToken        │           │
│ timestamps          │           │
└─────────────────────┘           │
          ▲                       │
          │                       │
          │ (createdBy)           │
          │                       │
    ┌─────┴─────────────┐   ┌─────┴──────────────┐
    │                   │   │                    │
    │     DOCTOR        │   │  APPOINTMENT       │
    │                   │   │                    │
    │ _id (PK)          │   │ _id (PK)           │
    │ name              │   │ patient (FK) ─────►USER
    │ email             │   │ doctor (FK) ──────►DOCTOR
    │ specialization    │   │ schedule (FK) ────►SCHEDULE
    │ hospitalBranch    │   │ slotId             │
    │ averageRating     │   │ timeSlot           │
    │ totalRatings      │   │ consultationType   │
    │ isActive          │   │ appointmentDate    │
    │ imageUrl          │   │ status             │
    │ createdBy (FK)───┘    │ rating             │
    │ timestamps        │   │ feedback           │
    └────────┬──────────┘   │ cancellationReason │
             │              │ timestamps         │
             │              └────────────────────┘
             │
        (doctor FK)
             │
    ┌────────▼──────────────┐
    │     SCHEDULE          │
    │                       │
    │ _id (PK)              │
    │ doctor (FK) ──►DOCTOR │
    │ availableDate         │
    │ timeSlots []          │
    │  ├─ _id               │
    │  ├─ time              │
    │  ├─ consultationType  │
    │  └─ status            │
    │ timestamps            │
    └───────────────────────┘
    FK: Functional Key
    PK:Primary Key
```

### Schema Details

#### **Users Collection**

Stores both patient and administrator accounts with authentication credentials and profile information.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (bcrypt hashed, min 8 chars),
  role: String (enum: ['patient', 'admin'], default: 'patient'),
  profileImage: String (Cloudinary URL),
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Doctors Collection**

Contains healthcare professional profiles with specialization and availability information.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, sparse),
  imageUrl: String (Cloudinary URL),
  specialization: String (enum: ['Cardiology', 'Dermatology', ...]),
  hospitalBranch: String (required),
  averageRating: Number (0-5, default: 0),
  totalRatings: Number (default: 0),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  virtual: schedules (ref: Schedule),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Schedules Collection**

Manages doctor availability with time slots for both in-person and telehealth consultations.

```javascript
{
  _id: ObjectId,
  doctor: ObjectId (ref: Doctor, required),
  availableDate: Date (required),
  timeSlots: [
    {
      _id: ObjectId,
      time: String (format: "HH:MM AM/PM"),
      consultationType: String (enum: ['In-person', 'Telehealth']),
      status: String (enum: ['Available', 'Booked'], default: 'Available')
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Index**: Unique compound index on (doctor, availableDate)

#### **Appointments Collection**

Records patient appointments with complete booking and feedback information.

```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User, required),
  doctor: ObjectId (ref: Doctor, required),
  schedule: ObjectId (ref: Schedule, required),
  slotId: ObjectId (required),
  timeSlot: String (required),
  consultationType: String (enum: ['In-person', 'Telehealth']),
  appointmentDate: Date (required),
  status: String (enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming'),
  rating: Number (1-5, nullable),
  ratedAt: Date,
  feedback: String (max: 1000 chars),
  cancellationReason: String (max: 500 chars),
  createdAt: Date,
  updatedAt: Date
}
```

**Index**: Compound index on (patient, status)

#### **Medical Specializations**

The system supports 15 medical specializations:

- Cardiology
- Dermatology
- Neurology
- Orthopedics
- Pediatrics
- Psychiatry
- Pulmonology
- Rheumatology
- Gastroenterology
- Urology
- General Medicine
- ENT (Ear, Nose, Throat)
- General Practice
- Gynecology
- Oncology

---

## Frontend Documentation

### Overview

The frontend is a modern, responsive React application built with Vite and styled with Tailwind CSS. It provides separate user interfaces for patients and administrators with comprehensive appointment management functionality.

### UI/UX Design Philosophy

- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Clean Interface**: Minimalist design with intuitive navigation
- **Visual Feedback**: Real-time loading states, error messages, and success notifications
- **Accessibility**: Semantic HTML and ARIA labels for inclusive design

### Tech Stack Details

- **React 19.2.6**: Latest React version with improved performance
- **Vite 8.0.12**: Next-generation frontend tooling
- **Tailwind CSS 3.4.19**: Utility-first styling with responsive utilities
- **React Router 7.16.0**: Client-side routing with protected routes
- **Axios 1.16.1**: Promise-based HTTP client with interceptors
- **React Context API**: State management without external dependencies

### Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/                   # API integration layer
│   │   ├── axiosInstance.js   # Configured Axios instance with interceptors
│   │   ├── auth.api.js        # Authentication endpoints
│   │   ├── doctor.api.js      # Doctor CRUD operations
│   │   ├── appointment.api.js # Appointment management
│   │   ├── schedule.api.js    # Schedule management
│   │   └── rating.api.js      # Rating and feedback
│   │
│   ├── components/            # Reusable React components
│   │   ├── common/           # Generic components
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── StarRating.jsx
│   │   │
│   │   ├── layout/           # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PatientLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   │
│   │   ├── appointment/      # Appointment-related components
│   │   │   ├── AppointmentCard.jsx
│   │   │   ├── BookingModal.jsx
│   │   │   └── SlotPicker.jsx
│   │   │
│   │   ├── doctor/          # Doctor-related components
│   │   │   ├── DoctorCard.jsx
│   │   │   ├── DoctorForm.jsx
│   │   │   └── DoctorTable.jsx
│   │   │
│   │   └── filters/         # Filter components
│   │       └── SearchFilterBar.jsx
│   │
│   ├── context/              # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── AppointmentContext.jsx # Appointment state
│   │   └── ToastContext.jsx   # Toast notification state
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js        # Authentication hook
│   │   ├── useAppointments.js # Appointments hook
│   │   ├── useDoctors.js     # Doctors hook
│   │   ├── useDebounce.js    # Debounce utility hook
│   │   ├── useToast.js       # Toast notifications hook
│   │   └── useLocalStorage.js # LocalStorage hook
│   │
│   ├── pages/                # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   │
│   │   ├── patient/
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorSearch.jsx
│   │   │   ├── AppointmentHistory.jsx
│   │   │   └── ProfilePage.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DoctorManagement.jsx
│   │   │   ├── ScheduleManagement.jsx
│   │   │   └── AdminAppointments.jsx
│   │   │
│   │   └── NotFoundPage.jsx
│   │
│   ├── routes/               # Routing configuration
│   │   ├── AppRoutes.jsx     # Main route configuration
│   │   ├── ProtectedRoute.jsx # Patient route protection
│   │   └── AdminRoute.jsx    # Admin route protection
│   │
│   ├── utils/                # Utility functions
│   │   ├── constants.js      # App constants
│   │   ├── dateUtils.js      # Date formatting utilities
│   │   └── formatters.js     # String formatters
│   │
│   ├── App.jsx               # Root component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── index.html                # HTML template
├── package.json
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── vercel.json               # Vercel deployment config
```

### Key Features & Components

#### **Authentication Pages**

- **LoginPage**: User login with email and password validation
- **RegisterPage**: New user registration with role selection
- JWT token management with automatic refresh
- Error handling and form validation

#### **Patient Dashboard**

- Quick overview of upcoming appointments
- Recent appointment history
- Quick stats (total appointments, pending consultations)
- Navigation to search, booking, and profile management

#### **Doctor Search**

- Advanced search with filters:
  - Specialization filtering
  - Hospital branch selection
  - Sorting by rating
  - Real-time search with debouncing
- Doctor cards displaying:
  - Professional information
  - Average rating and number of reviews
  - Quick booking button

#### **Appointment Booking**

- Real-time availability checking
- Interactive slot picker
- Consultation type selection (in-person/telehealth)
- Appointment confirmation
- Booking history and management

#### **Admin Dashboard**

- System statistics and metrics
- Doctor management interface
- Schedule management
- Appointment oversight
- User activity monitoring

### State Management

The application uses React Context API for global state management:

**AuthContext**: Handles user authentication state, login/logout, token refresh
**AppointmentContext**: Manages appointment data and booking state
**ToastContext**: Manages toast notifications across the app

### Custom Hooks

- `useAuth()`: Access authentication state and methods
- `useAppointments()`: Handle appointment fetching and management
- `useDoctors()`: Manage doctor list and filtering
- `useDebounce()`: Debounce search inputs
- `useToast()`: Display notifications
- `useLocalStorage()`: Persist data in browser storage

### API Integration

Axios is configured with:

- Base URL pointing to backend API
- Automatic JWT token injection in request headers
- Request and response interceptors
- Automatic token refresh on 401 responses
- Error handling and user-friendly error messages

---

## Backend Documentation

### Overview

The backend is a robust Node.js/Express server handling all business logic, data validation, authentication, and database operations. It follows RESTful API conventions with comprehensive security measures.

### Architecture Pattern: MVC + Services

The backend implements an enhanced MVC pattern with a service layer for better code organization:

```
Routes → Controllers → Services → Models → Database
                ↓
            Middleware (Validation, Auth, Error Handling)
```

### Project Structure

```
backend/
├── src/
│   ├── config/                # Configuration files
│   │   ├── db.js             # MongoDB connection
│   │   └── cloudinary.js     # Cloudinary setup
│   │
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js      # Auth operations
│   │   ├── doctor.controller.js    # Doctor CRUD
│   │   ├── appointment.controller.js # Appointments
│   │   ├── schedule.controller.js  # Schedules
│   │   └── rating.controller.js    # Ratings
│   │
│   ├── models/                # Mongoose schemas
│   │   ├── User.js           # User schema with auth methods
│   │   ├── Doctor.js         # Doctor schema with virtuals
│   │   ├── Schedule.js       # Schedule with embedded slots
│   │   └── Appointment.js    # Appointment with indexes
│   │
│   ├── routes/                # API routes
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── appointment.routes.js
│   │   ├── schedule.routes.js
│   │   └── rating.routes.js
│   │
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.js # JWT verification & RBAC
│   │   ├── error.middleware.js # Error handler
│   │   ├── validate.middleware.js # Input validation
│   │   ├── upload.middleware.js # File upload handling
│   │   └── appointmentLimit.middleware.js # Rate limiting
│   │
│   ├── validators/            # Validation rules
│   │   ├── auth.validator.js
│   │   ├── doctor.validator.js
│   │   └── appointment.validator.js
│   │
│   ├── service/               # Business logic
│   │   └── appointmentService.js # Appointment operations
│   │
│   ├── utils/                 # Utility functions
│   │   ├── AppError.js       # Custom error class
│   │   ├── catchAsync.js     # Async error wrapper
│   │   ├── apiFeatures.js    # Filtering, sorting, pagination
│   │   ├── cronJobs.js       # Scheduled tasks
│   │   ├── ratingUtils.js    # Rating calculations
│   │   └── seedData.js       # Database seeding
│   │
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
│
├── tests/                     # Test files
│   ├── auth.test.js
│   ├── appointment.test.js
│   └── doctor.test.js
│
├── jest.config.js
├── jest-setup.js
├── .env.example              # Environment template
├── package.json
└── package-lock.json
```

### Core Middleware

#### **Authentication Middleware** (`auth.middleware.js`)

- **`protect`**: Verifies JWT token and attaches user to request
- **`restrictTo(...roles)`**: Role-based access control
- Features:
  - Token extraction from cookies or Authorization header
  - Automatic token refresh on expiration
  - User information attachment to request object

#### **Validation Middleware** (`validate.middleware.js`)

- Express Validator integration
- Chain validation rules
- Standardized error response format

#### **Upload Middleware** (`upload.middleware.js`)

- Multer configuration for file uploads
- Cloudinary integration for image storage
- File size and type validation

#### **Error Handler** (`error.middleware.js`)

- Centralized error handling
- Consistent error response format
- Stack trace logging in development

### Security Measures

1. **Authentication & Authorization**
   - JWT-based authentication with access and refresh tokens
   - Role-based access control (Patient, Admin)
   - Secure password hashing with bcryptjs
   - Token refresh mechanism for extended sessions

2. **Request Security**
   - Helmet.js for security headers
   - CORS configuration for cross-origin requests
   - Rate limiting (100 requests per 15 minutes)
   - Input validation and sanitization
   - SQL injection protection via Mongoose

3. **Data Security**
   - Password field excluded from queries by default
   - Sensitive data encryption
   - HTTPS recommended for production
   - Environment variable protection

### Error Handling

Custom `AppError` class extends native Error:

```javascript
throw new AppError("Error message", 400); // status code
```

Comprehensive error scenarios:

- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate email, etc.)
- 500: Internal Server Error

---

## API Endpoints

### Authentication Endpoints

#### User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Cena",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "patient"
}
```

**Response**: `201 Created` - User created with JWT tokens

#### User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**: `200 OK` - Returns access token, refresh token, and user data

#### Check Email Availability

```http
POST /api/auth/check-email
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response**: `200 OK` - `{ available: true/false }`

#### Refresh Token

```http
POST /api/auth/refresh
```

**Response**: `200 OK` - New access token

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response**: `200 OK` - Clears refresh token

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response**: `200 OK` - Current user profile

#### Update Profile

```http
PATCH /api/auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Jane Doe",
  "profileImage": <File>
}
```

**Response**: `200 OK` - Updated user profile

#### Change Password

```http
PATCH /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response**: `200 OK` - Password changed successfully

#### Delete Profile Image

```http
DELETE /api/auth/profile-image
Authorization: Bearer <token>
```

**Response**: `200 OK` - Profile image removed

---

### Doctor Endpoints

#### Get All Doctors

```http
GET /api/doctors
Query Parameters:
  ?specialization=Cardiology
  ?hospitalBranch=Branch Name
  ?rating=4.5
  ?limit=10
  ?page=1
  ?sort=rating
```

**Response**: `200 OK` - Array of doctors with pagination

#### Get Doctor by ID

```http
GET /api/doctors/:id
```

**Response**: `200 OK` - Doctor details with schedules and ratings

#### Create Doctor (Admin Only)

```http
POST /api/doctors
Authorization: Bearer <adminToken>
Content-Type: multipart/form-data

{
  "name": "Dr. Martin",
  "email": "dr.smith@hospital.com",
  "specialization": "Cardiology",
  "hospitalBranch": "Main Branch",
  "image": <File>
}
```

**Response**: `201 Created` - New doctor created

#### Update Doctor (Admin Only)

```http
PATCH /api/doctors/:id
Authorization: Bearer <adminToken>
Content-Type: multipart/form-data

{
  "name": "Dr. Smith Updated",
  "specialization": "Cardiology",
  "isActive": true,
  "image": <File>
}
```

**Response**: `200 OK` - Doctor updated

#### Delete Doctor (Admin Only)

```http
DELETE /api/doctors/:id
Authorization: Bearer <adminToken>
```

**Response**: `204 No Content` - Doctor deleted

---

### Schedule Endpoints

#### Get Schedules by Doctor

```http
GET /api/schedules/doctor/:doctorId
Query Parameters:
  ?startDate=2024-01-01
  ?endDate=2024-01-31
```

**Response**: `200 OK` - Array of doctor schedules with available slots

#### Create Schedule (Admin Only)

```http
POST /api/schedules
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "doctor": "doctorId",
  "availableDate": "2024-01-15T00:00:00Z",
  "timeSlots": [
    {
      "time": "09:00 AM",
      "consultationType": "In-person"
    },
    {
      "time": "09:30 AM",
      "consultationType": "Telehealth"
    }
  ]
}
```

**Response**: `201 Created` - Schedule created

#### Update Schedule (Admin Only)

```http
PATCH /api/schedules/:id
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "timeSlots": [
    {
      "time": "10:00 AM",
      "consultationType": "In-person",
      "status": "Available"
    }
  ]
}
```

**Response**: `200 OK` - Schedule updated

#### Delete Schedule (Admin Only)

```http
DELETE /api/schedules/:id
Authorization: Bearer <adminToken>
```

**Response**: `204 No Content` - Schedule deleted

---

### Appointment Endpoints

#### Book Appointment (Patient Only)

```http
POST /api/appointments
Authorization: Bearer <patientToken>
Content-Type: application/json

{
  "doctor": "doctorId",
  "schedule": "scheduleId",
  "slotId": "slotObjectId",
  "timeSlot": "09:00 AM",
  "consultationType": "In-person",
  "appointmentDate": "2024-01-15T00:00:00Z"
}
```

**Response**: `201 Created` - Appointment booked
**Note**: Limited to 3 concurrent appointments per patient

#### Get My Appointments (Patient)

```http
GET /api/appointments/my-appointments
Authorization: Bearer <patientToken>
Query Parameters:
  ?status=Upcoming
  ?limit=10
  ?page=1
```

**Response**: `200 OK` - Patient's appointments

#### Get Appointments Grouped by Status

```http
GET /api/appointments/grouped-by-status
Authorization: Bearer <patientToken>
```

**Response**: `200 OK` - Appointments grouped by status (Upcoming, Completed, Cancelled)

#### Get Appointment by ID

```http
GET /api/appointments/:id
Authorization: Bearer <token>
```

**Response**: `200 OK` - Appointment details

#### Check Appointment Status

```http
GET /api/appointments/:id/check-status
Authorization: Bearer <token>
```

**Response**: `200 OK` - Current appointment status

#### Cancel Appointment (Patient)

```http
PATCH /api/appointments/:id/cancel
Authorization: Bearer <patientToken>
Content-Type: application/json

{
  "reason": "Cannot make it on that day"
}
```

**Response**: `200 OK` - Appointment cancelled

#### Get All Appointments (Admin Only)

```http
GET /api/appointments
Authorization: Bearer <adminToken>
Query Parameters:
  ?status=Completed
  ?limit=20
  ?page=1
```

**Response**: `200 OK` - All system appointments

#### Update Appointment Statuses (Admin)

```http
POST /api/appointments/update-statuses
Authorization: Bearer <adminToken>
```

**Response**: `200 OK` - Status update operation completed

#### Check Multiple Appointment Statuses (Admin)

```http
POST /api/appointments/check-statuses
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "appointmentIds": ["id1", "id2", "id3"]
}
```

**Response**: `200 OK` - Status check results

---

### Rating Endpoints

#### Rate Appointment (Patient)

```http
POST /api/ratings/:appointmentId/rate
Authorization: Bearer <patientToken>
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Excellent doctor, very attentive and professional"
}
```

**Response**: `201 Created` - Rating recorded
**Requirements**:

- Appointment must be completed
- Patient cannot rate more than once per appointment
- Rating must be between 1-5
- Feedback limited to 1000 characters

---

## Installation Guide

### Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn** (v8 or higher)
- **MongoDB** (local or Atlas cloud instance)
- **Git**

### Environment Setup

#### Backend Configuration

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create `.env` file from template:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/patient_appointment_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client
CLIENT_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
```

4. Install backend dependencies:

```bash
npm install
```

#### Frontend Configuration

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Update `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Install frontend dependencies:

```bash
npm install
```

### Database Setup

#### Using MongoDB Atlas (Cloud)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Add it to `.env` in backend

#### Using Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:

```bash
# macOS
brew services start mongodb-community

# Windows
# Start MongoDB from Services or use: mongod

# Linux
sudo systemctl start mongod
```

3. Update `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/patient_appointment_db
```

### Cloudinary Setup

1. Create account at https://cloudinary.com
2. Navigate to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add to `.env` in backend

### Seed Initial Data (Optional)

```bash
cd backend
npm run seed
```

This creates sample doctors and schedules for testing.

---

## Running the Application

### Development Mode

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

#### Terminal 2: Frontend Development Server

```bash
cd frontend
npm run dev
```

Application runs on `http://localhost:5173`

### Production Build

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### API Documentation

Once backend is running, access Swagger UI at:

```
http://localhost:5000/api-docs
```

---

## Project Structure Summary

```
Patient/
├── backend/                    # Node.js Express server
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Custom middleware
│   │   ├── validators/        # Input validation
│   │   ├── service/           # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── app.js             # Express app
│   │   └── server.js          # Entry point
│   ├── tests/                 # Test files
│   └── package.json
│
├── frontend/                   # React Vite application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── api/               # API integration
│   │   ├── components/        # React components
│   │   ├── context/           # Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── routes/            # Routing
│   │   ├── utils/             # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md                  # Documentation
```

---

## Testing

### Backend Testing

Run the test suite:

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run testwatch

# Run specific test file
npm test -- auth.test.js
```

### Test Coverage

Tests include:

- **Authentication**: Registration, login, token refresh
- **Doctor Management**: CRUD operations, filtering
- **Appointments**: Booking, cancellation, status updates
- **Validation**: Input validation for all endpoints

### Frontend Testing

Manual testing checklist:

- [ ] User registration with validation
- [ ] Login and logout functionality
- [ ] Doctor search and filtering
- [ ] Appointment booking flow
- [ ] Appointment cancellation
- [ ] Rating appointments
- [ ] Profile management
- [ ] Admin dashboard operations
- [ ] Error handling and user feedback

---

## Key Technologies Explained

### Frontend Technologies

**React 19**: Modern JavaScript library for building user interfaces with hooks and functional components

**Vite**: Next-generation build tool providing extremely fast development experience and optimized production builds

**Tailwind CSS**: Utility-first CSS framework enabling rapid UI development with predefined classes

**React Router**: Client-side routing for single-page application navigation without page reloads

**Axios**: Promise-based HTTP client with request/response interceptors and automatic error handling

### Backend Technologies

**Express**: Lightweight, flexible Node.js framework for building RESTful APIs

**MongoDB**: NoSQL document database providing flexible schema and scalability

**Mongoose**: Object-document mapper providing schema validation and query helpers

**JWT**: Token-based authentication for stateless API authentication

**Bcryptjs**: Password hashing library providing secure credential storage

**Multer**: Middleware for handling file uploads in Express

**Cloudinary**: Cloud storage service for image management and optimization

**Node-cron**: Scheduler for running automated tasks at specific times

---

## Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

**Database Connection Error**

- Verify MongoDB is running
- Check connection string in `.env`
- Ensure IP whitelist in MongoDB Atlas

**CORS Errors**

- Verify `CLIENT_URL` in backend `.env`
- Check frontend API base URL

**Image Upload Issues**

- Verify Cloudinary credentials
- Check file size limits
- Ensure proper multer configuration

---

## Contributing

### Development Workflow

1. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit

```bash
git commit -m "feat: add your feature"
```

3. Push to repository

```bash
git push origin feature/your-feature-name
```

4. Create Pull Request with description

### Code Style

- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and modular

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Support & Contact

For issues, questions, or suggestions, please:

1. Check existing documentation
2. Review GitHub issues
3. Contact the development team

---

## Acknowledgments

- **Author**: Anurag Bhattarai
- **Technologies**: React, Node.js, MongoDB, Express
- **Libraries**: All open-source libraries used in this project

---

## Future Enhancements

Planned features for future releases:

- [ ] Video consultation integration
- [ ] SMS and email notifications
- [ ] Appointment reminders
- [ ] Advanced analytics dashboard
- [ ] Multiple language support
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Prescription management

---

**Last Updated**: June 2024 **Maintained By:**Anurag Bhattarai **Version**: 1.0.0
