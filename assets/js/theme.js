document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Function to update particle colors
    function updateParticleColors(isLight) {
        if (window.pJSDom && window.pJSDom[0]) {
            const particles = window.pJSDom[0].pJS.particles;
            particles.color.value = isLight ? '#45A29E' : '#66FCF1';
            particles.line_linked.color = isLight ? '#66FCF1' : '#45A29E';
            
            // Update existing particles
            for (let i = 0; i < particles.array.length; i++) {
                const particle = particles.array[i];
                particle.color = isLight ? '#45A29E' : '#66FCF1';
            }
        }
    }

    function setTheme(isLight) {
        // Add transition class before changing theme
        body.classList.add('theme-transition');
        
        // Update theme
        if (isLight) {
            body.classList.add('light-mode');
            themeToggle.textContent = '☀️';
            updateParticleColors(true);
        } else {
            body.classList.remove('light-mode');
            themeToggle.textContent = '🌙';
            updateParticleColors(false);
        }

        // Remove transition class after animation completes
        setTimeout(() => {
            body.classList.remove('theme-transition');
        }, 300);

        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        const isLight = !body.classList.contains('light-mode');
        setTheme(isLight);
    });

    // Initialize theme from local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme === 'light');
    }
});
