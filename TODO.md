# Doctor Login & Dashboard Accessibility

## Steps

- [x] 1. **Add "Doctor" option in Access level dropdown** in `login.html` (alongside Patient & Administrator)
- [x] 2. **Update `php/login.php`** to handle doctor authentication — validates against `doctors` table, starts doctor session, redirects to `doctor-dashboard.html`
- [x] 3. **Remove all separate "Staff login" links** from `index.html` (nav, footer, hero)
- [x] 4. **Remove separate doctor login panel** from `login.html` — doctor login is now just a dropdown option
- [x] 5. **Clean up** `css/style.css` (remove unused `.hero-staff-link`), `css/login.css` (remove unused `.doctor-switch`/`.button-doctor`), `js/login.js` (remove unused `#doctor` hash handler), `php/doctor-logout.php` (redirect to plain `login.html`)

## All steps completed! 🎉

