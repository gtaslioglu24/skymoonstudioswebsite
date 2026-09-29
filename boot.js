/* Runs in <head> before first paint: marks JS as available and applies the
   saved theme, so there is no flash of the wrong theme or unrevealed content. */
(function () {
    var root = document.documentElement;
    root.classList.add("js");
    try {
        if (localStorage.getItem("skymoon-theme") === "light") root.setAttribute("data-theme", "light");
        if (localStorage.getItem("skymoon-lang") === "en") root.setAttribute("lang", "en");
        if (sessionStorage.getItem("skymoon-intro")) root.classList.add("intro-seen");
    } catch (_) { /* storage blocked — defaults apply */ }
})();
