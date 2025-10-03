# Link Bedside Nurses Server

A robust backend server for managing nurse appointments, payments, account deletion, file uploads, and messaging for the Link Bedside platform.

## Features

- Secure authentication for patients, nurses, and admins
- Appointment scheduling and nurse assignment
- **Robust payment-to-appointment linking and status tracking**
- File upload and document management
- Account deletion (Google Play Store compliant)
- Messaging service (SMS, email, OTP)
- Comprehensive API documentation
- Health checks, rate limiting, and security best practices
- **Appointment location capture during scheduling (GeoJSON)**
- **DTOs now match database models for all entities (including GeoJSON for location)**

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with all required variables (see docs and sample)
4. Build and start the server:
   ```bash
   npm run build
   npm start
   ```
5. Access the API at `http://localhost:3000/api/v1`

## API Overview

- **Appointments:** Schedule, assign, and manage nurse appointments
- **Payments:** Initiate and track payments, linked to appointments
- **File Uploads:** Upload and manage nurse documents
- **Account Deletion:** Request and manage account deletion
- **Messaging:** OTP, notifications, and bulk messaging
- **Appointment Location:** Optionally include coordinates when scheduling; stored on the appointment
- **Data Consistency:** All DTOs now match the database models for patient, nurse, admin, and appointment APIs (including GeoJSON for location fields)

## Documentation

- [Account Deletion API](docs/account-deletion-api.md)
- [File Upload API](docs/file-upload-api.md)
- [Nurse Assignment API](docs/nurse-assignment-api.md)
- [Improvements & Changelog](docs/IMPROVEMENTS.md)
- [Messaging Service](docs/MESSAGING_SERVICE.md)

## License

MIT
"# api"
