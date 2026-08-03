document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnMenuMovil");
  const sidebar = document.querySelector(".sidebar");
  if (!btn || !sidebar) return;

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    sidebar.classList.toggle("sidebar-visible");
  });

  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 860 &&
        sidebar.classList.contains("sidebar-visible") &&
        !sidebar.contains(e.target) &&
        e.target !== btn) {
      sidebar.classList.remove("sidebar-visible");
    }
  });

  sidebar.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => sidebar.classList.remove("sidebar-visible"));
  });
});