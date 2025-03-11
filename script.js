document.addEventListener("DOMContentLoaded", () => {
    /* tilt.js for 3D hover effect*/
    VanillaTilt.init(document.querySelectorAll(".project-card"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.5
    });

    /* particles.js for animated background*/
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#00ffff" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.5, "random": false },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#00ffff", "opacity": 0.4, "width": 1 },
            "move": { "enable": true, "speed": 3, "direction": "none", "random": false }
        }
    });

    /* smooth ascrolling*/
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /*reveal on sscroll*/
    const sections = document.querySelectorAll("section");
    const revealOnScroll = () => {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8 && !section.classList.contains("visible")) {
                section.classList.add("visible");
            }
        });
    };
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    /*GSAP scroll animations*/
    gsap.from(".profile-pic-container", { opacity: 0, y: -50, duration: 1, ease: "power2.out" });
    gsap.from("h1", { opacity: 0, y: -20, duration: 1.2, delay: 0.5, ease: "power2.out" });
    gsap.from(".glitch", { opacity: 0, y: -10, duration: 1.2, delay: 0.8, ease: "power2.out" });

    gsap.utils.toArray(".animate-section").forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
    });

    /* typed.js for Dynamic Text Effect*/
    new Typed(".glitch", {
        strings: ["bsit", "Tech Enthusiast", "Aspiring IT Professional"],
        typeSpeed: 80,
        backSpeed: 50,
        loop: true
    });
});

/*toggle mobile menu*/

function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    menu.classList.toggle("show");
}
