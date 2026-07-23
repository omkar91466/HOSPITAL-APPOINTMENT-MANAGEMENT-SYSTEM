/**
 * CarePoint patient dashboard
 * - Displays patient context and today's date
 * - Loads departments & doctors dynamically
 * - Filters doctors by selected department
 * - Validates new appointment details
 * - Loads upcoming visits from php/dashboard.php
 */
document.addEventListener('DOMContentLoaded', () => {
  const name = new URLSearchParams(location.search).get('name');
  const nameElement = document.querySelector('#patientName');
  const patientNameField = document.querySelector('#patientNameField');

  // Auto-fill patient name
  if (name && nameElement) {
    nameElement.textContent = name;
  }
  if (name && patientNameField) {
    patientNameField.value = name;
  }

  const message = new URLSearchParams(location.search).get('message');
  if (message) {
    const status = document.querySelector('#appointmentForm .form-status');
    status.textContent = message;
    status.className = message.includes('confirmed') ? 'form-status' : 'form-status error';
  }

  // Today's date display
  const now = new Date();
  document.querySelector('#todayDay').textContent = now.toLocaleDateString(undefined, { weekday: 'short' });
  document.querySelector('#todayDate').textContent = now.getDate();
  document.querySelector('#todayMonth').textContent = now.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  // Set min date for date picker to today
  const dateInput = document.querySelector('#appointmentDate');
  if (dateInput) {
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    dateInput.min = today.toISOString().slice(0, 10);
  }

  // ---- Dynamic Department & Doctor loading ----
  const departmentSelect = document.querySelector('#department');
  const doctorSelect = document.querySelector('#doctor');
  let doctorsCache = [];

  // Load departments & doctors
  async function loadDoctorsData() {
    try {
      const response = await fetch('php/get-doctors.php');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load data');

      // Populate departments
      departmentSelect.innerHTML = '<option value="">Select a department</option>';
      data.departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.department;
        option.textContent = dept.department;
        departmentSelect.appendChild(option);
      });

      // Cache doctors
      doctorsCache = data.doctors;
    } catch (error) {
      console.error('Failed to load doctors data:', error);
    }
  }

  // Filter doctors by department
  function filterDoctorsByDepartment(department) {
    doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
    const filtered = department
      ? doctorsCache.filter(doc => doc.specialty === department)
      : doctorsCache;

    filtered.forEach(doc => {
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = `Dr. ${doc.name} — ${doc.specialty} (${doc.experience_years} yrs)`;
      doctorSelect.appendChild(option);
    });
  }

  departmentSelect.addEventListener('change', () => {
    filterDoctorsByDepartment(departmentSelect.value);
  });

  loadDoctorsData();

  // ---- Appointment list ----
  const list = document.querySelector('#appointments');
  const count = document.querySelector('#appointmentCount');
  const emptyMarkup = '<div class="empty-state"><span>📅</span><h3>No upcoming appointments</h3><p>Your scheduled visits will appear here after you book them.</p></div>';
  const formatDate = (value) => new Date(value.replace(' ', 'T')).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  async function loadAppointments() {
    if (!list) return;
    list.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('php/dashboard.php', { headers: { Accept: 'application/json' } });
      if (response.status === 401) {
        window.location.href = 'login.html?message=Please sign in to view your appointments.';
        return;
      }
      if (!response.ok) throw new Error();
      const appointments = await response.json();
      count.textContent = appointments.length;
      list.innerHTML = appointments.length
        ? appointments.map((appointment) => `
          <article class="appointment-item">
            <div class="appointment-main">
              <span class="appointment-avatar">${appointment.doctor.replace('Dr. ', '').split(' ').map(word => word[0]).join('').slice(0, 2)}</span>
              <div>
                <h3>${escapeHtml(appointment.doctor)}</h3>
                <p>${escapeHtml(appointment.specialty)}${appointment.notes ? ' · ' + escapeHtml(appointment.notes) : ''}</p>
              </div>
            </div>
            <div class="appointment-time">
              ${formatDate(appointment.appointment_date)}<br>
              <span class="status-pill">${escapeHtml(appointment.status)}</span>
            </div>
          </article>`).join('')
        : emptyMarkup;
    } catch {
      list.innerHTML = '<div class="empty-state"><span>!</span><h3>Appointments could not load</h3><p>Please refresh the page and try again.</p></div>';
    } finally {
      list.removeAttribute('aria-busy');
    }
  }

  function escapeHtml(value) {
    const element = document.createElement('span');
    element.textContent = value ?? '';
    return element.innerHTML;
  }

  document.querySelector('#refreshAppointments')?.addEventListener('click', loadAppointments);

  // ---- Form validation ----
  document.querySelector('#appointmentForm')?.addEventListener('submit', (event) => {
    const form = event.currentTarget;
    if (form.checkValidity()) return;
    event.preventDefault();
    const status = form.querySelector('.form-status');
    status.className = 'form-status error';
    status.textContent = 'Please fill in all required fields correctly.';
    form.reportValidity();
  });

  loadAppointments();
});

