// ripple effect script, makes ur buttons look cool when u click em
// adds that material/ozone vibe to ur buttons
// how it works:
// 1. click a button, ripple appears
// 2. ripple expands out
// 3. if there's already a ripple, it gets removed
// 4. when done, the ripple disappears
//
// makes ur buttons look super smooth and modern

// wait for page to load before we attach the click handlers
// makes sure all our buttons are ready to go

document.addEventListener('DOMContentLoaded', function() {
  /*
   * creates n animates the ripple when u click a button
   * @param {MouseEvent} event - the click event, duh
   */
  function createRipple(event) {
    const button = event.currentTarget;
    // remove any old ripples so they dont overlap, keep it clean
    const oldRipple = button.querySelector('.ripple');
    if (oldRipple) oldRipple.remove();

    // figure out how big the ripple needs to be to cover the button
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    // figure out where u clicked on the button
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    // create the ripple and position it where u clicked
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    // add the ripple to the button, looks cool
    button.appendChild(ripple);
    // clean up the ripple after it's done animating
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // attach the ripple effect to all buttons, works with dynamically added ones too
  document.querySelectorAll('.btn, .button').forEach(btn => {
    btn.addEventListener('click', createRipple);
  });
});
