/**
 * Doctor dashboard logic
 * - Loads doctor profile & appointments from the backend
 * - Enables search/filter on appointments table
 * - Allows updating appointment status (complete / cancel)
 */
document.addEventListener('DOMContentLoaded', () => {
  const search = document.querySelector('#doctorAppointmentSearch');
  const filter = document.querySelector('#doctorStatusFilter');
  const rowsContainer = document.querySelector('#doctorAppointmentRows');
  const doctorMessage = document.querySelector('#doctorMessage');
  const todayAppointments = document.querySelector('#todayAppointments');
  const totalPatients = document.querySelector('#totalPatients');
  const completedCount = document.querySelector('#completedCount');
  const doctorNameDisplay = document.querySelector('#doctorName');
  const doctorProfileNameDisplay = document.querySelector('#doctorProfileName');
  const doctorSpecialtyDisplay = document.querySelector('#doctorSpecialty');
  const doctorAvatar = document.querySelector('#doctorAvatar');
  const doctorProfileAvatar = document.querySelector('#doctorProfileAvatar');

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&': '&amp;', '<': '<', '>': '>', '"': '"', "'": '&#39;'}[character]));
  
  const formatDate = (value) => {
    const date = new Date(value.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  // Patients display
  const patientsContainer = document.querySelector('#doctorPatientsList');
  const patientsMessage = document.querySelector('#doctorPatientsMessage');

  function renderPatients(appointments) {
    if (!patientsContainer) return;
    
    // Extract unique patients
    const seen = new Set();
    const uniquePatients = [];
    appointments.forEach(a => {
      if (!seen.has(a.patient_email)) {
        seen.add(a.patient_email);
        uniquePatients.push({
          name: a.patient_name,
          email: a.patient_email,
          lastVisit: a.appointment_date,
          status: a.status,
        });
      }
    });

    if (!uniquePatients.length) {
      patientsContainer.innerHTML = '';
      if (patientsMessage) patientsMessage.textContent = 'No patients yet.';
      return;
    }

    if (patientsMessage) patientsMessage.textContent = '';
    patientsContainer.innerHTML = uniquePatients.map(p => `
      <div class="doctor-patient-card">
        <div class="doctor-patient-avatar">${p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div class="doctor-patient-info">
          <strong>${escapeHtml(p.name)}</strong>
          <small>${escapeHtml(p.email)}</small>
        </div>
      </div>
    `).join('');
  }

  let rows = [];

  function filterRows() {
    const query = search?.value.toLowerCase().trim() ?? '';
    const selectedStatus = filter?.value ?? 'all';
    rows.forEach((row) => {
      const matchesSearch = row.textContent.toLowerCase().includes(query);
      const matchesStatus = selectedStatus === 'all' || row.dataset.status === selectedStatus;
      row.hidden = !matchesSearch || !matchesStatus;
    });
  }

  search?.addEventListener('input', filterRows);
  filter?.addEventListener('change', filterRows);

  // Handle appointment status updates via click delegation
  rowsContainer?.addEventListener('click', async (event) => {
    const btn = event.target.closest('.doctor-action-btn');
    if (!btn) return;

    const appointmentId = btn.dataset.id;
    const newStatus = btn.dataset.action;
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = '...';
    doctorMessage.textContent = '';

    try {
      const formData = new URLSearchParams();
      formData.append('appointment_id', appointmentId);
      formData.append('status', newStatus);

      const response = await fetch('php/doctor-appointment-update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Update failed.');

      doctorMessage.textContent = payload.message || 'Appointment updated.';
      // Reload appointments to reflect changes
      loadAppointments();
    } catch (error) {
      doctorMessage.className = 'doctor-message error';
      doctorMessage.textContent = error.message;
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  async function loadAppointments() {
    try {
      const response = await fetch('php/doctor-dashboard.php');
      if (response.status === 401) {
        window.location.href = 'doctor-login.html';
        return;
      }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load data.');

      // Update doctor info
      if (payload.doctor_name) {
        const initials = payload.doctor_name.split(' ').map(w => w[0]).join('').slice(0, 2);
        if (doctorAvatar) doctorAvatar.textContent = initials;
        if (doctorProfileAvatar) doctorProfileAvatar.textContent = initials;
        if (doctorNameDisplay) doctorNameDisplay.textContent = payload.doctor_name;
        if (doctorProfileNameDisplay) doctorProfileNameDisplay.textContent = payload.doctor_name;
      }
      if (doctorSpecialtyDisplay && payload.doctor_specialty) {
        doctorSpecialtyDisplay.textContent = payload.doctor_specialty;
      }

      // Update stats
      if (todayAppointments) todayAppointments.textContent = payload.stats?.todayAppointments ?? '0';
      if (totalPatients) totalPatients.textContent = payload.stats?.totalPatients ?? '0';
      if (completedCount) completedCount.textContent = payload.stats?.completedAppointments ?? '0';

      // Render appointments table
      rowsContainer.innerHTML = '';

      if (!payload.appointments?.length) {
        rowsContainer.innerHTML = '<tr><td colspan="5">No appointments found.</td></tr>';
        rows = [];
        doctorMessage.textContent = 'No appointments available.';
        renderPatients([]);
        return;
      }

      payload.appointments.forEach((appointment) => {
        const row = document.createElement('tr');
        row.dataset.status = appointment.status;
        
        let actionButtons = '';
        if (appointment.status === 'scheduled') {
          actionButtons = `
            <button class="doctor-action-btn complete" data-id="${appointment.id}" data-action="completed">✓ Complete</button>
            <button class="doctor-action-btn cancel" data-id="${appointment.id}" data-action="cancelled">✕ Cancel</button>
          `;
        } else {
          actionButtons = `<span style="color:var(--muted);font-size:11px;">—</span>`;
        }

        const reportLink = appointment.report_path
          ? `<a href="${escapeHtml(appointment.report_path)}" target="_blank" style="color:var(--brand);font-weight:bold;font-size:11px;">📎 View report</a>`
          : '—';
        row.innerHTML = `
          <td><strong>${escapeHtml(appointment.patient_name)}</strong><small>${escapeHtml(appointment.patient_email)}</small></td>
          <td>${escapeHtml(formatDate(appointment.appointment_date))}</td>
          <td>${escapeHtml(appointment.notes || '—')}<br>${reportLink}</td>
          <td><span class="doctor-status ${escapeHtml(appointment.status)}">${escapeHtml(appointment.status)}</span></td>
          <td>${actionButtons}</td>
        `;
        rowsContainer.appendChild(row);
      });

      rows = [...document.querySelectorAll('#doctorAppointmentRows tr')];
      filterRows();
      doctorMessage.textContent = '';
      doctorMessage.className = 'doctor-message';

      // Render unique patients list
      renderPatients(payload.appointments);
    } catch (error) {
      if (doctorMessage) {
        doctorMessage.className = 'doctor-message error';
        doctorMessage.textContent = error.message;
      }
    }
  }

  loadAppointments();
});

