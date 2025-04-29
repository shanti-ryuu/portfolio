// typing effect script, makes it look like u're actually typin stuff lol
// this script animates text like typewriter, goes brrr
// usage: typeWriterLoop(text, elementId, speed, pause)
//   - text: what u wanna show
//   - elementId: put ur element id here bro
//   - speed: how fast it types (ms)
//   - pause: lil break before it erases (ms)

/*
 * animate the typing n erasing loop on ur element
 * @param {string} text - what to type out
 * @param {string} elementId - the id of ur element
 * @param {number} speed - how fast it types, in ms
 * @param {number} pause - how long to chill before erasing (default 1500)
 */
function typeWriterLoop(text, elementId, speed, pause = 1500) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let i = 0; // Current character index
    let isErasing = false; // Typing or erasing mode
    // make the lil blinking cursor thingy
    let cursorSpan = document.createElement('span');
    cursorSpan.className = 'typing-cursor';
    cursorSpan.textContent = '|';
    el.textContent = '';
    el.appendChild(cursorSpan);
    // Set monospace font for typing effect
    el.style.fontFamily = "'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace";

    // main typing/erasing function, this is where the magic happens
    function type() {
        if (!isErasing) {
            // typing mode, adds letters one by one like a real dude
            if (i < text.length) {
                el.childNodes[0].textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // chill for a bit before start erasing
                setTimeout(() => { isErasing = true; type(); }, pause);
            }
        } else {
            // erasing mode, bye bye letters
            if (i > 0) {
                el.childNodes[0].textContent = text.substring(0, i - 1);
                i--;
                setTimeout(type, speed / 2);
            } else {
                // wait a sec before typing again
                isErasing = false;
                setTimeout(type, speed);
            }
        }
    }
    // gotta put an empty text node before the cursor or it freaks out
    el.insertBefore(document.createTextNode(''), cursorSpan);
    type();
}

// when the page loads, start the typing thingy
// this animates the subtitle, looks cool
// change the text or element id if u want, idc lol

document.addEventListener('DOMContentLoaded', function() {
    typeWriterLoop("BSIT | Aspiring Cybersecurity Professional", "typing-h3", 50, 1500);
});
