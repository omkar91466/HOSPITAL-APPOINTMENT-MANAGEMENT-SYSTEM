# Doctor Login & Dashboard + Enhanced Appointment Form + Dark Mode

## Steps

### Accessibility & Navigation
- [x] Add "Staff login" link in header navigation of `index.html`
- [x] Add "Staff login" link in footer of `index.html`
- [x] Add "Staff? Sign in" link in hero area of `index.html`
- [x] Make doctor portal link more prominent on `login.html`

### Dark Mode
- [x] Add dark mode toggle button to header
- [x] Add CSS custom properties for dark mode themes
- [x] Add dark mode JavaScript toggle with localStorage persistence
- [x] Update dashboard CSS for dark mode compatibility

### Enhanced Appointment Form
- [x] **Patient Name (Auto-filled)** — Read-only input auto-filled from session
- [x] **Department (Dropdown)** — Dynamic loading from backend (`php/get-doctors.php`)
- [x] **Doctor Name (Dropdown)** — Filtered by selected department
- [x] **Appointment Date (Date Picker)** — Date-only input with future-date validation
- [x] **Time Slot (Dropdown)** — Predefined time slots from 9 AM to 4 PM
- [x] **Reason for Visit (Textarea)** — Text area with notes
- [x] **Upload Previous Reports (File Upload)** — Optional file with validation (PDF, JPG, PNG, DOC up to 5MB)

### Backend
- [x] `php/get-doctors.php` — API endpoint returning departments and doctors
- [x] `php/appointment.php` — Updated to handle new fields, file upload, time slot validation, conflict check
- [x] `php/db.php` — Auto-migration adds `report_path` column to appointments table
- [x] `uploads/` directory auto-created

## All steps completed! 🎉

