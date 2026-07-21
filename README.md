# CarePoint Hospital Appointment System

CarePoint is a responsive PHP and MySQL website for patient registration, secure login, and appointment booking.

## Features

- Responsive home, services, doctor profiles, about, and contact pages.
- Patient registration and password-hashed sign-in.
- Patient dashboard with live appointment list and appointment notes.
- Server-side validation, prepared queries, sessions, and secure logout.
- MySQL database schema with doctor and appointment relationships.

## Run locally

1. Import `database/hospital.sql` in MySQL.
2. Update the MySQL credentials in `php/config.php`.
3. Serve the project with PHP, for example: `php -S localhost:8000`.
4. Open `http://localhost:8000/index.html` and create a patient account.

> If you imported the previous database schema, add `notes VARCHAR(500) NULL` to the `appointments` table or recreate the database with the updated SQL script.
