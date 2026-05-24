// ===== DOM Elements =====
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// ===== Mobile Navigation Toggle =====
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== Navbar Scroll Effect (Auto-hide/show) =====
let lastScroll = 0;
let isNavbarVisible = true;
let navbarTimeout = null;
let isHoveringNearTop = false;

// Show navbar when mouse is near the top of the page
document.addEventListener('mousemove', (e) => {
    if (e.clientY < 120) {
        if (!isHoveringNearTop && !isNavbarVisible) {
            showNavbar();
        }
        isHoveringNearTop = true;

        // Clear timeout when hovering near top
        if (navbarTimeout) {
            clearTimeout(navbarTimeout);
            navbarTimeout = null;
        }
    } else {
        isHoveringNearTop = false;
    }
});

function showNavbar() {
    if (!isNavbarVisible) {
        isNavbarVisible = true;
        navbar.style.transform = 'translateX(-50%) translateY(0)';
        navbar.style.opacity = '1';
        navbar.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
    }
}

function hideNavbar() {
    if (isNavbarVisible && !isHoveringNearTop) {
        isNavbarVisible = false;
        navbar.style.transform = 'translateX(-50%) translateY(-150%)';
        navbar.style.opacity = '0';
        navbar.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s ease';
    }
}

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add/remove navbar background on scroll
    if (currentScroll > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.05)';
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(108, 99, 255, 0.1)';
    }

    // Auto-hide navbar when scrolling down, show when scrolling up
    if (currentScroll > 300) {
        if (currentScroll > lastScroll && !isHoveringNearTop) {
            hideNavbar();
        } else if (currentScroll < lastScroll) {
            showNavbar();
        }
    } else {
        showNavbar();
    }

    // Auto-hide navbar after 3 seconds of no interaction when not near top
    if (!isHoveringNearTop && currentScroll > 100) {
        if (navbarTimeout) clearTimeout(navbarTimeout);
        navbarTimeout = setTimeout(() => {
            if (!isHoveringNearTop && isNavbarVisible) {
                hideNavbar();
            }
        }, 3000);
    }

    lastScroll = currentScroll;
});

// Always show navbar when hovering over it
navbar.addEventListener('mouseenter', () => {
    showNavbar();
    isHoveringNearTop = true;
    if (navbarTimeout) {
        clearTimeout(navbarTimeout);
        navbarTimeout = null;
    }
});

navbar.addEventListener('mouseleave', () => {
    isHoveringNearTop = false;
});

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Add staggered animation delay for children
            const children = entry.target.querySelectorAll('.glass-card, .timeline-item');
            children.forEach((child, index) => {
                child.style.animationDelay = `${index * 0.1}s`;
                child.classList.add('animate-fade-in');
            });
        }
    });
}, observerOptions);

// Observe sections and cards
document.querySelectorAll('section').forEach(section => {
    section.classList.add('scroll-animate');
    observer.observe(section);
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Typing Effect for Hero (Optional Enhancement) =====
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ===== Particle Effect on Mouse Move (Subtle) =====
document.addEventListener('mousemove', (e) => {
    const blobs = document.querySelectorAll('.blob');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    blobs.forEach((blob, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;

        blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});

// ===== Active Navigation Link Based on Current Page =====
(function () {
    const href = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === href) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
})();

// ===== Form Validation (for Contact Page) =====
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }

        // Email validation
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                input.classList.add('error');
            }
        }
    });

    return isValid;
}

// ===== Contact Form Submission (Formspree Integration) =====
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm(this)) {
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(this);
            const response = await fetch('https://formspree.io/f/mlgarkqn', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                this.reset();
            } else {
                showNotification('Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            showNotification('Network error. Please check your connection.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(0, 212, 170, 0.9)' : type === 'error' ? 'rgba(245, 87, 108, 0.9)' : 'rgba(108, 99, 255, 0.9)'};
        backdrop-filter: blur(10px);
        border-radius: 12px;
        color: white;
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Close button functionality
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== Parallax Effect for Background Blobs =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const blobs = document.querySelectorAll('.blob');

    blobs.forEach((blob, index) => {
        const speed = 0.05 * (index + 1);
        blob.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== Cursor Trail Effect (Optional - for premium feel) =====
// Only enable on devices that support hover (not touch devices)
if (window.matchMedia('(hover: hover)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(108, 99, 255, 0.5);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
        transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        const ease = 0.15;
        cursorX += (mouseX - cursorX) * ease;
        cursorY += (mouseY - cursorY) * ease;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Enlarge cursor on hover over interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .glass-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.background = 'rgba(108, 99, 255, 0.1)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.background = 'transparent';
        });
    });
}

// ===== Page Load Animation =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Animate hero elements
    const heroElements = document.querySelectorAll('.hero-text > *');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';

        setTimeout(() => {
            el.style.transition = 'all 0.5s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 200);
    });
});

// ===== Utility: Debounce Function =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Utility: Throttle Function =====
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== FAQ Accordion =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
            }
        });

        // Toggle current item
        item.classList.toggle('active');
    });
});

// ===== Featured Projects Marquee =====
(function () {
    const track   = document.getElementById('marqueeTrack');
    const dotsWrap = document.getElementById('marqueeDots');
    if (!track || !dotsWrap) return;

    let isDragging  = false;
    let startX      = 0;
    let scrollLeft  = 0;

    // --- Navigation dots (pause / resume) ---
    const dot = document.createElement('button');
    dot.className = 'marquee-dot active';
    dot.setAttribute('aria-label', 'Pause or resume marquee');
    dot.addEventListener('click', () => {
        const running = track.style.animationPlayState !== 'paused';
        track.style.animationPlayState = running ? 'paused' : 'running';
        dot.classList.toggle('active', !running);
        dot.setAttribute('aria-label', running ? 'Resume marquee' : 'Pause marquee');
    });
    dotsWrap.appendChild(dot);

    // --- Drag / touch swipe to nudge the track ---
    track.addEventListener('mousedown',  onDragStart);
    track.addEventListener('touchstart', onDragStart, { passive: true });

    track.addEventListener('mousemove',  onDragMove);
    track.addEventListener('touchmove',  onDragMove, { passive: true });

    track.addEventListener('mouseup',    onDragEnd);
    track.addEventListener('mouseleave', onDragEnd);
    track.addEventListener('touchend',   onDragEnd);

    function onDragStart(e) {
        isDragging = true;
        track.classList.add('dragging');
        const pt = e.touches ? e.touches[0] : e;
        startX = pt.clientX - track.offsetLeft;
        scrollLeft = getCurrentTranslateX();
    }

    function onDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const pt = e.touches ? e.touches[0] : e;
        const dx = pt.clientX - startX;
        track.style.transform = `translateX(${scrollLeft + dx}px)`;
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('dragging');
        // Snap back to the CSS animation
        requestAnimationFrame(() => {
            track.style.transform = '';
            track.style.animationPlayState = 'running';
        });
    }

    function getCurrentTranslateX() {
        const style = window.getComputedStyle(track);
        const matrix = new DOMMatrix(style.transform);
        return matrix.m41;
    }

    // --- Respect prefers-reduced-motion ---
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        track.style.animation = 'none';
    }
})();

// ===== Initialize =====
console.log('Portfolio loaded successfully!');
