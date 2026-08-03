document.addEventListener('DOMContentLoaded', () => {
  const search = document.querySelector('#appointmentSearch');
  const filter = document.querySelector('#statusFilter');
  const rowsContainer = document.querySelector('#appointmentRows');
  const adminMessage = document.querySelector('#adminMessage');
  const todayAppointments = document.querySelector('#todayAppointments');
  const createAdminForm = document.querySelector('#createAdminForm');
  const createAdminMessage = document.querySelector('#createAdminMessage');

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
  const formatDate = (value) => {
    const date = new Date(value.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

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

  rowsContainer?.addEventListener('click', async (event) => {
    const btn = event.target.closest('.admin-action-btn');
    if (!btn) return;

    const appointmentId = btn.dataset.id;
    const newStatus = btn.dataset.action;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '...';
    adminMessage.textContent = '';

    try {
      const formData = new URLSearchParams();
      formData.append('appointment_id', appointmentId);
      formData.append('status', newStatus);

      const response = await fetch('php/admin-appointment-update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Update failed.');

      adminMessage.textContent = payload.message || 'Appointment updated.';
      adminMessage.className = 'admin-message';
      loadAppointments();
    } catch (error) {
      adminMessage.textContent = error.message;
      adminMessage.className = 'admin-message';
      adminMessage.style.color = '#b33b3b';
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  document.querySelector('#addAppointment')?.addEventListener('click', () => {
    adminMessage.textContent = 'Use the patient dashboard to create a new appointment request.';
    document.querySelector('#appointments').scrollIntoView({ behavior: 'smooth' });
  });

  createAdminForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(createAdminForm);
    createAdminMessage.textContent = 'Creating admin account...';

    try {
      const response = await fetch('php/create-admin.php', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create admin account.');
      createAdminMessage.textContent = payload.message || 'Admin account created.';
      createAdminForm.reset();
    }
    catch (error) {
      createAdminMessage.textContent = error.message;
    }
  });

  async function loadAppointments() {
    try {
      const response = await fetch('php/admin.php');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load appointments.');

      if (todayAppointments) todayAppointments.textContent = payload.stats?.todayAppointments ?? '0';
      rowsContainer.innerHTML = '';

      if (!payload.appointments?.length) {
        rowsContainer.innerHTML = '<tr><td colspan="5">No appointments have been booked yet.</td></tr>';
        rows = [];
        adminMessage.textContent = payload.message || 'No appointments available.';
        return;
      }

      payload.appointments.forEach((appointment) => {
        const row = document.createElement('tr');
        row.dataset.status = appointment.status;
        let actionButtons = '';
        if (appointment.status === 'scheduled') {
          actionButtons = `
            <button class="admin-action-btn" data-id="${appointment.id}" data-action="completed" style="border:0;padding:4px 8px;border-radius:4px;background:#dff4e9;color:#247c5d;font-size:11px;font-weight:bold;cursor:pointer;">✓ Complete</button>
            <button class="admin-action-btn" data-id="${appointment.id}" data-action="cancelled" style="border:0;padding:4px 8px;border-radius:4px;background:#fae6e6;color:#a95050;font-size:11px;font-weight:bold;cursor:pointer;">✕ Cancel</button>
          `;
        } else {
          actionButtons = `<span style="color:var(--muted);font-size:11px;">—</span>`;
        }
        row.innerHTML = `
          <td><strong>${escapeHtml(appointment.patient_name)}</strong><small>${escapeHtml(appointment.patient_email)}</small></td>
          <td><strong>${escapeHtml(appointment.doctor_name)}</strong><small>${escapeHtml(appointment.doctor_specialty)}</small></td>
          <td>${escapeHtml(formatDate(appointment.appointment_date))}</td>
          <td><span class="admin-status ${escapeHtml(appointment.status)}">${escapeHtml(appointment.status)}</span></td>
          <td>${actionButtons}</td>
        `;
        rowsContainer.appendChild(row);
      });

      rows = [...document.querySelectorAll('#appointmentRows tr')];
      filterRows();
      adminMessage.textContent = payload.message || 'Showing all appointments from the database.';
    }
    catch (error) {
      if (adminMessage) adminMessage.textContent = error.message;
    }
  }

  loadAppointments();
});
