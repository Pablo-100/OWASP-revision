// ========== SCROLL TO TOP BUTTON ==========
function createScrollToTopButton() {
  const button = document.createElement('button');
  button.innerHTML = '↑';
  button.className = 'scroll-to-top';
  button.setAttribute('aria-label', 'Scroll to top');
  button.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--brand);
    color: white;
    border: none;
    font-size: 1.5rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow-xl);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transform: translateY(100px);
  `;

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-8px) scale(1.1)';
    button.style.boxShadow = 'var(--shadow-2xl)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0) scale(1)';
    button.style.boxShadow = 'var(--shadow-xl)';
  });

  document.body.appendChild(button);

  // Show/hide on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 300) {
      button.style.opacity = '1';
      button.style.visibility = 'visible';
      button.style.transform = 'translateY(0)';
    } else {
      button.style.opacity = '0';
      button.style.visibility = 'hidden';
      button.style.transform = 'translateY(100px)';
    }

    lastScroll = currentScroll;
  });
}

// ========== NAVIGATION SCROLL EFFECT ==========
function enhanceNavigation() {
  const nav = document.querySelector('.topnav');
  if (!nav) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
        ticking = false;
      });

      ticking = true;
    }
  });

  // Add navigation highlight for current section
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id], .hero[id="top"]');

  const highlightNavLink = () => {
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', highlightNavLink);
  highlightNavLink(); // Run on load
}

// ========== INTERSECTION OBSERVER FOR ANIMATIONS ==========
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  const elements = document.querySelectorAll('.card, section > *:not(.container)');
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
    observer.observe(el);
  });
}

// ========== CONFETTI EFFECT FOR ACHIEVEMENTS ==========
function createConfetti(x, y) {
  const colors = ['#0891b2', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      left: ${x}px;
      top: ${y}px;
    `;

    document.body.appendChild(particle);

    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = 5 + Math.random() * 5;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let posX = x;
    let posY = y;
    let opacity = 1;
    let scale = 1;

    function animate() {
      posX += vx;
      posY += vy + 2; // gravity
      opacity -= 0.02;
      scale -= 0.02;

      if (opacity <= 0 || scale <= 0) {
        particle.remove();
        return;
      }

      particle.style.left = posX + 'px';
      particle.style.top = posY + 'px';
      particle.style.opacity = opacity;
      particle.style.transform = `scale(${scale})`;

      requestAnimationFrame(animate);
    }

    animate();
  }
}

// ========== ENHANCED TOAST WITH ICONS ==========
function showEnhancedToast(message, type = 'success', duration = 3000) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: 'var(--success)',
    error: 'var(--error)',
    warning: 'var(--warning)',
    info: 'var(--info)'
  };

  const toast = document.createElement('div');
  toast.innerHTML = `
    <span style="font-size: 1.5rem; margin-right: 0.75rem;">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-2xl);
    font-weight: 700;
    z-index: 10000;
    display: flex;
    align-items: center;
    max-width: 350px;
    animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Add toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes toastSlideIn {
    from {
      transform: translateX(450px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes toastSlideOut {
    from {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
    to {
      transform: translateX(450px) scale(0.8);
      opacity: 0;
    }
  }

  .scroll-to-top:hover {
    background: var(--brand-hover) !important;
  }

  .scroll-to-top:active {
    transform: translateY(-4px) scale(1) !important;
  }
`;
document.head.appendChild(toastStyle);

// ========== LOADING OVERLAY ==========
function showLoadingOverlay(message = 'Chargement...') {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    ">
      <div class="loader"></div>
      <p style="
        color: white;
        font-size: 1.125rem;
        font-weight: 700;
      ">${message}</p>
    </div>
  `;
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    animation: fadeIn 0.3s ease;
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  }
}

// Add loader animation
const loaderStyle = document.createElement('style');
loaderStyle.textContent = `
  .loader {
    width: 60px;
    height: 60px;
    border: 6px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--brand);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(loaderStyle);

// ========== PARALLAX EFFECT FOR HERO ==========
function setupParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;
    hero.style.transform = `translateY(${rate}px)`;
  });
}

// ========== TYPING EFFECT FOR HERO TITLE ==========
function setupTypingEffect() {
  const h1 = document.querySelector('h1');
  if (!h1) return;

  const text = h1.textContent;
  h1.textContent = '';
  h1.style.borderRight = '3px solid var(--brand)';
  h1.style.paddingRight = '0.25rem';
  h1.style.animation = 'blink 0.7s step-end infinite';

  let index = 0;
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      h1.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typeInterval);
      setTimeout(() => {
        h1.style.borderRight = 'none';
        h1.style.animation = 'none';
      }, 500);
    }
  }, 50);
}

// Add typing animation
const typingStyle = document.createElement('style');
typingStyle.textContent = `
  @keyframes blink {
    0%, 50% { border-color: var(--brand); }
    51%, 100% { border-color: transparent; }
  }
`;
document.head.appendChild(typingStyle);

// ========== PARTICLE BACKGROUND ==========
function createParticleBackground() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.3;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 50;

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--brand').trim();
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(8, 145, 178, ${1 - distance / 150})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ========== SMOOTH REVEAL ON LOAD ==========
function setupPageReveal() {
  document.body.style.opacity = '0';
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.6s ease';
    document.body.style.opacity = '1';
  });
}

// ========== CURSOR TRAIL EFFECT ==========
function setupCursorTrail() {
  const trail = [];
  const trailLength = 10;

  document.addEventListener('mousemove', (e) => {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: var(--brand);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      transform: translate(-50%, -50%);
      transition: opacity 0.5s ease;
    `;

    document.body.appendChild(dot);
    trail.push(dot);

    if (trail.length > trailLength) {
      const oldDot = trail.shift();
      oldDot.style.opacity = '0';
      setTimeout(() => oldDot.remove(), 500);
    }

    setTimeout(() => {
      dot.style.opacity = '0';
    }, 10);
  });
}

// ========== INITIALIZE ALL ENHANCEMENTS ==========
function initEnhancements() {
  setupPageReveal();
  createScrollToTopButton();
  enhanceNavigation();
  setupScrollAnimations();
  createParticleBackground();
  // setupTypingEffect(); // Uncomment if you want typing effect
  // setupCursorTrail(); // Uncomment if you want cursor trail
  // setupParallax(); // Uncomment if you want parallax

  // Export functions globally so they can be used in main script
  window.showEnhancedToast = showEnhancedToast;
  window.createConfetti = createConfetti;
  window.showLoadingOverlay = showLoadingOverlay;
  window.hideLoadingOverlay = hideLoadingOverlay;
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K: Toggle theme
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('theme-toggle')?.click();
  }

  // Escape: Close any open modal or dialog
  if (e.key === 'Escape') {
    hideLoadingOverlay();
  }

  // Arrow Up: Scroll to top
  if (e.ctrlKey && e.key === 'ArrowUp') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

console.log('🚀 OWASP GameClass - Enhanced UI Loaded!');
