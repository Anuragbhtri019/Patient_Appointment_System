export const SPECIALIZATIONS = [
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
];

export const BRANCHES = [
  "Pokhara",
  "Bharatpur",
  "Lalitpur",
  "Kathmandu",
  "Dharan",
  "Biratnagar",
];

export const CONSULTATION_TYPES = [
  { id: "In-person", label: "In-person" },
  { id: "Telehealth", label: "Telehealth" },
];

export const APPOINTMENT_STATUSES = {
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// API Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

// Appointment Limits
export const APPOINTMENT_LIMITS = {
  MAX_ACTIVE_APPOINTMENTS: 2,
  MIN_RATING: 1,
  MAX_RATING: 5,
};

// Time Slot Constants
export const TIME_SLOT_STATUS = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
};

// User Roles
export const USER_ROLES = {
  PATIENT: "patient",
  ADMIN: "admin",
};

// Token Expiration
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
};
