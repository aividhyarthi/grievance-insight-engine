// ==========================================
// AI Vidhyarthi - Main JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', function () {

    // ------------------------------------------
    // Navbar scroll effect
    // ------------------------------------------
    const navbar = document.getElementById('navbar');

    function handleNavScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();

    // ------------------------------------------
    // Mobile nav toggle
    // ------------------------------------------
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // ------------------------------------------
    // Smooth scroll for anchor links
    // ------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                var offset = navbar.offsetHeight + 20;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // ------------------------------------------
    // Counter animation (Intersection Observer)
    // ------------------------------------------
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current = Math.floor(eased * target);

            if (target >= 1000) {
                el.textContent = current.toLocaleString('en-IN');
            } else {
                el.textContent = current;
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (target >= 1000) {
                    el.textContent = target.toLocaleString('en-IN');
                } else {
                    el.textContent = target;
                }
            }
        }

        requestAnimationFrame(step);
    }

    var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var counters = entry.target.querySelectorAll('[data-target]');
                counters.forEach(function (counter) {
                    if (!counter.classList.contains('counted')) {
                        counter.classList.add('counted');
                        animateCounter(counter);
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    // Observe hero stats
    var heroStats = document.querySelector('.hero-stats');
    if (heroStats) counterObserver.observe(heroStats);

    // Observe impact section
    var impactGrid = document.querySelector('.impact-grid');
    if (impactGrid) counterObserver.observe(impactGrid);

    // ------------------------------------------
    // Scroll reveal animation
    // ------------------------------------------
    var revealElements = document.querySelectorAll(
        '.mission-card, .program-card, .testimonial-card, .impact-card, ' +
        '.value-item, .about-content, .contact-grid, .cta-content, .impact-map'
    );

    revealElements.forEach(function (el) {
        el.classList.add('reveal');
    });

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(function (el) {
        revealObserver.observe(el);
    });

    // ------------------------------------------
    // Active nav link on scroll
    // ------------------------------------------
    var sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        var scrollPos = window.scrollY + navbar.offsetHeight + 100;

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.querySelectorAll('a').forEach(function (link) {
                    link.classList.remove('active-link');
                });
                var activeLink = navLinks.querySelector('a[href="#' + id + '"]');
                if (activeLink) {
                    activeLink.classList.add('active-link');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // ------------------------------------------
    // Contact form handling
    // ------------------------------------------
    var contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var formData = new FormData(contactForm);
        var data = {};
        formData.forEach(function (value, key) {
            data[key] = value;
        });

        // Show success message
        var btn = contactForm.querySelector('button[type="submit"]');
        var originalText = btn.textContent;
        btn.textContent = 'Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        btn.disabled = true;

        setTimeout(function () {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
            contactForm.reset();
        }, 3000);
    });

    // ------------------------------------------
    // Map dot animations (staggered)
    // ------------------------------------------
    var mapDots = document.querySelectorAll('.map-dot');
    mapDots.forEach(function (dot, index) {
        dot.style.animationDelay = (index * 0.2) + 's';
    });

});
