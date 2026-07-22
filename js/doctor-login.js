/**
 * Doctor login page logic
 * - Handles form validation
 * - Shows error messages from URL params
 * - Password visibility toggle
 */
document.addEventListener('DOMContentLoaded', () => {
  // Show error message from URL if present
  const message = new URLSearchParams(location.search).get('message');
  const status = document.querySelector('.form-status');
  if (message && status) {
    status.className = 'form-status error';
    status.textContent = message;
  }

  // Password visibility toggle
  document.querySelectorAll('.doctor-toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      button.textContent = isPassword ? 'Hide' : 'Show';
    });
  });

  // Form validation
  document.querySelector('#doctorLoginForm')?.addEventListener('submit', (event) => {
    const form = event.currentTarget;
    if (form.checkValidity()) return;
    event.preventDefault();
    const statusElement = form.querySelector('.form-status');
    if (statusElement) {
      statusElement.className = 'form-status error';
      statusElement.textContent = 'Please complete all required fields correctly.';
    }
    form.reportValidity();
  });
});

