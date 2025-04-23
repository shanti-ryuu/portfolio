document.addEventListener('DOMContentLoaded', function() {
    // burger menu for mobile nav 
    // get references to the hamburger button and navigation links
    const hamburger = document.querySelector('.hamburger'); // select hamburger menu icon
    const navLinks = document.querySelector('.nav-links');   // select navigation menu container

    // toggle mobile menu when hamburger is clicked
    // check if hamburger exists to prevent errors on pages without it
    if (hamburger) {
        // add click event listener to the hamburger menu icon
        hamburger.addEventListener('click', () => {
            // toggle 'active' class to animate hamburger icon
            hamburger.classList.toggle('active');
            // toggle 'active' class to show/hide the mobile navigation menu
            navLinks.classList.toggle('active');
        });
    }

    // close mobile menu when a nav link is clicked
    // select all navigation links and apply event listeners to each
    document.querySelectorAll('.nav-links a').forEach(link => {
        // add click event listener to each navigation link
        link.addEventListener('click', () => {
            // remove 'active' class from hamburger to revert animation
            hamburger.classList.remove('active');
            // remove 'active' class from nav menu to hide it after clicking a link
            navLinks.classList.remove('active');
        });
    });

    initSciFiBackground();
    typeWriter("BSIT", "Aspiring Cybersecurity Professional", "typing-h3", 50);


    // navbar scroll effect
    // add scroll event listener to the window to detect page scrolling
    window.addEventListener('scroll', function() {
        // get reference to the navbar element
        const navbar = document.querySelector('.navbar');
        // page has been scrolled more than 50px
        if (window.scrollY > 50) {
            // box shadow to navbar when scrolled for visual depth
            navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            // navbar bg more opaque when scrolled
            navbar.style.background = 'rgba(1, 21, 38, 0.9)';
        } else {
            // remove box shadow when at top of page
            navbar.style.boxShadow = 'none';
            // make navbar bg more transparent at top of page
            navbar.style.background = 'rgba(1, 21, 38, 0.7)';
        }
    });

    // -smooth scroll for nav links
    // select all anchor links that start with '#' (in-page links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // add click event listener to each anchor link
        anchor.addEventListener('click', function(e) {
            // prevent default anchor click behavior (jumping)
            e.preventDefault();
            // get the href attribute value (the target section ID)
            const targetId = this.getAttribute('href');
            // find the element with that ID
            const targetElement = document.querySelector(targetId);
            
            // only scroll if the target element exists
            if (targetElement) {
                // scroll to the target element with smooth animation
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // subtract 70px to account for navbar height
                    behavior: 'smooth' //smooth scrolling effect
                });
            }
        });
    });

    // -scroll animation for elements
    // select all elements with 'fade-in' class for scroll animations
    const observeElements = document.querySelectorAll('.fade-in');
    
    // create a new Intersection Observer to detect when elements enter viewport
    const observer = new IntersectionObserver((entries) => {
        // Process each observed element
        entries.forEach(entry => {
            // Check if element is in the viewport
            if (entry.isIntersecting) {
                // Make element fully visible
                entry.target.style.opacity = 1;
                // Reset element position (removing the initial Y offset)
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 }); // Trigger when at least 10% of the element is visible
    
    // Setup each element for the fade-in animation
    observeElements.forEach(element => {
        // Set initial opacity to 0 (invisible)
        element.style.opacity = 0;
        // Set initial position slightly below final position
        element.style.transform = 'translateY(20px)';
        // Set transition properties for smooth animation
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        // Start observing this element
        observer.observe(element);
    });
});

// Main function 
function initSciFiBackground() {
    // Get the canvas element from the DOM
    const canvas = document.getElementById('background-canvas');
    // Exit the function if canvas element doesn't exist on the page
    if (!canvas) return;

    // Get the 2D drawing context for the canvas
    const ctx = canvas.getContext('2d');
    // Set canvas width and height to match the window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize canvas when window size changes to ensure full coverage
    window.addEventListener('resize', () => {
        // Update canvas dimensions to new window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Particle class for the sci-fi background
    // Defines the properties and behaviors of each particle in the animation
    class Particle {
        constructor() {
            // Random initial X position across canvas width
            this.x = Math.random() * canvas.width;
            // Random initial Y position across canvas height
            this.y = Math.random() * canvas.height;
            // Random size between 0.5 and 2.5 pixels
            this.size = Math.random() * 2 + 0.5;
            // Random X velocity between -0.25 and 0.25 pixels per frame
            this.speedX = Math.random() * 0.5 - 0.25;
            // Random Y velocity between -0.25 and 0.25 pixels per frame
            this.speedY = Math.random() * 0.5 - 0.25;
            // Assign a random color from the portfolio color palette
            this.color = this.getRandomColor();
        }

        // Method to select a random color from the portfolio color palette
        getRandomColor() {
            
            const colors = [
                '#BF3952', // Raspberry Red 
                '#30588C', // Navy Blue 
                '#6093BF', // Sky Blue 
                '#254559'  // Slate Blue 
            ];
            // Return a random color from the array
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Method to update particle position for each animation frame
        update() {
            // Move particle based on its speed values
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around canvas edges for seamless animation
            // If particle moves beyond right edge, place it at left edge
            if (this.x > canvas.width) this.x = 0;
            // If particle moves beyond left edge, place it at right edge
            else if (this.x < 0) this.x = canvas.width;
            
            // If particle moves beyond bottom edge, place it at top edge
            if (this.y > canvas.height) this.y = 0;
            // If particle moves beyond top edge, place it at bottom edge
            else if (this.y < 0) this.y = canvas.height;
        }

        // Method to render the particle on the canvas
        draw() {
            // Set the fill color for this particle
            ctx.fillStyle = this.color;
            // Start a new drawing path
            ctx.beginPath();
            // Draw a circle at the particle's position with its size
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            // Fill the circle with the particle's color
            ctx.fill();
        }
    }

    // Create an array to hold all particle objects
    let particles = [];
    // Calculate number of particles based on screen width (responsive)
    // Limit to a maximum of 100 particles for performance
    const particleCount = Math.min(100, window.innerWidth / 10);
    
    // Initialize particles array with new Particle objects
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation loop function that runs continuously
    function animate() {
        // Clear the entire canvas for the next frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Add a semi-transparent dark blue overlay to create depth
        ctx.fillStyle = 'rgba(1, 21, 38, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set styles for connecting lines between particles
        ctx.strokeStyle = 'rgba(96, 147, 191, 0.15)';
        ctx.lineWidth = 0.3;
        
        // Draw connecting lines between nearby particles for network effect
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                // Calculate distance between two particles using Pythagorean theorem
                const dx = particles[i].x - particles[j].x; // X distance
                const dy = particles[i].y - particles[j].y; // Y distance
                const distance = Math.sqrt(dx * dx + dy * dy); // Hypotenuse (actual distance)
                
                // Only draw lines between particles that are within 100px of each other
                if (distance < 100) {
                    // Start a new line
                    ctx.beginPath();
                    // Move to the first particle's position
                    ctx.moveTo(particles[i].x, particles[i].y);
                    // Draw line to the second particle's position
                    ctx.lineTo(particles[j].x, particles[j].y);
                    // Render the line with previously set styles
                    ctx.stroke();
                }
            }
        }
        
        // Update positions and draw all particles
        for (let i = 0; i < particles.length; i++) {
            // Update particle position
            particles[i].update();
            // Render particle on canvas
            particles[i].draw();
        }
        
        // Schedule the next animation frame to create continuous animation
        requestAnimationFrame(animate);
    }
    
    // Start the animation loop
    animate();
}