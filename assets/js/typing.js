//typing effect
function typeWriterLoop(text, elementId, speed, pause = 1500) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let i = 0;
    let isErasing = false;
    let cursorSpan = document.createElement('span');
    cursorSpan.className = 'typing-cursor';
    cursorSpan.textContent = '|';
    el.textContent = '';
    el.appendChild(cursorSpan);

    function type() {
        if (!isErasing) {
            if (i < text.length) {
                el.childNodes[0].textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(() => { isErasing = true; type(); }, pause);
            }
        } else {
            if (i > 0) {
                el.childNodes[0].textContent = text.substring(0, i - 1);
                i--;
                setTimeout(type, speed / 2);
            } else {
                isErasing = false;
                setTimeout(type, speed);
            }
        }
    }
    // insert a text node before the cursor
    el.insertBefore(document.createTextNode(''), cursorSpan);
    type();
}

document.addEventListener('DOMContentLoaded', function() {
    typeWriterLoop("BSIT | Aspiring Cybersecurity Professional", "typing-h3", 50, 1500);
});
