// ==================== //
// F1 Intro Sequence     //
// Clean & Minimal       //
// ==================== //

// Initialize Lenis for smooth scrolling
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
}

// Lenis initialization in shared.js will skip this if already initialized

const introOverlay = document.getElementById('intro-overlay');
const introLogo = document.querySelector('.intro-logo');
const introLine = document.querySelector('.intro-line');
const introStripes = document.querySelectorAll('.stripe');
const introStripesContainer = document.querySelector('.intro-stripes');
const introBracu = document.querySelector('.intro-bracu');
const introLogoWhite = document.querySelector('.intro-logo-white');
const introWindContainer = document.getElementById('intro-wind');
const introAudio = document.getElementById('intro-audio');
const introLoader = document.getElementById('intro-loader');

// Create wind streak particle
function createWindStreak() {
    if (!introWindContainer) return;

    const streak = document.createElement('div');
    streak.className = 'wind-streak';

    const width = Math.random() * 150 + 50;
    const y = Math.random() * 100;
    const duration = Math.random() * 0.4 + 0.5;

    streak.style.width = width + 'px';
    streak.style.top = y + '%';
    streak.style.right = '-' + width + 'px';
    streak.style.animationDuration = duration + 's';

    introWindContainer.appendChild(streak);

    setTimeout(() => streak.remove(), duration * 1000);
}

// Wind particles interval
let windInterval;

// Run intro sequence
function runIntroSequence() {
    // Attempt to play audio
    if (introAudio) {
        introAudio.volume = 0.5;
        introAudio.currentTime = 0;
        introAudio.play().catch(e => console.log("Audio play failed (autoplay policy):", e));
    }

    // Start wind particles
    windInterval = setInterval(createWindStreak, 100);

    // Animate the speedometer counter
    const speedElement = document.getElementById('loader-speed');
    const gaugeSvg = document.getElementById('gauge-svg');

    if (speedElement && gaugeSvg) {
        // Configuration
        const cx = 100, cy = 100, radius = 80;
        const startAngle = 150; // Bottom Left (degrees)
        const endAngle = 390;   // Bottom Right (degrees, 150 + 240 sweep)
        const totalSweep = endAngle - startAngle;
        const maxSpeed = 180;

        // --- Generate Gauge Face ---
        // Helper to get coordinates
        const getCoords = (angle, r) => {
            const rad = (angle * Math.PI) / 180;
            return {
                x: cx + r * Math.cos(rad),
                y: cy + r * Math.sin(rad)
            };
        };

        // Create Progress Path (Background & Foreground)
        // We describe an arc from startAngle to endAngle
        const describeArc = (x, y, r, start, end) => {
            const startPt = getCoords(start, r);
            const endPt = getCoords(end, r);
            const largeArc = end - start <= 180 ? "0" : "1";
            return [
                "M", startPt.x, startPt.y,
                "A", r, r, 0, largeArc, 1, endPt.x, endPt.y
            ].join(" ");
        };

        // Add Background Arc (Outer rim)
        const bgArcPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        bgArcPath.setAttribute("d", describeArc(cx, cy, 90, startAngle, endAngle)); // Slightly outer
        bgArcPath.setAttribute("class", "gauge-progress-bg");
        gaugeSvg.appendChild(bgArcPath);

        // Add Foreground Arc (The filling bar)
        const fgArcPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // Path length for dasharray calculation
        // Radius 90. Circumference = 2 * PI * 90 = 565.5
        // Arc is 240 degrees. Length = 565.5 * (240/360) = 377
        const fgRadius = 90;
        const fgArcLength = (2 * Math.PI * fgRadius) * (totalSweep / 360);

        fgArcPath.setAttribute("d", describeArc(cx, cy, fgRadius, startAngle, endAngle));
        fgArcPath.setAttribute("class", "gauge-progress-fg");
        fgArcPath.style.strokeDasharray = fgArcLength;
        fgArcPath.style.strokeDashoffset = fgArcLength; // Start empty
        gaugeSvg.appendChild(fgArcPath);


        // Generate Ticks and Labels
        const majorStep = 20;
        const minorStep = 5; // 4 minor ticks between majors

        for (let s = 0; s <= maxSpeed; s += minorStep) {
            const progress = s / maxSpeed;
            const angle = startAngle + (progress * totalSweep);
            const isMajor = s % majorStep === 0;

            // Inner and Outer radii for ticks
            const rOuter = 85;
            const rInner = isMajor ? 70 : 80; // Major ticks longer

            const p1 = getCoords(angle, rInner);
            const p2 = getCoords(angle, rOuter);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", p1.x);
            line.setAttribute("y1", p1.y);
            line.setAttribute("x2", p2.x);
            line.setAttribute("y2", p2.y);
            line.setAttribute("class", isMajor ? "gauge-tick-major" : "gauge-tick-minor");
            gaugeSvg.appendChild(line);

            // Labels
            if (isMajor) {
                const rText = 58; // Position text inside ticks
                const pText = getCoords(angle, rText);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", pText.x);
                text.setAttribute("y", pText.y);
                text.setAttribute("class", "gauge-label");
                text.textContent = s;
                gaugeSvg.appendChild(text);
            }
        }


        // IMPORTANT: Move SVG Needle/Progress logic to top of this block so we have 'fgArcPath' reference
        // Actually, we can reference it below.

        let currentSpeed = 0;
        const targetSpeed = 120;
        const duration = 6000; // 6 seconds
        const appStartTime = performance.now();

        const animateSpeed = (currentTime) => {
            const elapsed = currentTime - appStartTime;
            const progress = Math.min(elapsed / duration, 1);

            // Eased acceleration curve
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            // Fluctuation
            const fluctuation = Math.sin(elapsed / 100) * 3 * progress;
            currentSpeed = Math.floor(easedProgress * targetSpeed + fluctuation);
            currentSpeed = Math.max(0, currentSpeed);

            speedElement.textContent = currentSpeed;

            // Animate Bar Stroke
            // Map 0-maxSpeed to 0-fgArcLength
            // Actually, we just need the ratio of currentSpeed / maxSpeed (180, not 120 target)
            // Wait, the gauge goes to 180. But our target speed is 120 (intro speed).
            // So the bar should only fill part way.

            // Real progress on the dial (0-1)
            const dialProgress = Math.min(currentSpeed / maxSpeed, 1);

            const currentOffset = fgArcLength - (dialProgress * fgArcLength);
            fgArcPath.style.strokeDashoffset = currentOffset;

            if (progress < 1) {
                requestAnimationFrame(animateSpeed);
            } else {
                speedElement.textContent = targetSpeed; // Remove the '+' for this design
            }
        };

        requestAnimationFrame(animateSpeed);
    }

    // At 6 seconds: Stripes expand + background transitions to dark + hide loader
    setTimeout(() => {
        clearInterval(windInterval);

        // Hide the loading indicator
        if (introLoader) {
            introLoader.classList.add('hidden');
        }

        introStripesContainer.classList.add('engulf');
        introStripes.forEach(stripe => {
            stripe.classList.add('engulf');
        });

        // Transition background to dark with fluid animation
        introOverlay.classList.add('dark-bg');

        // Shake on engulf
        introOverlay.classList.add('shake');
        setTimeout(() => introOverlay.classList.remove('shake'), 500);
    }, 6000);

    // At 6.8 seconds: Show "Bracu Presents" and "Oshsharohi" logo
    setTimeout(() => {
        introLogo.classList.add('visible');
        introBracu.classList.add('inverted');
        introLogoWhite.classList.add('inverted');
        introOverlay.classList.add('shake');
        setTimeout(() => introOverlay.classList.remove('shake'), 500);
    }, 6800);

    // Show line shortly after logo
    setTimeout(() => {
        introLine.classList.add('visible');
    }, 7100);

    // Fade out after 3 seconds of displaying logo (6.8s + 3s = 9.8s)
    setTimeout(() => {
        // Audio Fade Out
        if (introAudio) {
            const fadeAudio = setInterval(() => {
                if (introAudio.volume > 0.05) {
                    introAudio.volume -= 0.05;
                } else {
                    introAudio.volume = 0;
                    introAudio.pause();
                    clearInterval(fadeAudio);
                }
            }, 100); // Reduce volume every 100ms
        }

        introOverlay.classList.add('fade-out');

        setTimeout(() => {
            introOverlay.remove();
        }, 1800);
    }, 9800);
}

// Always scroll to top on page load
window.scrollTo(0, 0);

// Check if intro should play (only on FIRST visit, not when navigating back)
// Check if intro should play (only on FIRST visit, not when navigating back)
// Check if intro should play (only on FIRST visit, not when navigating back)
const hasSeenIntro = sessionStorage.getItem('oshsharohi_intro_seen');
const cockpitOverlay = document.getElementById('cockpit-overlay');
const paddleBtn = document.getElementById('cockpit-paddle');

// Audio unlock function - will be triggered by ANY user interaction
let audioUnlocked = false;

const startExperience = () => {
    console.log("Cockpit Paddle Clicked");
    if (audioUnlocked) return;

    // 1. Play Audio
    if (introAudio) {
        introAudio.volume = 0.5;
        introAudio.currentTime = 0;
        introAudio.play().then(() => {
            audioUnlocked = true;
        }).catch(e => {
            console.log("Audio autoplay blocked even after interaction:", e);
        });
    }

    // 2. Animate Cockpit Out
    if (cockpitOverlay) {
        cockpitOverlay.classList.add('hidden');
        // Match CSS transition time (1.5s)
        setTimeout(() => cockpitOverlay.remove(), 1500);
    }

    // 3. Mark as seen
    sessionStorage.setItem('oshsharohi_intro_seen', 'true');

    // 4. Start Intro Sequence
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    // Initial small delay for smooth transition
    setTimeout(runIntroSequence, 500);

    // Enable scrolling after intro
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = '';
    }, 12000); // 11800 + 200 buffer
};

if (!hasSeenIntro) {
    // Show Cockpit
    // Cockpit is visible by default in HTML/CSS, just ensure other things are waiting
    document.body.style.overflow = 'hidden'; // Lock scroll

    if (paddleBtn) {
        paddleBtn.addEventListener('click', startExperience);
        paddleBtn.addEventListener('touchstart', startExperience);
    }

} else {
    // Already seen: Hide Cockpit & Intro immediately
    if (cockpitOverlay) cockpitOverlay.style.display = 'none';
    if (introOverlay) {
        introOverlay.style.display = 'none';
        introOverlay.remove();
    }
    document.body.style.overflow = '';
}


// Header Scroll Effect
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Department Expand/Collapse
document.querySelectorAll('.department[data-expandable]').forEach(dept => {
    const header = dept.querySelector('.department-header');
    if (header) {
        header.addEventListener('click', () => {
            // Close other departments
            document.querySelectorAll('.department[data-expandable].expanded').forEach(other => {
                if (other !== dept) other.classList.remove('expanded');
            });
            // Toggle this one
            dept.classList.toggle('expanded');
        });
    }
});

// Member Modal Functionality
const memberModal = document.getElementById('memberModal');
const modalPhoto = document.getElementById('modalPhoto');
const modalName = document.getElementById('modalName');
const modalRole = document.getElementById('modalRole');
const modalDept = document.getElementById('modalDept');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = memberModal ? memberModal.querySelector('.modal-backdrop') : null;

// Open modal on member card click
document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', () => {
        const photo = card.querySelector('.member-photo');
        const name = card.querySelector('.member-name');
        const role = card.querySelector('.member-role');
        const dept = card.closest('.department').querySelector('h3');

        if (modalPhoto && photo) modalPhoto.src = photo.src;
        if (modalPhoto && name) modalPhoto.alt = name.textContent;
        if (modalName && name) modalName.textContent = name.textContent;
        if (modalRole && role) modalRole.textContent = role.textContent;
        if (modalRole && !role) modalRole.textContent = 'Team Member';
        if (modalDept && dept) modalDept.textContent = dept.textContent;

        memberModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Close modal
function closeMemberModal() {
    memberModal.classList.remove('active');
    document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeMemberModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeMemberModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && memberModal && memberModal.classList.contains('active')) {
        closeMemberModal();
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
}

// Smooth Scroll for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Animate Stats on Scroll with easing
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        element.textContent = Math.floor(easedProgress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach((stat, index) => {
                const target = parseInt(stat.getAttribute('data-target'));
                if (target) {
                    setTimeout(() => {
                        animateValue(stat, 0, target, 2500);
                    }, index * 200);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const visionStats = document.querySelector('.vision-stats');
if (visionStats) {
    statsObserver.observe(visionStats);
}

// Scroll Reveal Animation with stagger
const revealElements = document.querySelectorAll('.vision-card, .department, .spec-item, .project-card');

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

// Enhanced Particle Effect for Hero
const particlesContainer = document.getElementById('particles');

if (particlesContainer) {
    const particleCount = 40;
    const particles = [];

    const createParticle = () => {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const startX = Math.random() * 100;
        const startY = 100 + Math.random() * 20;
        const duration = 4 + Math.random() * 4;
        const delay = Math.random() * 2;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(227, 6, 19, 0.8), rgba(227, 6, 19, 0.2));
            border-radius: 50%;
            pointer-events: none;
            left: ${startX}%;
            top: ${startY}%;
            box-shadow: 0 0 ${size * 3}px rgba(227, 6, 19, 0.5);
            animation: particleRise ${duration}s ease-out ${delay}s infinite;
        `;
        particlesContainer.appendChild(particle);
        particles.push(particle);
    };

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }

    // Dynamic particle keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleRise {
            0% {
                opacity: 0;
                transform: translateY(0) translateX(0) scale(1);
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 0.5;
            }
            100% {
                opacity: 0;
                transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 80}px) scale(0.5);
            }
        }
    `;
    document.head.appendChild(style);
}

// Parallax effect on hero image
const heroImg = document.getElementById('hero-img');
let ticking = false;

if (heroImg) {
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const rate = scrolled * 0.4;
                heroImg.style.transform = `translateY(${rate}px) scale(${1 + scrolled * 0.0003})`;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Mouse tracking for card glow effect
document.querySelectorAll('.vision-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
    });
});

// Cursor glow effect
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

// Hide cursor glow when mouse leaves window
document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursorGlow.style.opacity = '0.3';
});

// Typewriter effect for hero heading
const heroHeading = document.querySelector('.hero h1');
if (heroHeading) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroHeading.classList.add('visible');
            }
        });
    });
    observer.observe(heroHeading);
}

// Magnetic button effect
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

// Specs counter animation
const specItems = document.querySelectorAll('.spec-item');
const specObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const value = entry.target.querySelector('.spec-value');
            if (value) {
                const text = value.textContent;
                const num = parseFloat(text);
                if (!isNaN(num)) {
                    let current = 0;
                    const increment = num / 60;
                    const isDecimal = text.includes('.');
                    const animate = () => {
                        current += increment;
                        if (current < num) {
                            value.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                            requestAnimationFrame(animate);
                        } else {
                            value.textContent = text;
                        }
                    };
                    animate();
                }
            }
            specObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

specItems.forEach(item => specObserver.observe(item));

// Tilt effect on project card
const projectCard = document.querySelector('.project-card');
if (projectCard) {
    projectCard.addEventListener('mousemove', (e) => {
        const rect = projectCard.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        projectCard.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });

    projectCard.addEventListener('mouseleave', () => {
        projectCard.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
    });
}

// Form Handling with animations
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        console.log('Form submitted:', formData);

        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        // Animated success state
        btn.style.transition = 'all 0.4s ease';
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#10b981';
        btn.style.borderColor = '#10b981';
        btn.style.transform = 'scale(1.05)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.transform = '';
            contactForm.reset();
        }, 3000);
    });
}

// Section title animation
const sectionTitles = document.querySelectorAll('.section-title');
const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'titleSlide 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }
    });
}, { threshold: 0.5 });

sectionTitles.forEach(title => {
    title.style.opacity = '0';
    title.style.transform = 'translateX(-30px)';
    titleObserver.observe(title);
});

// Add title animation keyframes
const titleStyle = document.createElement('style');
titleStyle.textContent = `
    @keyframes titleSlide {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(titleStyle);

// Smooth scroll progress indicator
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #e30613, #ff4444);
    z-index: 9999;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(227, 6, 19, 0.5);
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

// Preloader (optional - shows loading animation)
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

console.log('🏎️ OSHSHAROHI Website Loaded - Ready to Race!');
