document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    themeToggle.addEventListener("click", function() {
        body.classList.toggle("light-mode");
        localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
        themeToggle.textContent = body.classList.contains("light-mode") ? "☀️" : "🌙";
    });

    // Preserve theme across sessions
    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
        themeToggle.textContent = "☀️";
    }
});
