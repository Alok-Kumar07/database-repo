// Bootstrap form validation
(function() {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
})();

// Navbar user dropdown
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('open');
        userMenuBtn.classList.toggle('open');
    });
    document.addEventListener('click', function() {
        userDropdown.classList.remove('open');
        userMenuBtn.classList.remove('open');
    });
}

// Mobile hamburger menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('open');
    });
}

// Auto-dismiss flash messages
setTimeout(function() {
    const flashContainer = document.querySelector('.flash-container');
    if (flashContainer) {
        flashContainer.style.opacity = '0';
        flashContainer.style.transition = 'opacity 0.4s ease';
        setTimeout(() => flashContainer.remove(), 400);
    }
}, 4000);
