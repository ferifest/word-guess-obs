(() => {
  const accent = document.getElementById("accent");
  if (accent) {
    const apply = () => document.documentElement.style.setProperty("--accent", accent.value);
    accent.addEventListener("input", apply);
    accent.addEventListener("change", apply);
  }
  const revealTargets = document.querySelectorAll(".builder-heading,.builder-main,.builder-aside,.preview-note");
  revealTargets.forEach(el => el.classList.add("reveal-on-scroll"));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    revealTargets.forEach(el => observer.observe(el));
  } else revealTargets.forEach(el => el.classList.add("visible"));
})();