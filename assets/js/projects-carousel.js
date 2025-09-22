document.addEventListener('DOMContentLoaded', function () {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const nextBtn = document.querySelector('.carousel-arrow.right');
    const prevBtn = document.querySelector('.carousel-arrow.left');
    const indicators = Array.from(document.querySelectorAll('.indicator'));
    let current = 0;
    function updateCarousel(idx) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === idx);
        });
        indicators.forEach((dot, i) => {
            dot.classList.toggle('active', i === idx);
        });
        // Move the track
        track.style.transform = `translateX(-${idx * 100}%)`;
        current = idx;
    }
    nextBtn.addEventListener('click', () => {
        const next = (current + 1) % slides.length;
        updateCarousel(next);
    });
    prevBtn.addEventListener('click', () => {
        const prev = (current - 1 + slides.length) % slides.length;
        updateCarousel(prev);
    });
    indicators.forEach((dot, idx) => {
        dot.addEventListener('click', () => updateCarousel(idx));
    });
    // Init
    updateCarousel(0);
});
