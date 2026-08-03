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

  const revealItems = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealItems.forEach((item) => revealObserver.observe(item));

  // Dark mode toggle
  const darkToggle = document.querySelector('#darkModeToggle');
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) { document.body.classList.add('dark-mode'); if (darkToggle) darkToggle.textContent = '☀️'; }
  darkToggle?.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', String(isDarkMode));
    darkToggle.textContent = isDarkMode ? '☀️' : '🌙';
  });

  // Doctor profile modal
  const modal = document.querySelector('#doctorModal');
  const modalImg = document.querySelector('#modalDoctorImg');
  const modalName = document.querySelector('#modalDoctorName');
  const modalSpecialty = document.querySelector('#modalDoctorSpecialty');
  const modalExperience = document.querySelector('#modalDoctorExperience');
  const modalDescription = document.querySelector('#modalDoctorDescription');
  const modalEmail = document.querySelector('#modalDoctorEmail');
  const modalClose = document.querySelector('.modal-close');
  const modalBookBtn = document.querySelector('#modalBookBtn');

  const openModal = (doctor) => {
    modalImg.src = `images/doctor${doctor.id}.jpg`;
    modalImg.alt = doctor.name;
    modalName.textContent = doctor.name;
    modalSpecialty.textContent = doctor.specialty.toUpperCase();
    modalExperience.textContent = `${doctor.experience_years} years of experience`;
    modalDescription.textContent = doctor.description || '';
    modalEmail.textContent = `📧 ${doctor.email}`;
    modalBookBtn.href = `login.html?doctor=${doctor.id}`;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Trigger reflow for transition
    void modal.offsetWidth;
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Click on doctor cards
  document.querySelectorAll('.doctor-card').forEach((card) => {
    card.addEventListener('click', () => {
      const doctorId = card.getAttribute('data-id');
      if (!doctorId) return;

      // Fetch doctor details from backend
      fetch(`php/get-doctor.php?id=${doctorId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Doctor not found');
          return res.json();
        })
        .then((data) => openModal(data))
        .catch((err) => {
          console.error('Failed to load doctor profile:', err);
          // Fallback: use static card data
          const img = card.querySelector('img');
          const nameEl = card.querySelector('h3');
          const specialtyEl = card.querySelector('p');
          const expEl = card.querySelector('span');
          openModal({
            id: doctorId,
            name: nameEl?.textContent || 'Doctor',
            specialty: specialtyEl?.textContent || 'Specialist',
            experience_years: parseInt(expEl?.textContent) || 0,
            email: 'contact@carepoint.com',
          });
          if (img) modalImg.src = img.src;
        });
    });
  });

  // Close on × button
  modalClose?.addEventListener('click', closeModal);

  // Close on overlay click (click outside modal-content)
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
});

