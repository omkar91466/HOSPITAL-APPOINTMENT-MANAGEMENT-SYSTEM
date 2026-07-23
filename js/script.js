document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu');
  const navigation = document.querySelector('#site-navigation');
  const updateHeader = () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  menuButton?.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    });
  });

  // Dark mode toggle
  const darkToggle = document.querySelector('#darkModeToggle');
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) { document.body.classList.add('dark-mode'); if (darkToggle) darkToggle.textContent = '☀️'; }
  darkToggle?.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', String(isDarkMode));
    darkToggle.textContent = isDarkMode ? '☀️' : '🌙';
  });
});

