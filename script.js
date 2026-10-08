/**
 * Christina Perera - Portfolio Interactive Logic
 * Handles the Retro Pixel Welcome Modal, Web Audio Synth, Sparkles, and Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const welcomeOkBtn = document.getElementById('welcomeOkBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const reopenModalBtn = document.getElementById('reopenModalBtn');
  const footerModalReplayBtn = document.getElementById('footerModalReplayBtn');
  const customPhotoInput = document.getElementById('customPhotoInput');
  const profileImage = document.getElementById('profileImage');
  const emailCard = document.getElementById('emailCard');
  const toastNotification = document.getElementById('toastNotification');
  const sparklesContainer = document.getElementById('sparklesContainer');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const siteHeader = document.querySelector('.site-header');

  /* ----------------------------------------------------
     1. Web Audio Synth - Retro 8-Bit Chime
     ---------------------------------------------------- */
  function playRetroChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Three ascending arpeggio notes (cute Game Boy style)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const startTime = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 8-bit square or triangle wave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

        gain.gain.setValueAtTime(0.12, startTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + idx * 0.08);
        osc.stop(startTime + idx * 0.08 + 0.24);
      });
    } catch (e) {
      // Audio not permitted or supported, fail silently
      console.log('Audio init deferred:', e);
    }
  }

  /* ----------------------------------------------------
     2. Modal Control: Dismiss and Reopen
     ---------------------------------------------------- */
  function closeWelcomeModal() {
    playRetroChime();
    welcomeOverlay.classList.add('hidden');
    // Save state for session if needed, but allow replay anytime
    sessionStorage.setItem('hasSeenWelcome', 'true');
  }

  function openWelcomeModal() {
    welcomeOverlay.classList.remove('hidden');
  }

  // "OK" button from Welcome Pop-up
  if (welcomeOkBtn) {
    welcomeOkBtn.addEventListener('click', closeWelcomeModal);
  }

  // Top right 'X' button
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeWelcomeModal);
  }

  // Replay buttons
  if (reopenModalBtn) {
    reopenModalBtn.addEventListener('click', openWelcomeModal);
  }

  if (footerModalReplayBtn) {
    footerModalReplayBtn.addEventListener('click', openWelcomeModal);
  }

  // Keyboard shortcut to close (Escape / Enter)
  document.addEventListener('keydown', (e) => {
    if (!welcomeOverlay.classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        closeWelcomeModal();
      }
    }
  });

  /* ----------------------------------------------------
     3. Twinkling Background Sparkles (Matching Pic 2)
     ---------------------------------------------------- */
  function createSparkles() {
    if (!sparklesContainer) return;
    const sparkleCount = 20;
    const symbols = ['✦', '✧', '⋆', '･ﾟ'];

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'floating-sparkle';
      sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      
      const left = Math.random() * 96;
      const top = Math.random() * 96;
      const duration = 3 + Math.random() * 3.5;
      const delay = Math.random() * 4;
      const size = 10 + Math.random() * 14;

      sparkle.style.left = `${left}vw`;
      sparkle.style.top = `${top}vh`;
      sparkle.style.fontSize = `${size}px`;
      sparkle.style.animationDuration = `${duration}s`;
      sparkle.style.animationDelay = `${delay}s`;

      sparklesContainer.appendChild(sparkle);
    }
  }

  createSparkles();

  /* ----------------------------------------------------
     4. Custom Photo Upload & Persistence (Hero & About)
     ---------------------------------------------------- */
  // Load saved photo if existing in localStorage
  const savedPhoto = localStorage.getItem('christina_portfolio_avatar');
  if (savedPhoto && profileImage) {
    profileImage.src = savedPhoto;
  }

  if (customPhotoInput && profileImage) {
    customPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          profileImage.src = event.target.result;
          try {
            localStorage.setItem('christina_portfolio_avatar', event.target.result);
          } catch (err) {
            console.warn('Storage limit reached, photo loaded in memory only.');
          }
          showToast('Profile photo updated successfully! ✨');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // About Me Section Custom Photo
  const aboutPhotoInput = document.getElementById('aboutPhotoInput');
  const aboutImage = document.getElementById('aboutImage');
  const savedAboutPhoto = localStorage.getItem('christina_about_avatar');
  if (savedAboutPhoto && aboutImage) {
    aboutImage.src = savedAboutPhoto;
  }

  if (aboutPhotoInput && aboutImage) {
    aboutPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          aboutImage.src = event.target.result;
          try {
            localStorage.setItem('christina_about_avatar', event.target.result);
          } catch (err) {
            console.warn('Storage limit reached, photo loaded in memory only.');
          }
          showToast('About Me photo updated successfully! ✦');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* ----------------------------------------------------
     4b. Dynamic Vertical Carousel Synchronization
     ---------------------------------------------------- */
  const carouselTrack = document.getElementById('verticalCarouselTrack');
  const carouselWindow = document.querySelector('.vertical-carousel-window');
  
  function syncCarouselHeight() {
    if (carouselTrack && carouselWindow) {
      const firstItem = carouselTrack.querySelector('.carousel-role-item');
      if (firstItem) {
        const itemHeight = firstItem.getBoundingClientRect().height;
        if (itemHeight > 0) {
          carouselWindow.style.height = `${itemHeight}px`;
        }
      }
    }
  }

  window.addEventListener('resize', syncCarouselHeight);
  // Initial sync after fonts have loaded
  if (document.fonts) {
    document.fonts.ready.then(syncCarouselHeight);
  } else {
    setTimeout(syncCarouselHeight, 300);
  }

  /* ----------------------------------------------------
     5. Email Quick Copy & CV Download Toast
     ---------------------------------------------------- */
  window.showToast = function(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  };

  const downloadCvBtn = document.getElementById('downloadCvBtn');
  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', () => {
      showToast('Downloading Christina Perera CV! 💜✨');
    });
  }

  if (emailCard) {
    emailCard.addEventListener('click', (e) => {
      const email = 'christinaperera@example.com';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          showToast(`Copied ${email} to clipboard! 💜`);
        }).catch(() => {
          showToast(`Opening mailto for ${email}`);
        });
      }
    });
  }

  /* ----------------------------------------------------
     6. Header Scroll Effect & Mobile Nav
     ---------------------------------------------------- */
  window.addEventListener('scroll', () => {
    if (siteHeader) {
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
  });

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    // Close menu when clicking links
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  /* ----------------------------------------------------
     7. Projects Filter Tabs Interactivity
     ---------------------------------------------------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-clean-card');

  if (filterTabs.length > 0 && projectCards.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        projectCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('card-hidden');
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(() => {
              card.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 30);
          } else {
            card.classList.add('card-hidden');
          }
        });
      });
    });
  }
});
