document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu');
  const navigation = document.querySelector('#site-navigation');
  const savedTheme = localStorage.getItem('carepoint-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  addThemeToggle();
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

  function addThemeToggle() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.addEventListener('click', () => {
      const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      setTheme(nextTheme);
      localStorage.setItem('carepoint-theme', nextTheme);
      updateThemeButton(button);
    });
    const toggleContainer = header || document.body;
    toggleContainer.insertBefore(button, header ? (menuButton || navigation) : toggleContainer.firstChild);
    updateThemeButton(button);
  }

  function setTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
  }

  function updateThemeButton(button) {
    button.textContent = document.body.classList.contains('dark-mode') ? 'Light' : 'Dark';
  }
});
