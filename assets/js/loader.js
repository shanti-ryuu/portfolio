function createPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <div class="cyber-spinner"></div>
            <div class="loading-text">LOADING<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
        </div>
    `;
    document.body.prepend(preloader);
    
    // Hide preloader after everything is loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('preloader-hidden');
            setTimeout(function() {
                preloader.remove();
            }, 500);
        }, 500);
    });
}

createPreloader();
