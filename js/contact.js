document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contactForm');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (!form.checkValidity()) {
      status.className = 'form-status error';
      status.textContent = 'Please complete all required fields correctly.';
      form.reportValidity();
      return;
    }
    const firstName = form.elements.name.value.trim().split(' ')[0] || 'there';
    status.className = 'form-status';
    status.textContent = `Thank you, ${firstName}. Your message has been received.`;
    form.reset();
  });
});
