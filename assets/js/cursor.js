document.addEventListener('DOMContentLoaded', () => {
    // Create cursor elements
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    cursorOutline.className = 'cursor-dot-outline';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    // Create trail elements
    const trailCount = 20;
    const trails = [];
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.opacity = (1 - i / trailCount) * 0.3;
        document.body.appendChild(trail);
        trails.push({
            element: trail,
            x: 0,
            y: 0
        });
    }

    // Hide default cursor
    document.body.style.cursor = 'none';
    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
        link.style.cursor = 'none';
    });

    let lastX = 0;
    let lastY = 0;
    const smoothing = 0.15;
    const trailSmoothing = 0.08;

    function animate() {
        // Update trail positions
        trails.forEach((trail, index) => {
            if (index === 0) {
                trail.x += (lastX - trail.x) * trailSmoothing * 2;
                trail.y += (lastY - trail.y) * trailSmoothing * 2;
            } else {
                const prevTrail = trails[index - 1];
                trail.x += (prevTrail.x - trail.x) * trailSmoothing;
                trail.y += (prevTrail.y - trail.y) * trailSmoothing;
            }
            trail.element.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
        });

        // Update cursor outline position
        cursorOutline.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;

        requestAnimationFrame(animate);
    }

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        const targetX = e.clientX;
        const targetY = e.clientY;

        // Update cursor dot position immediately
        cursorDot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;

        // Smooth movement for outline and trails
        lastX += (targetX - lastX) * smoothing;
        lastY += (targetY - lastY) * smoothing;
    });

    // Add hover effect on interactive elements
    links.forEach(link => {
        link.addEventListener('mouseover', () => {
            cursorDot.classList.add('cursor-hover');
            cursorOutline.classList.add('cursor-hover');
            trails.forEach(trail => trail.element.style.opacity = '0');
        });
        
        link.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('cursor-hover');
            cursorOutline.classList.remove('cursor-hover');
            trails.forEach((trail, index) => {
                trail.element.style.opacity = (1 - index / trailCount) * 0.3;
            });
        });
    });

    // Handle cursor visibility
    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
        trails.forEach((trail, index) => {
            trail.element.style.opacity = (1 - index / trailCount) * 0.3;
        });
    });

    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
        trails.forEach(trail => trail.element.style.opacity = '0');
    });

    // Start animation
    animate();
});

