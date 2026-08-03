document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contactForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    if (!form.checkValidity()) {
      status.className = 'form-status error';
      status.textContent = 'Please complete all required fields correctly.';
      form.reportValidity();
      return;
    }
    // Disable button while submitting
    button.disabled = true;
    button.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';
    try {
      const response = await fetch(form.action, {
        method: form.method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      const data = await response.json();
      if (data.success) {
        status.className = 'form-status';
        status.textContent = data.message;
        form.reset();
      } else {
        status.className = 'form-status error';
        status.textContent = data.message || 'Something went wrong. Please try again.';
      }
    } catch (err) {
      status.className = 'form-status error';
      status.textContent = 'Network error. Please check your connection and try again.';
    } finally {
      button.disabled = false;
      button.innerHTML = 'Send message <span>→</span>';
    }
  });
});
