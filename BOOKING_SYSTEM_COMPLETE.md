# Vaccination Booking System - Complete Implementation

## ✅ Booking Persistence System Implemented

### Backend Components Created

#### 1. Booking Model (`vaccination/model/Booking.java`)
- `id` (auto-generated)
- `user` (FK to User)
- `center` (vaccination center name)
- `vaccine` (vaccine type)
- `bookingDate` (appointment date)
- `bookingTime` (appointment time)
- `status` (Pending/Confirmed/Completed)

#### 2. Booking Repository (`vaccination/repository/BookingRepository.java`)
- `findByUser(User user)` - retrieve all bookings for a user
- Inherits CRUD operations from Spring Data

#### 3. Backend API Endpoints
**POST `/api/bookings`** - Create a booking
```json
{
  "userId": 1,
  "center": "City Health Center",
  "vaccine": "Covaxin",
  "bookingDate": "2026-09-15",
  "bookingTime": "10:00 AM - 11:00 AM"
}
```

**GET `/api/bookings/{userId}`** - Get all bookings for a user
```json
{
  "bookings": [
    {
      "id": 1,
      "center": "City Health Center",
      "vaccine": "Covaxin",
      "bookingDate": "2026-09-15",
      "bookingTime": "10:00 AM - 11:00 AM",
      "status": "Pending"
    }
  ]
}
```

### Frontend Components Updated

#### 1. Login Page (`login.jsx`)
- Stores `userId`, `userName`, `userEmail` in localStorage on successful login
- Redirect to dashboard

#### 2. Dashboard (`Dashboard.jsx`)
- Displays welcome message with user name
- Shows booking count from backend
- Navigation to booking and tracking pages
- Logout functionality

#### 3. Slot Booking Page (`SlotBooking.jsx`)
- Form with inputs: center, vaccine, date, time
- Validates all fields required
- POST to `/api/bookings` endpoint with userId
- Shows success/error messages
- Redirects to tracking page on success

#### 4. Tracking Page (`Tracking.jsx`)
- Fetches user's bookings from `/api/bookings/{userId}` on page load
- Displays all bookings in a list
- Shows booking details: ID, vaccine, center, date, time, status
- "Book Now" button if no bookings exist
- Back to dashboard button

### Database Schema (H2)

**users table**
```sql
id (BIGINT, PK, auto-increment)
name (VARCHAR)
email (VARCHAR, unique)
password (VARCHAR)
role (VARCHAR)
```

**booking table**
```sql
id (BIGINT, PK, auto-increment)
user_id (BIGINT, FK)
center (VARCHAR)
vaccine (VARCHAR)
booking_date (VARCHAR)
booking_time (VARCHAR)
status (VARCHAR)
```

### User Flow

1. **Register** → Create account with email/password
2. **Login** → Authenticate and store userId in localStorage
3. **Dashboard** → View welcome message and booking count
4. **Book Slot** → Fill form and submit to create booking
5. **Tracking** → View all bookings with status

### Running the App

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\DEVADHARSHINI\Documents\Vaccination_Slot_Booking"
powershell -ExecutionPolicy Bypass -File .\start-app.ps1 backend
```
Backend runs on: `http://localhost:9000`

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\DEVADHARSHINI\Documents\Vaccination_Slot_Booking\Vaccination_frontend"
npm run dev
```
Frontend runs on: `http://localhost:5174` (or 5173 if available)

### Testing

1. Open browser to `http://localhost:5174`
2. Register a new account
3. Login with credentials
4. Click "Book Now" on dashboard
5. Fill booking form (all fields required)
6. Click "Confirm Booking"
7. View booking on Tracking page
8. Logout and login again to verify persistence

### Database Notes

- Using H2 in-memory database for local development
- Database resets when backend restarts (can be changed to persistent H2 with file-based config)
- All bookings are associated with the logged-in user via FK relationship
- Ready to migrate to MySQL for production by changing `application.properties`

### Complete File List

**Backend (Java):**
- `Vaccination_backend/src/main/java/vaccination/model/Booking.java` - New
- `Vaccination_backend/src/main/java/vaccination/repository/BookingRepository.java` - New
- `Vaccination_backend/src/main/java/vaccination/HomeController.java` - Updated with booking endpoints
- `Vaccination_backend/src/main/resources/application.properties` - Existing H2 config

**Frontend (React):**
- `Vaccination_frontend/src/pages/login.jsx` - Updated with localStorage
- `Vaccination_frontend/src/pages/Dashboard.jsx` - Updated with booking count
- `Vaccination_frontend/src/pages/SlotBooking.jsx` - Updated with form submission
- `Vaccination_frontend/src/pages/Tracking.jsx` - Updated with booking list fetch
- `Vaccination_frontend/src/App.jsx` - Existing route definitions
