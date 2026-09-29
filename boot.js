/* Runs in <head> before first paint: marks JS as available and applies the
   saved theme, so there is no flash of the wrong theme or unrevealed content. */
(function () {
    var root = document.documentElement;
    root.classList.add("js");
    try {
        // A visitor who picked a language with the TR/EN switch lands on that page next time.
        // Only an explicit choice redirects, so search engines always see both pages as they are.
        var saved = localStorage.getItem("skymoon-lang");
        var here = root.getAttribute("lang") === "en" ? "en" : "tr";
        if ((saved === "en" || saved === "tr") && saved !== here) {
            location.replace((saved === "en" ? "/en/" : "/") + location.search + location.hash);
            return;
        }
        if (localStorage.getItem("skymoon-theme") === "light") root.setAttribute("data-theme", "light");
        if (sessionStorage.getItem("skymoon-intro")) root.classList.add("intro-seen");
    } catch (_) { /* storage blocked — defaults apply */ }
})();
