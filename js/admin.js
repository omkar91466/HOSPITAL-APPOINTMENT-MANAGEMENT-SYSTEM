document.addEventListener('DOMContentLoaded', () => {
  const themeButton = document.querySelector('#adminThemeToggle');
  const savedTheme = localStorage.getItem('carepoint-theme');

  if (savedTheme === 'dark') document.body.classList.add('dark-mode');
  updateThemeLabel();

  themeButton?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('carepoint-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateThemeLabel();
  });

  const search = document.querySelector('#appointmentSearch');
  const filter = document.querySelector('#statusFilter');
  const rows = [...document.querySelectorAll('#appointmentRows tr')];

  function filterRows() {
    const query = search.value.toLowerCase().trim();
    const selectedStatus = filter.value;
    rows.forEach((row) => {
      const matchesSearch = row.textContent.toLowerCase().includes(query);
      const matchesStatus = selectedStatus === 'all' || row.dataset.status === selectedStatus;
      row.hidden = !matchesSearch || !matchesStatus;
    });
  }

  search?.addEventListener('input', filterRows);
  filter?.addEventListener('change', filterRows);

  document.querySelectorAll('.row-action').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('#adminMessage').textContent = 'Appointment management is ready to connect to your database.';
    });
  });

  document.querySelector('#addAppointment')?.addEventListener('click', () => {
    document.querySelector('#adminMessage').textContent = 'Use the patient dashboard to create an appointment request.';
    document.querySelector('#appointments').scrollIntoView({ behavior: 'smooth' });
  });

  function updateThemeLabel() {
    themeButton.textContent = document.body.classList.contains('dark-mode') ? 'Light' : 'Dark';
  }
});
