document.addEventListener('DOMContentLoaded', () => {
  const panels = document.querySelectorAll('.auth-panel > div[id]');
  const showPanel = (panelId) => {
    panels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.id !== panelId);
    });
  };
  const message = new URLSearchParams(location.search).get('message');
  const messageType = new URLSearchParams(location.search).get('type');
  const status = document.querySelector('.form-status');
  if (message && status) {
    status.className = messageType === 'success' ? 'form-status' : 'form-status error';
    status.textContent = message;
  }

  // Pre-select doctor from query param (from doctor modal "Book" button)
  const doctorParam = new URLSearchParams(location.search).get('doctor');
  if (doctorParam) {
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'doctor_param';
      hiddenInput.value = doctorParam;
      loginForm.appendChild(hiddenInput);
    }
  }

  document.querySelectorAll('[data-show-panel]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showPanel(link.dataset.showPanel);
    history.replaceState(null, '', `#${link.dataset.showPanel === 'registerPanel' ? 'register' : 'login'}`);
  }));
  if (location.hash === '#register') showPanel('registerPanel');
  document.querySelectorAll('.toggle-password').forEach((button) => button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? 'Hide' : 'Show';
  }));
  document.querySelectorAll('.auth-panel form').forEach((form) => form.addEventListener('submit', (event) => {
    if (form.checkValidity()) return;
    event.preventDefault();
    const statusElement = form.querySelector('.form-status');
    if (statusElement) {
      statusElement.className = 'form-status error';
      statusElement.textContent = 'Please complete all required fields correctly.';
    }
    form.reportValidity();
  }));
});
