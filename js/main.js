/* ============================================
   DhvaniAI - Main JavaScript
   ============================================ */

// Hide preloader immediately when page is ready
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => preloader.classList.add('hidden'), 500);
    }
});
// Fallback: hide preloader after 2s no matter what
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
}, 2000);

document.addEventListener('DOMContentLoaded', () => {

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

    // ============================================
    // DHVANI CHATBOT
    // ============================================
    const chatToggle = document.getElementById('chatbotToggle');
    const chatWindow = document.getElementById('chatbotWindow');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    const dhvaniResponses = {
        'seo': "We offer AI-powered SEO services that analyze 200+ ranking factors. Our clients see an average 347% increase in organic traffic within 6 months. We handle technical audits, keyword research, on-page optimization, and schema markup. Want to discuss your SEO goals? Email us at seo@dhvaniai.org",
        'aeo': "Answer Engine Optimization (AEO) is our specialty! We optimize your content to appear in AI-generated answers, featured snippets, and voice search results across ChatGPT, Google SGE, Alexa, and more. It's the future of search visibility.",
        'geo': "Generative Engine Optimization (GEO) ensures your brand appears in AI-generated search results and LLM outputs. We build entity authority and optimize your digital footprint for next-gen search experiences.",
        'orm': "Our ORM team monitors your brand across 100+ platforms 24/7. We manage reviews, suppress negative content, handle crisis response, and build a fortress of positive sentiment around your brand.",
        'link': "We build high-authority backlinks from DA 50-90+ websites. Our strategies include guest posts, digital PR, niche edits, and HARO placements. Quality over quantity - always.",
        'content': "Our AI-assisted content team creates SEO-optimized blog posts, articles, press releases, and thought leadership pieces. We also handle media publishing on top-tier industry websites.",
        'social': "We manage social media across all major platforms - strategy, content calendars, paid campaigns, influencer collaborations, and analytics-driven optimization to build your community.",
        'youtube': "YouTube SEO is huge for visibility. We optimize video keywords, thumbnails, CTR strategy, and create algorithm-friendly content that grows your channel organically.",
        'website': "We build lightning-fast, SEO-optimized static and dynamic websites. From landing pages to complex web apps - all built for conversions and performance.",
        'podcast': "We handle podcast production and strategic news placement on major media outlets. Audio content is a powerful way to build brand authority.",
        'price': "Our pricing depends on the scope and services you need. We offer customized packages for every budget. Reach out to us at seo@dhvaniai.org or ai@dhvaniai.org and we'll create a tailored proposal for you.",
        'contact': "You can reach us at:\n- Email: seo@dhvaniai.org | ai@dhvaniai.org\n- Offices: Bangalore, India & United States\n\nOr fill out the contact form on this page and we'll get back to you within 24 hours!",
        'team': "We have 30+ human marketing experts (SEO strategists, content writers, PR managers, developers, and more) working alongside 20 purpose-built AI agents. It's the perfect blend of creativity and precision.",
        'clients': "We've had the privilege of working with Times Group, Network18, Amazon, Cars24, BYJU'S Aakash Institute, Fort Frontier, CoffeeMug, SportsKeeda, Earthiness, Exclusively, Interakt, and many more.",
        'default': "Thanks for your message! I'm Dhvani, DhvaniAI's virtual assistant. I can help you learn about our services - SEO, AEO, GEO, ORM, link building, content creation, social media, YouTube SEO, and more. What would you like to know?"
    };

    function addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = 'chat-message ' + type;
        msg.textContent = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addQuickReplies(replies) {
        const container = document.createElement('div');
        container.className = 'chat-quick-replies';
        replies.forEach(r => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply';
            btn.textContent = r.label;
            btn.addEventListener('click', () => {
                container.remove();
                addMessage(r.label, 'user');
                setTimeout(() => addMessage(r.response, 'bot'), 500);
            });
            container.appendChild(btn);
        });
        chatMessages.appendChild(container);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getBotResponse(input) {
        const lower = input.toLowerCase();
        if (lower.match(/seo|search engine|ranking|organic|keyword/)) return dhvaniResponses.seo;
        if (lower.match(/aeo|answer engine|voice search|featured snippet/)) return dhvaniResponses.aeo;
        if (lower.match(/geo|generative|llm|ai search|ai overview/)) return dhvaniResponses.geo;
        if (lower.match(/orm|reputation|review|brand monitor|crisis/)) return dhvaniResponses.orm;
        if (lower.match(/link|backlink|da |guest post|digital pr/)) return dhvaniResponses.link;
        if (lower.match(/content|article|blog|press release|pr /)) return dhvaniResponses.content;
        if (lower.match(/social|instagram|facebook|linkedin|twitter/)) return dhvaniResponses.social;
        if (lower.match(/youtube|video|channel/)) return dhvaniResponses.youtube;
        if (lower.match(/website|web dev|landing page|app/)) return dhvaniResponses.website;
        if (lower.match(/podcast|news|audio|media/)) return dhvaniResponses.podcast;
        if (lower.match(/price|cost|package|budget|quote/)) return dhvaniResponses.price;
        if (lower.match(/contact|email|phone|reach|office|location/)) return dhvaniResponses.contact;
        if (lower.match(/team|employee|staff|people|agent/)) return dhvaniResponses.team;
        if (lower.match(/client|brand|portfolio|work/)) return dhvaniResponses.clients;
        if (lower.match(/hi|hello|hey|good|thanks|thank/)) return "Hey there! I'm Dhvani, your AI assistant at DhvaniAI. How can I help you today? Ask me about our SEO, AEO, ORM, link building, or any of our digital marketing services!";
        return dhvaniResponses.default;
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        chatInput.value = '';
        setTimeout(() => {
            addMessage(getBotResponse(text), 'bot');
        }, 600);
    }

    if (chatToggle && chatWindow) {
        // Initial greeting when chat opens
        let chatOpened = false;
        let chatVisible = false;
        const chatIcon = chatToggle.querySelector('.chat-icon');
        const closeIcon = chatToggle.querySelector('.close-icon');

        chatToggle.addEventListener('click', () => {
            chatVisible = !chatVisible;
            if (chatVisible) {
                chatWindow.style.display = 'flex';
                if (chatIcon) chatIcon.style.display = 'none';
                if (closeIcon) closeIcon.style.display = 'block';
            } else {
                chatWindow.style.display = 'none';
                if (chatIcon) chatIcon.style.display = 'block';
                if (closeIcon) closeIcon.style.display = 'none';
            }

            if (!chatOpened) {
                chatOpened = true;
                setTimeout(() => {
                    addMessage("Hi! I'm Dhvani, your AI assistant at DhvaniAI. How can I help you today?", 'bot');
                    setTimeout(() => {
                        addQuickReplies([
                            { label: 'SEO Services', response: dhvaniResponses.seo },
                            { label: 'AEO / GEO', response: dhvaniResponses.aeo },
                            { label: 'Link Building', response: dhvaniResponses.link },
                            { label: 'Our Clients', response: dhvaniResponses.clients },
                        ]);
                    }, 600);
                }, 300);
            }
        });

        chatSend.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }
});
