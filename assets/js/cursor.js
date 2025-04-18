document.addEventListener('DOMContentLoaded', function() {
    // create cursor elements to be appended to the DOM
    const cursor = document.createElement('div');
    const cursorTrail = document.createElement('div');
    
    cursor.className = 'cursor';
    cursorTrail.className = 'cursor-trail';
    
    // append cursor elements to the document body
    document.body.appendChild(cursor);
    document.body.appendChild(cursorTrail);
    
    // vriables to store mouse positions
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    
    // add event listener to track mouse position
    document.addEventListener('mousemove', function(e) {
        // mouse position variables
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // function to create animation
    function animateCursor() {
        // calculate the distance for the trail to smoothly follow the cursor
        // this creates a delayed "trailing" effect
        let distanceX = mouseX - trailX;
        let distanceY = mouseY - trailY;
        
        // trail position with smooth easing
        // the division by 8 controls the trail speed/delay
        trailX += distanceX / 8;
        trailY += distanceY / 8;
        
        // cursor position (follows mouse exactly)
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
        
        // cursor trail position (follows with delay)
        cursorTrail.style.left = `${trailX}px`;
        cursorTrail.style.top = `${trailY}px`;
        
        // show the trail after it's been created
        if (cursorTrail.style.opacity === '') {
            cursorTrail.style.opacity = 0.3;
        }
        
        // cont the animation loop
        requestAnimationFrame(animateCursor);
    }
    
    // start the cursor animation
    animateCursor();
    
    // add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .neumorphism-glass, .glass, .social-icon');
    
    // add event listeners to all interactive elements
    interactiveElements.forEach(element => {
        // mouse enter event - change cursor style
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorTrail.classList.add('hover');
        });
        
        // mouse leave event - revert cursor style
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorTrail.classList.remove('hover');
        });
        
        // add hover-effect class to enable additional styling
        element.classList.add('hover-effect');
    });
    
    // hide cursor when it leaves the window
    document.addEventListener('mouseout', function(e) {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
            cursorTrail.style.opacity = '0';
        }
    });
    
    // show cursor when it enters the window
    document.addEventListener('mouseover', function() {
        cursor.style.opacity = '1';
        cursorTrail.style.opacity = '0.3';
    });
});