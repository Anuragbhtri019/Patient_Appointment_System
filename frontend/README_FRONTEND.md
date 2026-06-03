# Patient Appointment System - Frontend

A modern React 18 + Vite frontend for managing patient appointments with doctors. Built with Tailwind CSS, React Router v6, and Context API.

## Features

### Patient Features
- **Doctor Search**: Browse and search doctors by specialization, branch, and consultation type
- **Book Appointments**: Reserve time slots with available doctors
- **View Appointments**: Dashboard showing upcoming and past appointments
- **Appointment History**: Full appointment history with filtering and pagination
- **Rate Doctors**: Leave ratings and reviews for completed appointments
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Admin Features
- **Doctor Management**: Add, edit, and delete doctors
- **Schedule Management**: Create and manage doctor availability slots
- **Appointment Overview**: View all appointments with filtering
- **Dashboard Analytics**: Statistics on doctors, bookings, and average ratings

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v6
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios
- **UI Components**: Headless UI, React Icons
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast

## Project Structure

```
src/
├── api/                    # API client modules
│   ├── axiosInstance.js   # Axios configuration with interceptors
│   ├── auth.api.js        # Authentication endpoints
│   ├── doctor.api.js      # Doctor endpoints
│   ├── appointment.api.js # Appointment endpoints
│   └── rating.api.js      # Rating endpoints
├── components/            # Reusable components
│   ├── layout/           # Layout components (Navbar, Sidebar, etc.)
│   ├── common/           # Common UI components (Button, Modal, etc.)
│   ├── doctor/           # Doctor-related components
│   ├── appointment/      # Appointment-related components
│   └── filters/          # Filter components
├── context/              # Context providers
│   ├── AuthContext.jsx   # Authentication state
│   ├── AppointmentContext.jsx # Appointment state
│   └── ToastContext.jsx  # Toast notifications
├── hooks/                # Custom hooks
│   ├── useAuth.js        # Auth context hook
│   ├── useAppointments.js # Appointments context hook
│   ├── useDoctors.js     # Doctors data fetching
│   ├── useDebounce.js    # Debounce values
│   └── useLocalStorage.js # LocalStorage helper
├── pages/                # Page components
│   ├── auth/            # Login, Register pages
│   ├── patient/         # Patient pages
│   ├── admin/           # Admin pages
│   └── NotFoundPage.jsx # 404 page
├── routes/              # Route definitions
│   ├── AppRoutes.jsx    # All routes
│   ├── ProtectedRoute.jsx # Protected route wrapper
│   └── AdminRoute.jsx   # Admin route wrapper
├── utils/               # Utility functions
│   ├── constants.js     # App constants
│   ├── dateUtils.js     # Date formatting utilities
│   └── formatters.js    # String formatters
├── App.jsx              # Main App component
├── main.jsx             # Entry point
└── index.css            # Tailwind styles
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure API base URL** (if needed)
   Edit `.env.local` and update `VITE_API_BASE_URL`

### Development

Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## API Integration

The frontend connects to the backend API at `/api` (proxied during development).

### Authentication Flow
1. User logs in with email and password
2. Backend returns access token and refresh token
3. Access token stored in localStorage
4. Axios interceptors automatically attach token to requests
5. On 401 response, refresh token is used to get new access token
6. If refresh fails, user is logged out and redirected to login

## Key Components

### Contexts
- **AuthContext**: Manages user authentication and session
- **AppointmentContext**: Manages user appointments
- **ToastContext**: Manages toast notifications

### Custom Hooks
- **useAuth()**: Access authentication state
- **useAppointments()**: Access appointment state
- **useDoctors()**: Fetch and manage doctors
- **useDebounce()**: Debounce value with delay
- **useLocalStorage()**: Persist state to localStorage

### Layout Components
- **PatientLayout**: Standard layout for patient pages (Navbar + Footer)
- **AdminLayout**: Admin panel layout (Sidebar + Top bar)
- **Navbar**: Navigation bar with responsive menu
- **Sidebar**: Admin navigation sidebar

### Common Components
- **Button**: Versatile button with variants and states
- **Modal**: Dialog with Headless UI
- **StarRating**: Interactive 5-star rating component
- **Avatar**: User avatar with fallback
- **Badge**: Status badge with variants
- **Card**: Reusable card component
- **Skeleton**: Loading skeleton

## Styling

- **Primary Color**: Teal-600
- **Font**: DM Sans (from Google Fonts)
- **Responsive Breakpoints**: Mobile-first approach with Tailwind breakpoints
- **Components**: Tailwind classes with @layer utilities

## Forms & Validation

All forms include:
- Client-side validation
- Inline error messages
- Loading states
- Disabled states on submission

## State Management

### Authentication
- Stored in AuthContext
- Persisted in localStorage
- Restored on app mount

### Appointments
- Managed by AppointmentContext
- Filtered by status
- Separated into upcoming and past

## Performance Optimizations

- Debounced search (400ms)
- Memoized callbacks
- Lazy loading routes (can be added)
- Optimized re-renders with useCallback
- Image optimization with Avatar fallback

## Error Handling

- Global toast notifications
- API error interceptor
- Graceful fallbacks
- User-friendly error messages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### Adding a New Page
1. Create component in `pages/`
2. Add route to `AppRoutes.jsx`
3. Use appropriate layout (PatientLayout or AdminLayout)

### Adding a New API Endpoint
1. Create function in `api/endpoint.api.js`
2. Use `axiosInstance` for requests
3. Update relevant context or hook

### Adding a New Component
1. Create in `components/`
2. Use Tailwind for styling
3. Follow naming conventions
4. Add PropTypes or JSDoc comments

## Troubleshooting

**CORS errors**: Check that backend API is running and vite proxy is configured
**Token expiration**: Refresh token endpoint should be available at `/api/auth/refresh`
**Build errors**: Clear node_modules and package-lock.json, then reinstall

## License

This project is part of the Patient Appointment System.
