document.addEventListener('DOMContentLoaded', function () {
    // Initialize navbar
    loadNavbar();

    // Initialize page transitions
    initializePageTransitions();

    // Initialize particles.js with default config
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#66FCF1' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#66FCF1',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'repulse' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            }
        },
        retina_detect: true
    });

    // Initialize Typed.js
    new Typed('#typed-text', {
        strings: ['Aspiring IT Programmer', 'BSIT Student', 'Web Developer'],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true
    });

    // Navbar functionality
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Handle navbar background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Handle active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        fetch('navbar.html')
            .then(response => response.text())
            .then(data => {
                navbarContainer.innerHTML = data;
                setupNavbarInteractions();
            })
            .catch(error => console.error('Error loading navbar:', error));
    }
}

function setupNavbarInteractions() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            navToggle.classList.toggle('active');
        });
    }

    // Add active class to current page link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeLink = document.querySelector(`a[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function initializePageTransitions() {
    document.querySelectorAll('a').forEach(link => {
        if (link.href.includes(window.location.origin)) {
            link.addEventListener('click', e => {
                const targetHref = link.getAttribute('href');
                if (!targetHref.startsWith('#')) {
                    e.preventDefault();
                    document.body.classList.add('page-transition');
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 300);
                }
            });
        }
    });
}

// Glitch text typing effect
const textElement = document.getElementById("glitch-text");
if (textElement) {
    const words = ["Hi, I'm Joshua_", "BSIT_", "Aspiring Developer_"];
    let wordIndex = 0, letterIndex = 0, currentText = "", deleting = false;

    function typeEffect() {
        currentText = words[wordIndex].substring(0, deleting ? letterIndex-- : letterIndex++);
        textElement.innerHTML = `<span class="glitch">${currentText}</span>`;

        function typeEffect() {
            currentText = words[wordIndex].substring(0, deleting ? letterIndex-- : letterIndex++);
            textElement.innerHTML = `<span class="glitch">${currentText}</span>`;

            let speed = deleting ? 50 : 100;
            if (!deleting && letterIndex === words[wordIndex].length) {
                speed = 1200; // Pause before deleting
                deleting = true;
            } else if (deleting && letterIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 500;
            }

            setTimeout(typeEffect, speed);
        }
        typeEffect();
    }

    // Cursor trail effect (optimized)
    document.addEventListener("mousemove", (e) => {
        const trail = document.createElement("div");
        trail.className = "cursor-trail";
        document.body.appendChild(trail);

        trail.style.left = `${e.clientX}px`;
        trail.style.top = `${e.clientY}px`;

        trail.animate(
            [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(2)", opacity: 0 }],
            { duration: 500, easing: "ease-out" }
        );

        setTimeout(() => trail.remove(), 500);
    });

    // Smooth scroll effect
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // Neon glow hover effect
    document.querySelectorAll(".glow-border").forEach((btn) => {
        btn.addEventListener("mouseenter", function () {
            this.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.8)";
        });
        btn.addEventListener("mouseleave", function () {
            this.style.boxShadow = "none";
        });
    });

    // 3D Depth Parallax Effect (Fixed NaN issue)
    document.addEventListener("mousemove", (e) => {
        const { innerWidth: w, innerHeight: h } = window;
        document.querySelectorAll(".parallax").forEach((element) => {
            let x = ((w / 2) - e.pageX) / 20;
            let y = ((h / 2) - e.pageY) / 20;
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
};

document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.querySelector(".navbar");
    const links = document.querySelectorAll(".nav-link");
    const underline = document.querySelector(".underline");

    function updateUnderline(element) {
        underline.style.width = `${element.offsetWidth}px`;
        underline.style.left = `${element.offsetLeft}px`;
    }

    links.forEach((link) => {
        link.addEventListener("mouseenter", () => updateUnderline(link));
    });

    // Reset underline when mouse leaves navbar
    navbar.addEventListener("mouseleave", () => {
        underline.style.width = "0";
    });
});

document.addEventListener("DOMContentLoaded", function () {
    function setupNavbar() {
        const navbar = document.querySelector(".navbar");
        const links = document.querySelectorAll(".nav-link");
        const underline = document.querySelector(".underline");

        function updateUnderline(element) {
            underline.style.width = `${element.offsetWidth}px`;
            underline.style.left = `${element.offsetLeft}px`;
        }

        links.forEach((link) => {
            link.addEventListener("mouseenter", () => updateUnderline(link));
        });

        navbar.addEventListener("mouseleave", () => {
            underline.style.width = "0";
        });
    }

    // Wait until the navbar is loaded before setting it up
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-container").innerHTML = data;
            setupNavbar();
        });
});
