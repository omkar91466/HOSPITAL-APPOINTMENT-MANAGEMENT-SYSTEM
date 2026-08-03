# Bug Fixes Progress

## 🔴 Critical

- [x] Bug 1: Patient login missing success message — `php/login.php` ✅ Added `'success'` type and welcome message to patient redirect
- [x] Bug 2: Doctor modal "Book" link doesn't pre-select doctor — `js/login.js`, `js/dashboard.js`, `php/login.php` ✅ `doctor` URL param forwarded through login to dashboard
- [x] Bug 3: Admin "Manage" button does nothing — New `php/admin-appointment-update.php` + `admin.js` ✅ Real Complete/Cancel buttons with backend
- [x] Bug 4: Forgot password misleading success — `php/forgot-password.php` ✅ Changed message to "If that email is registered..."
- [x] Bug 5: Dark mode broken on admin/doctor-dashboard CSS — `css/admin.css`, `css/doctor-dashboard.css` ✅ Replaced hardcoded `#fff` with `var(--card-bg)`, added dark mode overrides
- [x] Bug 6: Patients can't see past appointments — `php/dashboard.php` ✅ Removed restrictive `status='scheduled'` filter, now shows all appointments
- [x] Bug 7: Doctors can't see patient report uploads — `php/doctor-dashboard.php` + `js/doctor-dashboard.js` ✅ Added `a.report_path` to query and report link in table
- [x] Bug 8: Registration missing `user_role` — `php/register.php` ✅ Added `$_SESSION['user_role'] = 'user'` + success message

## 🟡 Moderate

- [x] Bug 9: Date card hardcoded color — `css/dashboard.css` ✅ Changed to `var(--accent)`
- [x] Bug 10: Admin sidebar/admin-topbar hardcoded colors — `css/admin.css` ✅ Dark mode overrides added
- [x] Bug 11: Doctor sidebar & profile card hardcoded colors — `css/doctor-dashboard.css` ✅ Dark mode overrides added

