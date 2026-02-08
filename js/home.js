// ==============================
// HERO STAR  SHOW SIGIL
// ==============================

const heroStars = document.querySelectorAll(".hero-star");
const sigil = document.querySelector(".sigil-wrapper");
const heartStars = document.querySelector(".hero-stars");
const heartPulse = document.querySelector(".hero-stars-pulse");
const sigilStars = Array.from(document.querySelectorAll(".sigil-star"));
let sigilOrder = [];
let sigilIndex = 0;

heroStars.forEach(star => {
  star.addEventListener("click", () => {
    console.log("STAR CLICKED");
    const isOpening = !sigil.classList.contains("active");

    if (isOpening) {
      sigil.classList.add("active");

      // reset + randomize reveal order each time
      sigilStars.forEach(s => {
        s.classList.remove("show");
        s.classList.remove("correct");
        s.style.transitionDelay = "0ms";
      });

      const shuffled = sigilStars
        .map(s => ({ s, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(({ s }) => s);

      sigilOrder = shuffled;
      sigilIndex = 0;

      shuffled.forEach((s, i) => {
        s.style.transitionDelay = `${i * 200}ms`;
        requestAnimationFrame(() => s.classList.add("show"));
      });
    } else {
      sigil.classList.remove("active");
      sigilStars.forEach(s => {
        s.classList.remove("show");
        s.classList.remove("correct");
        s.style.transitionDelay = "0ms";
      });
      sigilOrder = [];
      sigilIndex = 0;
    }

    heartStars?.classList.toggle("is-visible");
    heartPulse?.classList.toggle("is-visible");
  });
});

sigilStars.forEach(star => {
  star.addEventListener("click", () => {
    if (!sigil.classList.contains("active")) return;

    const expected = sigilOrder[sigilIndex];
    if (star !== expected) {
      sigilIndex = 0;
      sigilStars.forEach(s => s.classList.remove("correct"));
      sigil.classList.remove("shake");
      void sigil.offsetWidth;
      sigil.classList.add("shake");
      sigilIndex = 0;
      return;
    }

    sigilIndex += 1;
    star.classList.add("correct");
    if (sigilIndex >= sigilOrder.length) {
      window.location.href = "projectVC.html";
    }
  });
});

