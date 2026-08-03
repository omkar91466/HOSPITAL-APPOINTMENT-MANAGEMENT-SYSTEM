/**
 * CarePoint patient dashboard
 * - Displays patient context and today's date
 * - Loads departments & doctors dynamically
 * - Filters doctors by selected department
 * - Validates new appointment details
 * - Loads upcoming visits from php/dashboard.php
 */
document.addEventListener('DOMContentLoaded', () => {
  const nameElement = document.querySelector('#patientName');
  const patientNameField = document.querySelector('#patientNameField');

  // Auto-fill patient name — try URL param first, then fetch from session
  function fillPatientName(name) {
    if (name && nameElement) nameElement.textContent = name;
    if (name && patientNameField) patientNameField.value = name;
  }

  const urlName = new URLSearchParams(location.search).get('name');
  if (urlName) {
    fillPatientName(urlName);
  } else {
    // On refresh or direct access, fetch name from session
    fetch('php/get-current-user.php')
      .then(r => {
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then(data => {
        if (data.name) fillPatientName(data.name);
      })
      .catch(() => {
        // Not logged in — leave field empty, form validation will prompt
      });
  }

  const urlParams = new URLSearchParams(location.search);
  const message = urlParams.get('message');
  const messageType = urlParams.get('type');
  if (message) {
    const status = document.querySelector('#appointmentForm .form-status');
    status.textContent = message;
    status.className = messageType === 'success' ? 'form-status' : 'form-status error';
  }

  // Pre-select doctor from URL param (forwarded from login after booking via doctor modal)
  const doctorParam = urlParams.get('doctor');
  let pendingDoctorId = doctorParam;

  // Today's date display
  const now = new Date();
  document.querySelector('#todayDay').textContent = now.toLocaleDateString(undefined, { weekday: 'short' });
  document.querySelector('#todayDate').textContent = now.getDate();
  document.querySelector('#todayMonth').textContent = now.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  // Set min date for date picker to today
  const dateInput = document.querySelector('#appointmentDate');
  const timeSlotSelect = document.querySelector('#timeSlot');
  const departmentSelect = document.querySelector('#department');
  const doctorSelect = document.querySelector('#doctor');
  let doctorsCache = [];
  const timeSlotValues = ['09:00', '11:00', '13:00', '15:00'];

  function showTimeSlotsFor(dateStr, doctorId) {
    // First show all time slot options
    timeSlotSelect.querySelectorAll('option[value]').forEach(opt => {
      if (opt.value) opt.hidden = false;
    });

    if (!dateStr || !doctorId) return; // No filtering needed

    const isToday = dateStr === new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();
    const currentMin = new Date().getMinutes();

    // Hide past time slots if today
    if (isToday) {
      timeSlotSelect.querySelectorAll('option[value]').forEach(opt => {
        if (!opt.value) return;
        const [slotHour, slotMin] = opt.value.split(':').map(Number);
        if (slotHour < currentHour || (slotHour === currentHour && slotMin <= currentMin)) {
          opt.hidden = true;
        }
      });
    }

    // Fetch and hide already-booked slots
    fetch(`php/get-booked-slots.php?doctor_id=${doctorId}&date=${dateStr}`)
      .then(r => r.json())
      .then(data => {
        const bookedSlots = data.booked_slots || [];
        timeSlotSelect.querySelectorAll('option[value]').forEach(opt => {
          if (opt.value && bookedSlots.includes(opt.value)) {
            opt.hidden = true;
          }
        });
      })
      .catch(() => {}); // Silently fail, options remain visible
  }

  if (dateInput) {
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const todayStr = today.toISOString().slice(0, 10);
    dateInput.min = todayStr;

    dateInput.addEventListener('change', () => {
      showTimeSlotsFor(dateInput.value, doctorSelect.value);
    });
  }

  // ---- Dynamic Department & Doctor loading ----
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
      // Populate doctor dropdown immediately with all doctors
      filterDoctorsByDepartment(departmentSelect.value);
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
      option.textContent = `${doc.name} — ${doc.specialty} (${doc.experience_years} yrs)`;
      doctorSelect.appendChild(option);
    });

    // If there's a pending pre-selection, select it after populating
    if (pendingDoctorId && filtered.some(doc => doc.id == pendingDoctorId)) {
      doctorSelect.value = pendingDoctorId;
      pendingDoctorId = null;
      // Also trigger time slot refresh for this doctor
      showTimeSlotsFor(dateInput?.value, doctorSelect.value);
    }
  }

  departmentSelect.addEventListener('change', () => {
    filterDoctorsByDepartment(departmentSelect.value);
    // Show all time slots (reset) since doctor changed
    showTimeSlotsFor(dateInput?.value, '');
  });

  // Re-filter time slots when doctor selection changes
  doctorSelect.addEventListener('change', () => {
    showTimeSlotsFor(dateInput?.value, doctorSelect.value);
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

