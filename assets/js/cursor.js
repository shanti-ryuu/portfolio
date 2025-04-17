// Wait for the DOM to be fully loaded before executing the cursor effect
document.addEventListener('DOMContentLoaded', function() {
    // Create cursor elements to be appended to the DOM
    const cursor = document.createElement('div');
    const cursorTrail = document.createElement('div');
    
    // Add appropriate class names for styling
    cursor.className = 'cursor';
    cursorTrail.className = 'cursor-trail';
    
    // Append cursor elements to the document body
    document.body.appendChild(cursor);
    document.body.appendChild(cursorTrail);
    
    // Variables to store mouse positions
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    
    // Add event listener to track mouse position
    document.addEventListener('mousemove', function(e) {
        // Update mouse position variables
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Function to create smokey cursor animation
    function animateCursor() {
        // Calculate the distance for the trail to smoothly follow the cursor
        // This creates a delayed "trailing" effect
        let distanceX = mouseX - trailX;
        let distanceY = mouseY - trailY;
        
        // Update trail position with smooth easing
        // The division by 8 controls the trail speed/delay
        trailX += distanceX / 8;
        trailY += distanceY / 8;
        
        // Update cursor position (follows mouse exactly)
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
        
        // Update cursor trail position (follows with delay)
        cursorTrail.style.left = `${trailX}px`;
        cursorTrail.style.top = `${trailY}px`;
        
        // Gradually show the trail after it's been created
        if (cursorTrail.style.opacity === '') {
            cursorTrail.style.opacity = 0.3;
        }
        
        // Continue the animation loop
        requestAnimationFrame(animateCursor);
    }
    
    // Start the cursor animation
    animateCursor();
    
    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .neumorphism-glass, .glass, .social-icon');
    
    // Add event listeners to all interactive elements
    interactiveElements.forEach(element => {
        // Mouse enter event - change cursor style
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorTrail.classList.add('hover');
        });
        
        // Mouse leave event - revert cursor style
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorTrail.classList.remove('hover');
        });
        
        // Add hover-effect class to enable additional styling
        element.classList.add('hover-effect');
    });
    
    // Hide cursor when it leaves the window
    document.addEventListener('mouseout', function(e) {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
            cursorTrail.style.opacity = '0';
        }
    });
    
    // Show cursor when it enters the window
    document.addEventListener('mouseover', function() {
        cursor.style.opacity = '1';
        cursorTrail.style.opacity = '0.3';
    });
});