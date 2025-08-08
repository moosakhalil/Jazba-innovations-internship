import './input.css';

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 50) {
        navbar.classList.add('bg-white/95', 'shadow-md');
        navbar.classList.remove('bg-white/80');
    } else {
        navbar.classList.add('bg-white/80');
        navbar.classList.remove('bg-white/95', 'shadow-md');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.md\\:hidden');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'fixed inset-0 bg-white z-40 transform transition-transform duration-300 translate-x-full';
mobileMenu.innerHTML = `
    <div class="flex justify-end p-4">
        <button class="text-2xl text-slate-700">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <nav class="flex flex-col items-center space-y-8 py-8">
        <a href="#home" class="text-xl text-slate-700 hover:text-orange-600 transition">Home</a>
        <a href="#about" class="text-xl text-slate-700 hover:text-orange-600 transition">About</a>
        <a href="#skills" class="text-xl text-slate-700 hover:text-orange-600 transition">Skills</a>
        <a href="#projects" class="text-xl text-slate-700 hover:text-orange-600 transition">Projects</a>
        <a href="#contact" class="text-xl text-slate-700 hover:text-orange-600 transition">Contact</a>
    </nav>
`;

document.body.appendChild(mobileMenu);

mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu.classList.remove('translate-x-full');
});

mobileMenu.querySelector('button')?.addEventListener('click', () => {
    mobileMenu.classList.add('translate-x-full');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
    });
});

// Enhanced intersection observer with staggered animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Stagger animation for child elements
            const children = entry.target.querySelectorAll('.animate-on-scroll');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    });
}, observerOptions);

// Observe all sections and animate elements
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Add animation classes to elements
const animateElements = document.querySelectorAll('.animate-on-scroll');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

// Dynamic typing effect for hero section
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', function() {
    const heroText = document.querySelector('#home p');
    if (heroText) {
        const originalText = heroText.textContent;
        typeWriter(heroText, originalText, 50);
    }
});

// Contact form handling with validation and submission
function handleContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const formMessage = document.getElementById('formMessage');

    // Form validation
    const validateField = (field, value) => {
        switch(field) {
            case 'firstName':
            case 'lastName':
                return value.trim().length >= 2;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'subject':
                return value !== '';
            case 'message':
                return value.trim().length >= 10;
            default:
                return true;
        }
    };

    // Real-time validation
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', () => {
            const isValid = validateField(input.name, input.value);
            input.classList.toggle('border-red-500', !isValid);
            input.classList.toggle('border-green-500', isValid);
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            if (!validateField(key, value)) {
                isValid = false;
                form.querySelector(`[name="${key}"]`).classList.add('border-red-500');
            }
        }

        if (!isValid) {
            showMessage('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitText.textContent = 'Sending...';
        showMessage('Sending your message...', 'info');

        try {
            // EmailJS configuration
            await emailjs.sendForm(
                'service_ttsv7pr',        // Service ID
                'template_64412nt',       // Template ID  
                form,                     // Form element
                'cy5kHXWYuE0UdZwnb'      // Public Key
            );
            
            // Success
            showMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
            form.reset();
            
            // Remove validation classes
            form.querySelectorAll('input, select, textarea').forEach(input => {
                input.classList.remove('border-red-500', 'border-green-500');
            });

        } catch (error) {
            console.error('EmailJS Error:', error);
            showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitText.textContent = 'Send Message';
        }
    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `p-4 rounded-lg text-center ${
            type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
            'bg-blue-100 text-blue-700 border border-blue-200'
        }`;
        formMessage.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }
}

// Initialize Vanta.js background
function initVantaBackground() {
    if (typeof VANTA !== 'undefined') {
        VANTA.NET({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x45A857,      // Dark green (#166534)
            backgroundColor: 0xdce9d5,  // Light background remains (#dce9d5)
            points: 8.00,
            maxDistance: 23.00,
            spacing: 17.00
        });
    }
}

// Initialize all functions
document.addEventListener('DOMContentLoaded', function() {
    handleContactForm();
    initVantaBackground();
    console.log('Portfolio initialized successfully');
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .hover\:transform:hover {
        transform: translateY(-5px);
    }
    
    .transition {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
