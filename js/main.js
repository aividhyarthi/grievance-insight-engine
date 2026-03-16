/* ============================================
   DhvaniAI - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 600);
    });
    // Fallback: hide preloader after 3s max
    setTimeout(() => preloader.classList.add('hidden'), 3000);

    // Navbar scroll behavior
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = navbar.offsetHeight + 20;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Animated counter
    function animateCounter(el, target, duration) {
        let start = 0;
        const increment = target / (duration / 16);
        const isDecimal = target % 1 !== 0;

        function step() {
            start += increment;
            if (start >= target) {
                el.textContent = target.toLocaleString();
                return;
            }
            el.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(step);
        }
        step();
    }

    // Counter observer
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('[data-count]');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-count'), 10);
                    animateCounter(counter, target, 2000);
                });
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    // Observe hero stats and results
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) counterObserver.observe(heroStats);

    const resultsGrid = document.querySelector('.results-grid');
    if (resultsGrid) counterObserver.observe(resultsGrid);

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Show success message
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);

            // Log form data (replace with actual form submission endpoint)
            console.log('Form submitted:', data);
        });
    }

    // Parallax effect for hero glows
    window.addEventListener('mousemove', (e) => {
        const glows = document.querySelectorAll('.hero-glow');
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        glows.forEach((glow, i) => {
            const factor = (i + 1) * 0.5;
            glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });
});
