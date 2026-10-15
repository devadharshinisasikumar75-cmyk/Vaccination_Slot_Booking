# Vaccination Slot Booking and Tracking Platform

## Project Overview
The Vaccination Slot Booking and Tracking Platform is a healthcare web application developed to simplify the vaccination appointment process. It allows patients to book vaccination slots online, enables healthcare staff to manage appointments, and maintains digital vaccination records in a centralized system.

## Objectives
- Simplify vaccination slot booking.
- Maintain digital vaccination records.
- Reduce waiting time and appointment conflicts.
- Track vaccination history.
- Improve healthcare service efficiency.

## Features
- User Registration and Login
- Vaccination Slot Booking
- Appointment Management
- Vaccination Record Tracking
- Vaccine Availability Management
- Notification and Reminder System
- Admin Dashboard
- Reports

## Target Users
- Admin
- Healthcare Staff
- Patients

## Technology Stack
- Java
- Spring Boot
- MySQL
- Maven
- React
- Vite
- Git
- GitHub
- Postman
- Visual Studio Code

## Run locally on Windows

1. Install JDK 21, Node.js 22 or later, and MySQL 8.
2. Create the `vaxcare_db` schema with `Vaccination_backend/schema-mysql.sql`.
3. Copy `Vaccination_backend/.env.example` to `Vaccination_backend/.env` and
   set the local MySQL password, Brevo API key, and verified sender email. The
   startup script generates local OTP/JWT signing secrets when they are blank.
4. From the repository root, run `.\start-app.ps1`. To run one service only,
   use `.\start-app.ps1 -Mode backend` or `.\start-app.ps1 -Mode frontend`.
5. Open `http://localhost:5173`.

The backend `.env` contains secrets and is excluded from Git. Do not copy real
credentials into `.env.example` or commit local IDE/database settings.

## Railway deployment

Create two Railway services from this repository:

1. **Backend**: set the service root directory to `Vaccination_backend`. The
   service uses `Vaccination_backend/railway.toml` and listens on Railway's
   assigned `PORT`.
2. **Frontend**: set the service root directory to `Vaccination_frontend`. The
   service uses `Vaccination_frontend/railway.toml` and serves the built Vite
   application on Railway's assigned `PORT`.
3. Add a Railway MySQL database. Set the backend `DB_URL` to its JDBC URL,
   `DB_USERNAME`/`DB_PASSWORD` to its credentials, and `CORS_ALLOWED_ORIGINS`
   to the frontend's public Railway URL (without a trailing slash).
4. In the backend service variables, set `BREVO_API_KEY`,
   `BREVO_SENDER_EMAIL` (a sender verified in Brevo), `BREVO_SENDER_NAME`,
   a unique, long `OTP_HMAC_SECRET`, and a separate random `JWT_SECRET`
   containing at least 32 bytes. Optionally set `JWT_EXPIRATION_HOURS`
   (defaults to 12).
5. In the frontend service variables, set `API_BASE_URL` to the backend's
   public Railway URL (without a trailing slash), then redeploy both services.

Keep `.env` and all API/database secrets out of Git. The example environment
files contain variable names only; use Railway's Variables UI for deployment.
Public signup creates `USER` accounts only; selecting or submitting another
role from the browser cannot grant elevated access. Admin and healthcare staff
use their separate login pages. An administrator creates staff accounts from
the admin portal; only staff created this way can use the staff portal.

## Create the local MySQL database with MySQL Workbench

1. Start the local MySQL Server and open MySQL Workbench. Connect using your own
   local MySQL username and password.
2. In Workbench, choose **File > Open SQL Script** and open
   `Vaccination_backend/schema-mysql.sql`.
3. Click the lightning-bolt **Execute** button. The script creates the
   `vaxcare_db` schema and the eight application tables without deleting
   existing rows.
4. In the **SCHEMAS** panel, click **Refresh**, expand `vaxcare_db` and then
   **Tables**. You should see `users`, `booking`, `slot`, `email_otp`,
   `login_history`, `vaccine`, `vaccination_center`, and `vaccination_record`.
5. To verify in Workbench, run `USE vaxcare_db; SHOW TABLES;`.
6. In `Vaccination_backend/.env`, set `DB_USERNAME` and `DB_PASSWORD` to the
   same local MySQL account. Keep `.env` private and out of Git. Start the
   Spring Boot backend; Hibernate's `ddl-auto=update` will keep the entity
   schema synchronized.
7. To create the first administrator, set `ADMIN_BOOTSTRAP_EMAIL` and
   `ADMIN_BOOTSTRAP_PASSWORD` in the backend `.env`. Use a password of at least
   12 characters. Restart the backend once; the bootstrap creates an admin
   only if the database does not already contain one. If that email already
   belongs to an administrator, the bootstrap updates that account's password.
   Remove both bootstrap values from `.env` after successful creation or
   password reset, then open `/admin/login`. If a different administrator
   already exists, the bootstrap does not create another one.
8. Sign in as admin and add the organization's actual vaccine and center
   catalog entries. Healthcare staff accounts are assigned from the admin
   portal. Staff can then sign in at `/staff/login`, open **Manage Slots**,
   and create slots by selecting a registered center and vaccine, future date,
   start/end time, and capacity. Patient booking options are limited to
   available slots matching the selected center, vaccine, and date. Users sign
   up normally and book slots at `/register` and `/login`.

The script creates the schema only; it does not add sample vaccines, centers,
slots, or administrator accounts. Existing slot rows from any earlier demo
setup are not automatically deleted; add future slots through the staff portal.
New slots show their time range in 12-hour AM/PM format. The backend does not
seed demo slots at startup.
Bookings, OTPs, login history, and vaccination records are created by normal
application actions. A booking is an appointment, not proof that a vaccine was
administered; `vaccination_record` is populated only when healthcare staff mark
a past/current appointment as completed. Future appointments cannot be marked
completed before their scheduled date and time.

## Project Structure
```text
Vaccination_Slot_Booking/
├── Vaccination_backend/
│   ├── src/main/java/vaccination/
│   ├── src/test/java/vaccination/
│   ├── schema-mysql.sql
│   └── pom.xml
├── Vaccination_frontend/
│   ├── src/pages/
│   ├── src/modules/
│   ├── src/components/
│   └── package.json
├── start-app.ps1
└── README.md
```

## Future Enhancements
- SMS/Email notifications
- Online payment integration
- QR Code based vaccination verification
- Mobile application support

## Project Status
The application includes patient booking and tracking, healthcare appointment
and slot management, and administrator catalog and reporting screens. Follow
the local setup steps above to run it against a configured MySQL database.