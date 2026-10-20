// Honour an explicit dark-mode choice while keeping light mode as the default.
// Kept as an external script so the deployed Content-Security-Policy can forbid
// inline JavaScript.
(function () {
  try {
    var stored = localStorage.getItem("akisawa-theme");
    if (stored === "dark") document.documentElement.classList.add("dark");
  } catch (error) {
    /* storage blocked - fall through to the light default */
  }
})();
