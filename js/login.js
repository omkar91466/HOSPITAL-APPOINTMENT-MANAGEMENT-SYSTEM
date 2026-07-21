document.addEventListener('DOMContentLoaded', () => {
  const panels = document.querySelectorAll('.auth-panel > div[id]');
  const showPanel = (panelId) => {
    panels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.id !== panelId);
    });
  };
  const message = new URLSearchParams(location.search).get('message');
  if (message) {
    const status = document.querySelector('#loginPanel .form-status');
    status.className = 'form-status error';
    status.textContent = message;
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
    const status = form.querySelector('.form-status');
    status.className = 'form-status error';
    status.textContent = 'Please complete all required fields correctly.';
    form.reportValidity();
  }));
});
