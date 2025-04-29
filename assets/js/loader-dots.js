// dots loader script, makes those cute little dots appear when stuff is loadin
// inspired by csss.loaders.com/dots, v vibey

/**
 * show the dots loader overlay on the page
 * if the loader is already there, it does nothin
 */
function showDotsLoader() {
    // check if loader is already there
    if (document.getElementById('dots-loader-overlay')) return;
    // create the overlay element
    const overlay = document.createElement('div');
    overlay.id = 'dots-loader-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.12)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;
    // add the loader dots
    overlay.innerHTML = `
      <div class="loader-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>`;
    document.body.appendChild(overlay);
}

/**
 * remove the dots loader overlay from the page
 */
function hideDotsLoader() {
    const overlay = document.getElementById('dots-loader-overlay');
    if (overlay) overlay.remove();
}

// usage example (uncomment to test)
// showDotsLoader();
// setTimeout(hideDotsLoader, 2000);
