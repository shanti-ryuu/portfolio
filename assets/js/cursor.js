// Cursor.js - Continuous Smokey Trail Effect
document.addEventListener('DOMContentLoaded', function() {
    console.log('Continuous cursor trail initializing');
    
    // Get cursor elements
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    // Verify cursor elements exist
    if (!cursorDot || !cursorOutline) {
        console.error('Cursor elements not found in DOM');
        return;
    }
    
    // Detect if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        console.log('Touch device detected, disabling custom cursor');
        document.body.classList.add('touch-device');
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
        return;
    }
    
    console.log('Setting up continuous cursor trail');
    
    // Position tracking variables
    let mouseX = 0;
    let mouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseSpeed = 0;
    let isMoving = false;
    let moveTimeout;
    
    // Trail management
    const maxTrails = 35; // Increased for denser trails
    const trails = [];
    let trailIndex = 0;
    let lastTrailSpawn = 0;
    const trailSpawnDelay = 10; // Very short delay for continuous effect
    
    // Create trail container
    const trailContainer = document.createElement('div');
    trailContainer.id = 'trail-container';
    trailContainer.style.position = 'fixed';
    trailContainer.style.top = '0';
    trailContainer.style.left = '0';
    trailContainer.style.width = '100%';
    trailContainer.style.height = '100%';
    trailContainer.style.pointerEvents = 'none';
    trailContainer.style.zIndex = '9998';
    document.body.appendChild(trailContainer);
    
    // Create trail elements
    for (let i = 0; i < maxTrails; i++) {
        const trail = document.createElement('div');
        trail.classList.add('cursor-trail');
        trail.style.position = 'fixed';
        trail.style.borderRadius = '50%';
        trail.style.pointerEvents = 'none';
        trail.style.opacity = '0';
        trail.style.transform = 'translate(-50%, -50%)';
        trail.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
        trail.style.mixBlendMode = 'screen';
        
        // Add to container
        trailContainer.appendChild(trail);
        trails.push({
            element: trail,
            active: false,
            fadeTimer: null
        });
    }
    
    // Mouse movement event
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Calculate mouse speed
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        mouseSpeed = Math.sqrt(dx * dx + dy * dy);
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        
        // Update main cursor elements
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
        cursorOutline.style.left = `${mouseX}px`;
        cursorOutline.style.top = `${mouseY}px`;
        
        // Set moving state
        isMoving = true;
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
            isMoving = false;
        }, 100); // Short delay to determine when movement stops
        
        // Spawn trails while moving
        const now = Date.now();
        if (now - lastTrailSpawn > trailSpawnDelay) {
            spawnTrail();
            lastTrailSpawn = now;
        }
    });
    
    // Trail spawning function with continuous visibility
    function spawnTrail() {
        // Find an inactive trail or use the next trail in sequence
        let trail;
        const inactiveTrail = trails.find(t => !t.active);
        
        if (inactiveTrail) {
            trail = inactiveTrail;
        } else {
            // Re-use the oldest trail if all are active
            trail = trails[trailIndex];
            trailIndex = (trailIndex + 1) % maxTrails;
            
            // Clear any existing fade timer
            if (trail.fadeTimer) {
                clearTimeout(trail.fadeTimer);
            }
        }
        
        trail.active = true;
        
        // Randomize size and offset from cursor
        const size = 8 + Math.random() * 20;
        const offsetX = (Math.random() - 0.5) * 20 * (mouseSpeed / 10 + 1); 
        const offsetY = (Math.random() - 0.5) * 20 * (mouseSpeed / 10 + 1);
        
        // Position and style the trail
        trail.element.style.width = `${size}px`;
        trail.element.style.height = `${size}px`;
        trail.element.style.left = `${mouseX + offsetX}px`;
        trail.element.style.top = `${mouseY + offsetY}px`;
        
        // Colorize for better visibility
        const hue = 190 + Math.random() * 20;
        const saturation = 90 + Math.random() * 10;
        const lightness = 50 + Math.random() * 20;
        
        // Radial gradient for smokey effect
        trail.element.style.background = `radial-gradient(circle, 
            hsla(${hue}, ${saturation}%, ${lightness}%, 0.7) 0%, 
            hsla(${hue}, ${saturation}%, ${lightness}%, 0.0) 70%)`;
        
        trail.element.style.filter = `blur(${4 + Math.random() * 3}px)`;
        
        // Force high visibility 
        trail.element.style.opacity = '0.8';
        
        // Animate expansion but maintain visibility if moving
        setTimeout(() => {
            trail.element.style.transform = `translate(-50%, -50%) scale(${1.5 + Math.random()})`;
            
            // Only fade out if not currently moving
            if (!isMoving) {
                trail.fadeTimer = setTimeout(() => {
                    trail.element.style.opacity = '0';
                    
                    // Deactivate after fade
                    setTimeout(() => {
                        trail.active = false;
                    }, 800);
                }, 200 + Math.random() * 300);
            }
        }, 10);
    }
    
    // Animation loop to maintain continuous trails
    function animateTrails() {
        // Keep trails alive if moving
        if (isMoving) {
            // Make sure all trails remain visible
            trails.forEach(trail => {
                if (trail.active && parseFloat(trail.element.style.opacity) < 0.4) {
                    trail.element.style.opacity = '0.4';
                }
            });
        }
        
        requestAnimationFrame(animateTrails);
    }
    
    // Start animation loop
    animateTrails();
    
    // Add click effect
    document.addEventListener('mousedown', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(0.8)';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        
        // Add extra trails in a burst
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const burstTrail = spawnTrail();
                // Make burst trails larger
                if (burstTrail) {
                    burstTrail.element.style.transform = 'translate(-50%, -50%) scale(2)';
                }
            }, i * 15);
        }
    });
    
    document.addEventListener('mouseup', () => {
        cursorDot.style.transform = 'translate(-50%, -50%)';
        cursorOutline.style.transform = 'translate(-50%, -50%)';
    });
    
    // Hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, .clickable, .btn, .logo, .nav-link');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.8)';
        });
        
        el.addEventListener('mouseout', () => {
            cursorDot.style.transform = 'translate(-50%, -50%)';
            cursorOutline.style.transform = 'translate(-50%, -50%)';
        });
    });
    
    // Generate initial trails
    setTimeout(() => {
        for (let i = 0; i < 8; i++) {
            spawnTrail();
        }
        console.log('Initial trails spawned');
    }, 500);
    
    // Show cursor and hide default cursor
    cursorDot.style.opacity = '1';
    cursorOutline.style.opacity = '1';
    document.body.style.cursor = 'none';
    
    console.log('Continuous cursor trail initialized');
});
