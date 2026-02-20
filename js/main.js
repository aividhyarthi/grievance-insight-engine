/* ============================
   AppStudioX – Main JavaScript
   ============================ */

'use strict';

/* ---- Logo fallback: show branded initial when Clearbit logo fails ---- */
window.tickerLogoFallback = function(img) {
  const char  = (img.alt || img.closest('.ticker-item, .trust-logo-item')?.querySelector('span')?.textContent || '?').trim().charAt(0).toUpperCase();
  const palette = ['#6366F1','#7C3AED','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#8B5CF6','#06B6D4','#F97316'];
  const color = palette[char.charCodeAt(0) % palette.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'><rect width='22' height='22' rx='5' fill='${color}'/><text x='11' y='16' text-anchor='middle' font-family='system-ui,sans-serif' font-size='12' font-weight='700' fill='white'>${char}</text></svg>`;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  img.onerror = null;
};

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

/* ---- Chat widget auto-hint after 30s ---- */
(function initChatHint() {
  setTimeout(() => {
    const hint = document.getElementById('chatHint');
    const widget = document.getElementById('chatWidget');
    if (!hint || !widget) return;
    hint.classList.add('show');
    setTimeout(() => hint.classList.remove('show'), 6000);
  }, 30000);
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
    btn.querySelector('span').textContent = 'Sending…';
    btn.disabled = true;

    const data = new FormData(form);
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() })
      .then(() => {
        form.reset();
        btn.querySelector('span').textContent = 'Send My Brief';
        btn.disabled = false;
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      })
      .catch(() => {
        btn.querySelector('span').textContent = 'Send My Brief';
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

/* ---- AI Chat Widget ---- */
(function initChatWidget() {
  const STEPS = [
    {
      id: 'brand',
      message: "Hi! I'm Sara, AppStudioX's AI Growth Strategist. 👋\n\nI help brands dominate search, build authority, and grow faster. Quick question — what's your brand or company name?",
      type: 'text',
      placeholder: 'Enter your brand name…',
    },
    {
      id: 'website',
      message: (d) => `Lovely to meet you, ${d.brand}! 🚀\n\nWhat's your website URL?`,
      type: 'text',
      placeholder: 'https://yoursite.com',
    },
    {
      id: 'service',
      message: "Which area are you looking to grow? We cover everything from organic search to brand reputation.",
      type: 'quick',
      options: ['SEO & Search Rankings', 'AEO / AI Visibility', 'Content Marketing', 'PR & Branding', 'Reputation Management', 'Growth Strategy'],
    },
    {
      id: 'challenge',
      message: "Got it! What's your biggest challenge right now?",
      type: 'quick',
      options: ['Not ranking on Google', 'Invisible to AI engines', 'Weak content pipeline', 'Negative brand sentiment', 'Low organic traffic', 'No clear growth plan'],
    },
    {
      id: 'goal',
      message: "Understood. What's your primary 12-month goal?",
      type: 'quick',
      options: ['Top 3 on Google', 'AI & AEO Visibility', 'Dominant Brand Authority', 'All of the Above'],
    },
    {
      id: 'email',
      message: (d) => `Love that ambition for ${d.brand}! 🎯\n\nDrop your work email — our senior strategist will reach out personally within 24 hours.`,
      type: 'email',
      placeholder: 'yourname@company.com',
    },
  ];

  const widget    = document.getElementById('chatWidget');
  const toggleBtn = document.getElementById('chatToggle');
  const closeBtn  = document.getElementById('chatClose');
  const chatWin   = document.getElementById('chatWindow');
  const msgsEl    = document.getElementById('chatMessages');
  const inputEl   = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('chatSend');
  const qrEl      = document.getElementById('quickReplies');
  const inputWrap = document.getElementById('chatInputWrap');
  if (!widget) return;

  let step = 0, data = {}, isOpen = false, hasGreeted = false;

  toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWin.classList.toggle('open', isOpen);
    toggleBtn.classList.toggle('active', isOpen);
    if (isOpen && !hasGreeted) { hasGreeted = true; setTimeout(startConversation, 500); }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chatWin.classList.remove('open');
    toggleBtn.classList.remove('active');
  });

  function startConversation() { showStep(0); }

  function addMsg(text, who) {
    const d = document.createElement('div');
    d.className = 'chat-msg chat-msg--' + who;
    d.innerHTML = text.replace(/\n/g, '<br>');
    msgsEl.appendChild(d);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'chat-msg chat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgsEl.appendChild(t);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return t;
  }

  function setInput(show, placeholder, type) {
    inputWrap.style.display = show ? 'flex' : 'none';
    if (placeholder) { inputEl.placeholder = placeholder; inputEl.type = type || 'text'; }
  }

  function setQR(options) {
    qrEl.innerHTML = '';
    options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'chat-qr-btn';
      b.textContent = opt;
      b.addEventListener('click', () => { setQR([]); addMsg(opt, 'user'); data[STEPS[step].id] = opt; step++; setTimeout(() => showStep(step), 350); });
      qrEl.appendChild(b);
    });
  }

  function showStep(i) {
    if (i >= STEPS.length) { finishConversation(); return; }
    const s = STEPS[i];
    const t = showTyping();
    setTimeout(() => {
      t.remove();
      addMsg(typeof s.message === 'function' ? s.message(data) : s.message, 'bot');
      if (s.type === 'quick') { setQR(s.options); setInput(false); }
      else { setQR([]); setInput(true, s.placeholder, s.type); setTimeout(() => inputEl.focus(), 50); }
    }, 750);
  }

  function handleSend() {
    const val = inputEl.value.trim();
    if (!val) return;
    const s = STEPS[step];
    if (s.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      inputEl.style.borderColor = '#EF4444';
      inputEl.value = '';
      inputEl.placeholder = 'Please enter a valid email…';
      setTimeout(() => { inputEl.style.borderColor = ''; inputEl.placeholder = 'yourname@company.com'; }, 2000);
      return;
    }
    addMsg(val, 'user');
    data[s.id] = val;
    inputEl.value = '';
    step++;
    setTimeout(() => showStep(step), 350);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });

  function finishConversation() {
    const payload = new URLSearchParams(Object.assign({ 'form-name': 'chat-lead' }, data));
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload.toString() }).catch(() => {});
    const t = showTyping();
    setTimeout(() => {
      t.remove();
      addMsg(
        `You're all set, ${data.brand || 'there'}! ✨<br><br>` +
        `Our senior strategist will personally review your brief and reach out to <strong>${data.email}</strong> within 24 hours.<br><br>` +
        `Expect something genuinely useful — not a pitch deck.`,
        'bot'
      );
      setInput(false);
      setQR([]);
    }, 1000);
  }
})();
