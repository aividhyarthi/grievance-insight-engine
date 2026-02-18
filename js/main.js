/* ============================
   AppStudioX – Main JavaScript
   ============================ */

'use strict';

/* ---- Navbar: scroll behaviour & hamburger ---- */
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
})();

/* ---- Floating action button visibility ---- */
(function initFAB() {
  const fab = document.querySelector('.fab');
  if (!fab) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  }, { passive: true });
})();

/* ---- Reveal on scroll (IntersectionObserver) ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ---- Animated counters ---- */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const isFloat = String(target).includes('.');

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current >= 1000
      ? current.toLocaleString()
      : current;

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target >= 1000 ? target.toLocaleString() : target;
  };
  requestAnimationFrame(step);
}

(function initCounters() {
  // Stats bar counters
  const statEls = document.querySelectorAll('.stat-num[data-target]');
  const metricEls = document.querySelectorAll('.metric-card__num[data-target]');
  const allCounters = [...statEls, ...metricEls];

  if (!allCounters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseFloat(entry.target.dataset.target);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  allCounters.forEach(el => observer.observe(el));
})();

/* ---- Chart.js: Traffic Growth ---- */
(function initTrafficChart() {
  const canvas = document.getElementById('trafficChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = [
    'Month 1','Month 3','Month 6','Month 9','Month 12',
    'Month 15','Month 18','Month 21','Month 24'
  ];

  const data = [100, 115, 145, 195, 265, 305, 345, 380, 420];

  const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, 'rgba(99,102,241,0.35)');
  gradient.addColorStop(1, 'rgba(99,102,241,0.02)');

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Organic Traffic Index',
        data,
        borderColor: '#818CF8',
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.45,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1E293B',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.7)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y}% of baseline`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: 'rgba(255,255,255,0.4)',
            font: { size: 11, family: 'Inter' }
          }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: 'rgba(255,255,255,0.4)',
            font: { size: 11, family: 'Inter' },
            callback: (val) => val + '%'
          },
          min: 0,
        }
      }
    }
  });
})();

/* ---- Chart.js: Metrics Bar Chart ---- */
(function initMetricsChart() {
  const canvas = document.getElementById('metricsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');

  const gradientSEO = ctx.createLinearGradient(0, 0, 0, 280);
  gradientSEO.addColorStop(0, 'rgba(99,102,241,0.9)');
  gradientSEO.addColorStop(1, 'rgba(99,102,241,0.5)');

  const gradientBefore = ctx.createLinearGradient(0, 0, 0, 280);
  gradientBefore.addColorStop(0, 'rgba(255,255,255,0.15)');
  gradientBefore.addColorStop(1, 'rgba(255,255,255,0.05)');

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Organic Traffic', 'Domain Authority', 'Backlink Profile', 'Branded Searches', 'Conversions'],
      datasets: [
        {
          label: 'Before',
          data: [100, 100, 100, 100, 100],
          backgroundColor: gradientBefore,
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'After (24 months)',
          data: [440, 228, 580, 310, 245],
          backgroundColor: gradientSEO,
          borderColor: 'rgba(99,102,241,0.3)',
          borderWidth: 1,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255,255,255,0.6)',
            font: { size: 12, family: 'Inter' },
            boxWidth: 12,
            boxHeight: 12,
            borderRadius: 3,
          }
        },
        tooltip: {
          backgroundColor: '#1E293B',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.7)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y;
              const label = ctx.dataset.label;
              if (label === 'Before') return ` Baseline: 100`;
              return ` After: ${val} (+${val - 100}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: 'rgba(255,255,255,0.4)',
            font: { size: 11, family: 'Inter' }
          }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: 'rgba(255,255,255,0.4)',
            font: { size: 11, family: 'Inter' },
            callback: (val) => val + (val === 100 ? ' (base)' : '%')
          },
          min: 0,
        }
      }
    }
  });
})();

/* ---- Contact Form ---- */
(function initForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');

    // Basic validation
    if (!name.value.trim()) {
      name.focus();
      name.style.borderColor = '#EF4444';
      setTimeout(() => name.style.borderColor = '', 2000);
      return;
    }
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      email.focus();
      email.style.borderColor = '#EF4444';
      setTimeout(() => email.style.borderColor = '', 2000);
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = new FormData(form);
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() })
      .then(() => {
        form.reset();
        btn.textContent = 'Get My Free Growth Audit';
        btn.disabled = false;
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      })
      .catch(() => {
        btn.textContent = 'Get My Free Growth Audit';
        btn.disabled = false;
      });
  });
})();

/* ---- Footer year ---- */
(function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---- Smooth active nav highlighting ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'white'
            : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ---- Testimonials Carousel ---- */
(function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const dotsWrap = document.getElementById('testimonialsDots');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  if (!track) return;

  const cards = Array.from(track.children);
  let current = 0;
  let perView = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 3;
  const total = cards.length;
  const maxIndex = total - perView;

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex; i++) {
      const d = document.createElement('button');
      d.className = 'tdot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    Array.from(dotsWrap.children).forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex));
    const cardWidth = cards[0].offsetWidth + 24; // gap 24px
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  buildDots();

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto-rotate every 4 seconds
  let timer = setInterval(() => goTo(current >= maxIndex ? 0 : current + 1), 4000);

  // Pause on hover
  track.closest('.testimonials__carousel-wrap').addEventListener('mouseenter', () => clearInterval(timer));
  track.closest('.testimonials__carousel-wrap').addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(current >= maxIndex ? 0 : current + 1), 4000);
  });

  // Recalculate on resize
  window.addEventListener('resize', () => {
    perView = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 3;
    goTo(0);
    buildDots();
  });
})();
