// custom cursor script, makes ur mouse look cool n interactive
// inspired by gitbook n modern portfolio designs

// when page loads, init the custom cursor
// creates two elements: cursor (main) n cursorTrail (follows with delay)
// handles movement, click, hover, n window enter/leave events

document.addEventListener('DOMContentLoaded', function() {
    // --- create n append cursor elements ---
    const cursor = document.createElement('div'); // main cursor
    const cursorTrail = document.createElement('div'); // trailin cursor
    cursor.className = 'cursor';
    cursorTrail.className = 'cursor-trail';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorTrail);

    // --- mouse position state ---
    let mouseX = 0, mouseY = 0;      // where ur mouse is
    let trailX = 0, trailY = 0;      // where the trail is followin

    // --- track mouse movement n pulse on move ---
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // quick pulse when u move ur mouse
        cursor.classList.add('pulse');
        setTimeout(() => cursor.classList.remove('pulse'), 120);
    });

    // --- animate the trailin cursor ---
    function animateCursor() {
        // calc distance between main n trail cursor
        let distanceX = mouseX - trailX;
        let distanceY = mouseY - trailY;
        // move trail cursor with smoothin
        trailX += distanceX / 8;
        trailY += distanceY / 8;
        // position main cursor
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
        // position trailin cursor
        cursorTrail.style.left = `${trailX}px`;
        cursorTrail.style.top = `${trailY}px`;
        // show trail after creation
        if (cursorTrail.style.opacity === '') {
            cursorTrail.style.opacity = 0.3;
        }
        // keep animatin
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // --- click feedback: color glow like gitbook ---
    document.addEventListener('mousedown', function() {
        cursor.classList.add('click');
        setTimeout(() => cursor.classList.remove('click'), 180);
    });

    // --- hover effect for interactive elements ---
    // works on buttons, links, cards, icons, etc.
    const interactiveElements = document.querySelectorAll('a, button, .btn, .neumorphism-glass, .glass, .social-icon');
    interactiveElements.forEach(element => {
        // on mouse enter, highlight cursor
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorTrail.classList.add('hover');
        });
        // on mouse leave, revert highlight
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorTrail.classList.remove('hover');
        });
        // add hover-effect class for extra styling
        element.classList.add('hover-effect');
    });

    // --- hide cursor when leavin window ---
    document.addEventListener('mouseout', function(e) {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
            cursorTrail.style.opacity = '0';
        }
    });

    // --- show cursor again when re-enterin window ---
    document.addEventListener('mouseover', function() {
        cursor.style.opacity = '1';
        cursorTrail.style.opacity = '0.3';
    });
});