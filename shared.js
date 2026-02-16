// Shared Navigation & Page Transitions
// OSHSHAROHI Multi-Page Website

// Initialize Lenis for smooth scrolling (Global)
// Initialize Lenis for smooth scrolling (Global)
if (typeof Lenis !== 'undefined' && !window.lenis) {
    window.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
} else {
    console.warn("Lenis library not loaded. Smooth scrolling disabled.");
}

// Page transition on load
document.addEventListener('DOMContentLoaded', () => {
    // Add page wrapper if it doesn't exist
    const main = document.querySelector('main') || document.querySelector('.page-content');
    if (main) {
        main.classList.add('page-enter');
        setTimeout(() => main.classList.add('page-enter-active'), 10);
    }

    // Set active nav item based on current page
    setActiveNavItem();

    // Initialize mobile menu
    initMobileMenu();
});

// Set active navigation item
function setActiveNavItem() {
    // Get current filename
    let path = window.location.pathname;
    let page = path.split('/').pop();

    // Handle root/empty as index.html
    if (page === '' || page === undefined) page = 'index.html';

    // Remove params
    page = page.split('?')[0].split('#')[0];

    // Select all links
    const navLinks = document.querySelectorAll('nav ul li a, .mobile-menu ul li a');

    // 1. Clear all active classes first
    navLinks.forEach(link => link.classList.remove('active'));

    // 2. Add active class based on matching filename
    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Exact match
        if (href === page) {
            link.classList.add('active');
        }

        // Special case: Home
        // If we are on index.html, also highlight '/' or './' or 'index.html'
        if (page === 'index.html') {
            if (href === 'index.html' || href === './' || href === '/') {
                link.classList.add('active');
            }
        }
    });

    // 3. Fallback: If nothing is active and we are on home path (checking body/title?), force Home link
    // (Usually step 2 covers it, but let's be sure)
    const somethingActive = document.querySelector('nav a.active');
    if (!somethingActive && page === 'index.html') {
        const homeLink = document.querySelector('nav ul li a[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }
}

// Initialize mobile menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Smooth page transition when clicking nav links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    // Only handle internal page links (not anchors or external)
    if (href && href.endsWith('.html') && !href.startsWith('http')) {
        e.preventDefault();

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const targetPage = href;

        // Check if clicking the same page
        const isSamePage = (currentPage === targetPage) ||
            (currentPage === '' && targetPage === 'index.html') ||
            (currentPage === 'index.html' && targetPage === 'index.html');

        if (isSamePage) {
            // Same page - show eye-catching transition animation
            playSamePageTransition();

            // Ensure this link is active (just in case)
            document.querySelectorAll('nav a, .mobile-menu a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        } else {
            // Different page - active state immediate feedback
            document.querySelectorAll('nav a, .mobile-menu a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Different page - normal transition
            const main = document.querySelector('main') || document.querySelector('.page-content') || document.querySelector('.hero');
            if (main) {
                main.classList.add('page-exit');

                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            } else {
                window.location.href = href;
            }
        }
    }
});

// Eye-catching same-page transition animation
function playSamePageTransition() {
    // Create flash overlay
    const flash = document.createElement('div');
    flash.className = 'page-flash-transition';
    flash.innerHTML = `
        <div class="flash-line flash-line-1"></div>
        <div class="flash-line flash-line-2"></div>
        <div class="flash-line flash-line-3"></div>
        <div class="flash-center"></div>
    `;
    document.body.appendChild(flash);

    // Trigger animation
    requestAnimationFrame(() => {
        flash.classList.add('active');
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Remove flash after animation
    setTimeout(() => {
        flash.classList.add('fade-out');
        setTimeout(() => {
            flash.remove();
        }, 300);
    }, 500);

    // Pulse the content
    const main = document.querySelector('main') || document.querySelector('.page-content') || document.querySelector('.hero');
    if (main) {
        main.classList.add('page-pulse');
        setTimeout(() => main.classList.remove('page-pulse'), 600);
    }
}

// Header scroll effect (shared)
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Cursor glow effect (shared) - skip on touch-only devices
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (!isTouchDevice) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);

    let cursorX = 0, cursorY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    const animateCursor = () => {
        glowX += (cursorX - glowX) * 0.1;
        glowY += (cursorY - glowY) * 0.1;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorGlow.style.opacity = '0.3';
    });
}

// Scroll reveal animation
const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.vision-card, .department, .spec-item, .project-card, .preview-card');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        revealObserver.observe(el);
    });
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initScrollReveal);

// Scroll progress indicator
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress-bar';
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #e30613, #ff4444);
    z-index: 9999;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(227, 6, 19, 0.5);
    width: 0%;
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
});
