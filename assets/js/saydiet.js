// assets/js/main.js - FIXED VERSION
// Clean, single-responsibility mobile navigation

(function() {
  'use strict';

  // ========== INITIALIZATION ==========
  function init() {
    initYearDisplay();
    initMobileNav();
    initSmoothScroll();
    initFormValidation();
    initLazyLoading();
  }

  // ========== YEAR DISPLAY ==========
  function initYearDisplay() {
    const yearElements = document.querySelectorAll('#year, #year-footer');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
      if (el) el.textContent = currentYear;
    });
  }

  // ========== MOBILE NAVIGATION ==========
  function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navList = document.getElementById('nav-list');
    const body = document.body;

    if (!navToggle || !navList) return;

    // Open menu
    function openMenu() {
      navList.classList.add('mobile-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navList.setAttribute('aria-hidden', 'false');
      body.classList.add('menu-open');
      
      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = navList.querySelector('a, button');
        if (firstFocusable) firstFocusable.focus();
      }, 100);
    }

    // Close menu
    function closeMenu() {
      navList.classList.remove('mobile-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navList.setAttribute('aria-hidden', 'true');
      body.classList.remove('menu-open');
      
      // Return focus to toggle button
      navToggle.focus();
    }

    // Toggle menu
    function toggleMenu(e) {
      e.preventDefault();
      const isOpen = navList.classList.contains('mobile-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Event listeners
    navToggle.addEventListener('click', toggleMenu);
    
    if (navClose) {
      navClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
      });
    }

    // Close on link click (mobile only)
    navList.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && window.innerWidth <= 900) {
        // Small delay to allow navigation
        setTimeout(closeMenu, 100);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('mobile-open')) {
        closeMenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navList.classList.contains('mobile-open')) return;
      
      const isClickInside = navList.contains(e.target) || navToggle.contains(e.target);
      if (!isClickInside) {
        closeMenu();
      }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Close menu if resized to desktop
        if (window.innerWidth > 900 && navList.classList.contains('mobile-open')) {
          closeMenu();
        }
      }, 250);
    });

    // Initialize state
    navToggle.setAttribute('aria-expanded', 'false');
    navList.setAttribute('aria-hidden', 'true');
  }

  // ========== SMOOTH SCROLLING ==========
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip empty anchors
        if (href === '#' || href.length <= 1) return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          
          // Smooth scroll
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  // ========== FORM VALIDATION ==========
  function initFormValidation() {
    const form = document.querySelector('form#contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      // Remove previous errors
      form.querySelectorAll('.field-error').forEach(err => err.remove());

      let isValid = true;

      // Validation rules
      const fields = [
        { id: 'name', label: 'Full name', minLength: 2 },
        { id: 'email', label: 'Email', type: 'email' },
        { id: 'message', label: 'Message', minLength: 10 }
      ];

      // Validate each field
      fields.forEach(field => {
        const input = form.querySelector(`#${field.id}`);
        if (!input) return;

        const value = input.value.trim();

        // Email validation
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            showError(input, 'Please enter a valid email address');
            isValid = false;
          }
        }
        // Length validation
        else if (field.minLength && value.length < field.minLength) {
          showError(input, `${field.label} must be at least ${field.minLength} characters`);
          isValid = false;
        }
        // Required validation
        else if (!value) {
          showError(input, `${field.label} is required`);
          isValid = false;
        }
      });

      // Honeypot check (spam protection)
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== '') {
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        
        // Focus first error
        const firstError = form.querySelector('.field-error');
        if (firstError) {
          const errorInput = firstError.previousElementSibling;
          if (errorInput) errorInput.focus();
        }
      }
    });

    // Show error message
    function showError(input, message) {
      const error = document.createElement('div');
      error.className = 'field-error';
      error.style.color = 'var(--md-danger, #D32F2F)';
      error.style.fontSize = '0.85rem';
      error.style.marginTop = '0.25rem';
      error.style.fontWeight = '600';
      error.textContent = message;
      
      input.insertAdjacentElement('afterend', error);
      input.setAttribute('aria-invalid', 'true');
      
      // Remove error on input
      input.addEventListener('input', function removeErrorOnInput() {
        error.remove();
        input.removeAttribute('aria-invalid');
        input.removeEventListener('input', removeErrorOnInput);
      }, { once: true });
    }
  }

  // ========== LAZY LOADING ==========
  function initLazyLoading() {
    // Check for native lazy loading support
    if ('loading' in HTMLImageElement.prototype) return;

    // Polyfill using Intersection Observer
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            img.removeAttribute('loading');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback: load all images immediately
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
  }

  // ========== START ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();