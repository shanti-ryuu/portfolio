document.addEventListener("DOMContentLoaded", function () {
    const textElement = document.getElementById("glitch-text");
    if (!textElement) return; // Prevents errors if the element is missing

    const words = ["Hi, I'm Joshua_", "BSIT_", "Aspiring Developer_"];
    let wordIndex = 0;
    let letterIndex = 0;
    let currentText = "";
    let deleting = false;

    function typeEffect() {
        if (deleting) {
            currentText = words[wordIndex].substring(0, letterIndex--);
        } else {
            currentText = words[wordIndex].substring(0, letterIndex++);
        }

        textElement.innerHTML = `<span class="glitch">${currentText}</span>`;

        let speed = deleting ? 50 : 100;
        if (!deleting && letterIndex === words[wordIndex].length) {
            speed = 1200; // Wait before deleting
            deleting = true;
        } else if (deleting && letterIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 500;
        }

        setTimeout(typeEffect, speed);
    }

    typeEffect();
});

// Cursor trail effect
document.addEventListener("mousemove", (e) => {
    let trail = document.createElement("div");
    trail.className = "cursor-trail";
    document.body.appendChild(trail);

    // Set initial position
    trail.style.left = `${e.clientX}px`;
    trail.style.top = `${e.clientY}px`;

    // Smooth animation
    trail.animate(
        [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(2)", opacity: 0 }
        ],
        { duration: 500, easing: "ease-out" }
    );

    // Remove the trail after animation
    setTimeout(() => {
        trail.remove();
    }, 500);
});

// Smooth Scroll Effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// Neon Glow Hover Effect
document.querySelectorAll(".glow-border").forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
        this.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.8)";
    });
    btn.addEventListener("mouseleave", function () {
        this.style.boxShadow = "none";
    });
});

// 3D Depth Parallax Effect
document.addEventListener("mousemove", (e) => {
    document.querySelectorAll(".parallax").forEach((element) => {
        let x = (window.innerWidth - e.pageX * 2) / 100;
        let y = (window.innerHeight - e.pageY * 2) / 100;
        element.style.transform = `translate(${x}px, ${y}px)`;
    });
});document.addEventListener("DOMContentLoaded", function () {
    // Initialize particles.js
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#1b1e34" },
            "shape": {
                "type": "polygon",
                "stroke": { "width": 0, "color": "#000" },
                "polygon": { "nb_sides": 6 }
            },
            "opacity": { "value": 0.3, "random": true },
            "size": {
                "value": 3,
                "random": true,
                "anim": { "enable": true, "speed": 4, "size_min": 0.3, "sync": false }
            },
            "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
            "move": {
                "enable": true, "speed": 6, "direction": "none",
                "random": false, "straight": false, "out_mode": "out", "bounce": false
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": { "enable": true, "mode": "repulse" },
                "onclick": { "enable": true, "mode": "push" },
                "resize": true
            },
            "modes": {
                "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
                "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
                "repulse": { "distance": 100, "duration": 0.4 },
                "push": { "particles_nb": 4 },
                "remove": { "particles_nb": 2 }
            }
        },
        "retina_detect": true
    });

    // Glitch text typing effect
    const textElement = document.getElementById("glitch-text");
    if (textElement) {
        const words = ["Hi, I'm Joshua_", "BSIT_", "Aspiring Developer_"];
        let wordIndex = 0, letterIndex = 0, currentText = "", deleting = false;

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
});

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
