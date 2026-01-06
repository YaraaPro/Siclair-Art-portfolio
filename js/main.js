// ===== CANVAS SETUP =====
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

// ===== RESIZE =====
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ===== MOTION PREFERENCE =====
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== AMBIENCE TOGGLE =====
const toggleButton = document.getElementById("ambience-toggle");
let ambienceEnabled = true;

toggleButton.addEventListener("click", () => {
  ambienceEnabled = !ambienceEnabled;

  toggleButton.textContent = ambienceEnabled
    ? "✨ Ambience: On"
    : "🌙 Ambience: Off";

  toggleButton.setAttribute("aria-pressed", ambienceEnabled);
});

// ===== STAR SETUP =====
const STAR_COUNT = prefersReducedMotion ? 60 : 180;
const colors = [
  "rgba(255,255,255,0.8)",
  "rgba(173,216,230,0.8)",
  "rgba(196,181,253,0.8)"
];

const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  radius: Math.random() * 1.4 + 0.2,
  vx: (Math.random() - 0.5) * 0.05,
  vy: (Math.random() - 0.5) * 0.05,
  alpha: Math.random() * 0.6 + 0.4,
  alphaSpeed: Math.random() * 0.005 + 0.002,
  color: colors[Math.floor(Math.random() * colors.length)]
}));

// ===== DRAW STARS (STATIC) =====
function drawStars(staticMode = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    if (!staticMode) {
      // Move stars gently
      star.x += star.vx;
      star.y += star.vy;

      // Wrap edges
      if (star.x < 0) star.x = canvas.width;
      if (star.x > canvas.width) star.x = 0;
      if (star.y < 0) star.y = canvas.height;
      if (star.y > canvas.height) star.y = 0;

      // Twinkle
      star.alpha += star.alphaSpeed;
      if (star.alpha <= 0.3 || star.alpha >= 1) star.alphaSpeed *= -1;
    }

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = star.color.replace("0.8", star.alpha.toFixed(2));
    ctx.shadowBlur = 6;
    ctx.shadowColor = star.color.replace("0.8", (star.alpha / 2).toFixed(2));
    ctx.fill();
  });
}

// ===== ANIMATION LOOP =====
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (ambienceEnabled && !prefersReducedMotion) {
    drawStars(false); // animated
  } else {
    drawStars(true);  // static
  }

  requestAnimationFrame(animate);
}

animate();


// ===== START =====
animate();


// portfolio categories
document.querySelectorAll(".gallery-wrapper").forEach(wrapper => {
  const gallery = wrapper.querySelector(".gallery");
  const leftArrow = wrapper.querySelector(".scroll-arrow.left");
  const rightArrow = wrapper.querySelector(".scroll-arrow.right");

  const scrollAmount = 250; // pixels per click

  leftArrow.addEventListener("click", () => {
    gallery.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  rightArrow.addEventListener("click", () => {
    gallery.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
});

// Create lightbox container
const lightbox = document.createElement("div");
lightbox.id = "lightbox";
document.body.appendChild(lightbox);

lightbox.style.cssText = `
  position: fixed;
  top:0; left:0;
  width:100%; height:100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content:center;
  align-items:center;
  opacity:0;
  pointer-events:none;
  transition: opacity 0.3s;
  z-index:1000;
`;

const lightboxImg = document.createElement("img");
lightboxImg.style.maxWidth = "90%";
lightboxImg.style.maxHeight = "90%";
lightboxImg.style.borderRadius = "10px";
lightbox.appendChild(lightboxImg);

// Click thumbnail
document.querySelectorAll(".gallery img").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.dataset.full;
    lightbox.style.opacity = "1";
    lightbox.style.pointerEvents = "all";
  });
});

// Click outside image to close
lightbox.addEventListener("click", e => {
  if (e.target !== lightboxImg) {
    lightbox.style.opacity = "0";
    lightbox.style.pointerEvents = "none";
  }
});

let lastScrollY = window.scrollY;
const footer = document.getElementById("site-footer");

window.addEventListener("scroll", () => {
  if (window.innerWidth > 600) return; // mobile only

  if (window.scrollY > lastScrollY + 10) {
    // scrolling down → hide
    footer.classList.add("hidden");
  } else if (window.scrollY < lastScrollY - 10) {
    // scrolling up → show
    footer.classList.remove("hidden");
  }

  lastScrollY = window.scrollY;
});
