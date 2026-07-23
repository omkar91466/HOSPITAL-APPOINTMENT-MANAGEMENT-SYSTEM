document.addEventListener('DOMContentLoaded', () => {
  // Current year for copyright
  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Scroll-triggered animations using IntersectionObserver
  const animTargets = document.querySelectorAll('.animate-in, .animate-in-left, .animate-in-right, .animate-scale');

  if (animTargets.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    animTargets.forEach((el) => observer.observe(el));
  }
});
