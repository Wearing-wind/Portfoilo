// ===== DOM Elements =====
document.body.classList.add('js-loaded');
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// ===== Mobile Layout Check =====
function isMobileLayout() {
    return window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches;
}

// ===== Mobile Navigation Toggle (for desktop fallback if needed) =====
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        if (navMenu) navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle) navToggle.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    });
});

// ===== Navbar Scroll & Mobile App Dock Interaction =====
let lastScroll = 0;
let isNavbarVisible = true;
let navbarTimeout = null;
let isHoveringNearTop = false;
let mobileInteractionTimeout = null;

// Show desktop navbar
function showNavbar() {
    if (isMobileLayout()) return;
    if (!isNavbarVisible) {
        isNavbarVisible = true;
        navbar.style.transform = 'translateX(-50%) translateY(0)';
        navbar.style.opacity = '1';
        navbar.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
    }
}

// Hide desktop navbar
function hideNavbar() {
    if (isMobileLayout()) return;
    if (isNavbarVisible && !isHoveringNearTop) {
        isNavbarVisible = false;
        navbar.style.transform = 'translateX(-50%) translateY(-150%)';
        navbar.style.opacity = '0';
        navbar.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s ease';
    }
}

// Show navbar when mouse is near the top of the page (Desktop only)
document.addEventListener('mousemove', (e) => {
    if (isMobileLayout()) return;
    if (e.clientY < 120) {
        if (!isHoveringNearTop && !isNavbarVisible) {
            showNavbar();
        }
        isHoveringNearTop = true;

        if (navbarTimeout) {
            clearTimeout(navbarTimeout);
            navbarTimeout = null;
        }
    } else {
        isHoveringNearTop = false;
    }
});

function handleScrollOrInteraction() {
    const currentScroll = window.pageYOffset;

    if (isMobileLayout()) {
        // Clear any desktop inline transforms
        navbar.style.transform = '';
        navbar.style.opacity = '';
        navbar.style.background = '';
        navbar.style.boxShadow = '';

        // Mobile App Dock: minimize during scrolling / touch interaction
        navbar.classList.add('minimized');

        if (mobileInteractionTimeout) clearTimeout(mobileInteractionTimeout);
        mobileInteractionTimeout = setTimeout(() => {
            if (window.pageYOffset < 50) {
                navbar.classList.remove('minimized');
            }
        }, 1200);

        return;
    }

    // DESKTOP SCROLL BEHAVIOR
    navbar.classList.remove('minimized');

    if (currentScroll > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.05)';
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(108, 99, 255, 0.1)';
    }

    if (currentScroll > 300) {
        if (currentScroll > lastScroll && !isHoveringNearTop) {
            hideNavbar();
        } else if (currentScroll < lastScroll) {
            showNavbar();
        }
    } else {
        showNavbar();
    }

    if (!isHoveringNearTop && currentScroll > 100) {
        if (navbarTimeout) clearTimeout(navbarTimeout);
        navbarTimeout = setTimeout(() => {
            if (!isHoveringNearTop && isNavbarVisible) {
                hideNavbar();
            }
        }, 3000);
    }

    lastScroll = currentScroll;
}

window.addEventListener('scroll', handleScrollOrInteraction, { passive: true });
window.addEventListener('touchmove', handleScrollOrInteraction, { passive: true });

// Always expand mobile navbar on direct touch / tap interaction
if (navbar) {
    navbar.addEventListener('touchstart', () => {
        if (isMobileLayout()) {
            navbar.classList.remove('minimized');
        }
    }, { passive: true });

    navbar.addEventListener('mouseenter', () => {
        if (!isMobileLayout()) {
            showNavbar();
            isHoveringNearTop = true;
            if (navbarTimeout) {
                clearTimeout(navbarTimeout);
                navbarTimeout = null;
            }
        } else {
            navbar.classList.remove('minimized');
        }
    });

    navbar.addEventListener('mouseleave', () => {
        if (!isMobileLayout()) {
            isHoveringNearTop = false;
        }
    });
}

// ===== Scroll Animations & Reveal Fail-Safe =====
const observerOptions = {
    threshold: 0.01,
    rootMargin: '100px 0px 100px 0px' // Expands trigger area to avoid threshold clipping
};

let observer = null;

if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);

                const children = entry.target.querySelectorAll('.glass-card, .timeline-item, .project-detail-card');
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.08}s`;
                    child.classList.add('animate-fade-in');
                });
            }
        });
    }, observerOptions);
}

function initScrollAnimations() {
    const hasHash = window.location.hash && window.location.hash.length > 1;

    document.querySelectorAll('section').forEach(section => {
        if (section.classList.contains('hero')) {
            section.classList.add('visible');
            return;
        }

        section.classList.add('scroll-animate');

        if (hasHash || !observer) {
            section.classList.add('visible');
        } else {
            observer.observe(section);
        }
    });

    document.querySelectorAll('.project-detail-card').forEach(card => {
        if (hasHash || !observer) {
            card.classList.add('visible');
        } else {
            observer.observe(card);
        }
    });

    // Hard fail-safe: Ensure EVERY element becomes 100% visible after 400ms across all browsers
    setTimeout(() => {
        document.querySelectorAll('section, .scroll-animate, .project-detail-card').forEach(el => {
            el.classList.add('visible');
        });
    }, 400);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    initScrollAnimations();
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            target.classList.add('visible');
            const parentSection = target.closest('section');
            if (parentSection) parentSection.classList.add('visible');
            document.querySelectorAll('section, .scroll-animate, .project-detail-card').forEach(el => el.classList.add('visible'));

            const navbarHeight = navbar ? navbar.offsetHeight : 0;
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
            const endpoint = this.getAttribute('action') || 'https://formspree.io/f/xnpneqzj';
            const response = await fetch(endpoint, {
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

// ===== Cursor Trail Effect (Desktop only, strictly disabled on mobile) =====
function initCursorTrail() {
    const isTouchOrMobile = isMobileLayout() || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    // Remove cursor trail element if on mobile or touch device
    const existingCursor = document.querySelector('.cursor-trail');
    if (isTouchOrMobile) {
        if (existingCursor) existingCursor.remove();
        return;
    }

    if (!existingCursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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
            transition: width 0.2s ease, height 0.2s ease, background 0.2s ease;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(cursor);

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            if (isMobileLayout()) return;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            if (isMobileLayout()) {
                cursor.style.display = 'none';
                return;
            }
            cursor.style.display = 'block';
            const ease = 0.15;
            cursorX += (mouseX - cursorX) * ease;
            cursorY += (mouseY - cursorY) * ease;

            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            requestAnimationFrame(animateCursor);
        }

        animateCursor();

        // Enlarge cursor on hover over interactive elements (Desktop only)
        const interactiveElements = document.querySelectorAll('a, button, .glass-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (!isMobileLayout()) {
                    cursor.style.width = '40px';
                    cursor.style.height = '40px';
                    cursor.style.background = 'rgba(108, 99, 255, 0.1)';
                }
            });

            el.addEventListener('mouseleave', () => {
                if (!isMobileLayout()) {
                    cursor.style.width = '20px';
                    cursor.style.height = '20px';
                    cursor.style.background = 'transparent';
                }
            });
        });
    }
}

// Initialize cursor trail
initCursorTrail();

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

// ===== Featured Projects Marquee Carousel (Auto-scroll + Touch/Mouse Manual Drag & Swipe) =====
(function () {
    const stage = document.querySelector('.marquee-stage');
    const track = document.getElementById('marqueeTrack');
    if (!stage || !track) return;

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationId = 0;
    let autoScrollSpeed = 0.8;
    let isPaused = false;

    function getSlideWidth() {
        const slide = track.querySelector('.marquee-slide');
        return slide ? slide.offsetWidth : 1000;
    }

    function setTrackTransform(x) {
        const slideWidth = getSlideWidth() || 1000;
        let normalizedX = x % slideWidth;
        if (normalizedX > 0) normalizedX -= slideWidth;
        currentTranslate = normalizedX;
        track.style.transform = `translateX(${normalizedX}px)`;
    }

    function autoScrollLoop() {
        if (!isPaused && !isDragging) {
            currentTranslate -= autoScrollSpeed;
            setTrackTransform(currentTranslate);
        }
        animationId = requestAnimationFrame(autoScrollLoop);
    }

    // Drive animation with JS loop for zero-jump manual dragging
    track.style.animation = 'none';
    animationId = requestAnimationFrame(autoScrollLoop);

    // Mouse & Touch Drag Event Listeners
    stage.addEventListener('mousedown', onDragStart);
    stage.addEventListener('touchstart', onDragStart, { passive: true });

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: false });

    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);

    // Pause auto-scroll on hover (desktop)
    stage.addEventListener('mouseenter', () => { isPaused = true; });
    stage.addEventListener('mouseleave', () => { if (!isDragging) isPaused = false; });

    function getPositionX(e) {
        return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }

    function onDragStart(e) {
        isDragging = true;
        isPaused = true;
        startX = getPositionX(e);
        prevTranslate = currentTranslate;
        track.classList.add('dragging');
    }

    function onDragMove(e) {
        if (!isDragging) return;
        const currentX = getPositionX(e);
        const deltaX = currentX - startX;
        if (e.type.includes('touch') && Math.abs(deltaX) > 5) {
            e.preventDefault();
        }
        setTrackTransform(prevTranslate + deltaX);
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('dragging');
        setTimeout(() => {
            isPaused = false;
        }, 1000);
    }

    // Navigation Controls (if container exists)
    const controlsWrap = document.getElementById('marqueeDots');
    if (controlsWrap) {
        controlsWrap.style.display = 'none';
    }
})();

// ===== Private Repository Code Notification Popup Handler =====
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-private-code');
    if (btn) {
        e.preventDefault();
        const projectName = btn.getAttribute('data-project') || 'This project';
        showNotification(`${projectName} repository is private or not publicly available. Feel free to contact me for details or a live demo!`, 'info');
    }
});

// ===== Mobile Floating Photo Liquid Glass Scroll Morph =====
function initMobileFloatingPhotoMorph() {
    const floatingHeader = document.querySelector('.mobile-floating-header');
    if (!floatingHeader) return;

    const heroImage = document.querySelector('.profile-frame') || document.querySelector('.hero-image');

    function checkVisibility() {
        if (!isMobileLayout()) return;

        if (heroImage) {
            const rect = heroImage.getBoundingClientRect();
            // Morph floating avatar in when hero profile photo scrolls out of view frame
            if (rect.bottom < 80) {
                floatingHeader.classList.add('visible');
            } else {
                floatingHeader.classList.remove('visible');
            }
        } else {
            // On pages without main hero photo: morph in after 60px scroll
            if (window.pageYOffset > 60) {
                floatingHeader.classList.add('visible');
            } else {
                floatingHeader.classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility, { passive: true });
    checkVisibility();
}

initMobileFloatingPhotoMorph();

// ===== Initialize =====
console.log('Portfolio loaded successfully!');
