// ==============================
// 🌌 STARFIELD CANVAS
// ==============================
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const toggleButton = document.getElementById("ambience-toggle");
let ambienceEnabled = true;

toggleButton.addEventListener("click", () => {
  ambienceEnabled = !ambienceEnabled;
  toggleButton.textContent = ambienceEnabled ? "✨ Ambience: On" : "🌙 Ambience: Off";
  toggleButton.setAttribute("aria-pressed", ambienceEnabled);
});

const STAR_COUNT = prefersReducedMotion ? 60 : 180;
const colors = [
  "rgba(255,255,255,0.8)",
  "rgba(173,216,230,0.8)",
  "rgba(196,181,253,0.8)"
];

const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.4 + 0.2,
  vx: (Math.random() - 0.5) * 0.05,
  vy: (Math.random() - 0.5) * 0.05,
  a: Math.random() * 0.6 + 0.4,
  as: Math.random() * 0.005 + 0.002,
  c: colors[Math.floor(Math.random() * colors.length)]
}));

function drawStars(staticMode) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => {
    if (!staticMode) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0) s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
      s.a += s.as;
      if (s.a < 0.3 || s.a > 1) s.as *= -1;
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.c.replace("0.8", s.a.toFixed(2));
    ctx.shadowBlur = 6;
    ctx.shadowColor = s.c;
    ctx.fill();
  });
}

function animateStars() {
  drawStars(!ambienceEnabled || prefersReducedMotion);
  requestAnimationFrame(animateStars);
}
animateStars();


// ==============================
// 🖼️ PORTFOLIO SCROLL ARROWS
// ==============================
document.querySelectorAll(".gallery-wrapper").forEach(wrapper => {
  const gallery = wrapper.querySelector(".gallery");
  wrapper.querySelector(".scroll-arrow.left")?.addEventListener("click", () =>
    gallery.scrollBy({ left: -250, behavior: "smooth" })
  );
  wrapper.querySelector(".scroll-arrow.right")?.addEventListener("click", () =>
    gallery.scrollBy({ left: 250, behavior: "smooth" })
  );
});


// ==============================
// 🌙 LIGHTBOX CORE
// ==============================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-image");
const leftText = document.querySelector(".lightbox-text.left");
const rightText = document.querySelector(".lightbox-text.right");
const closeBtn = document.querySelector(".lightbox-close");
const dotsContainer = document.querySelector(".lightbox-dots");
const prevBtn = document.querySelector(".lightbox-arrow.left");
const nextBtn = document.querySelector(".lightbox-arrow.right");

let currentThumbs = [];
let currentIndex = 0;


// ==============================
// 🔍 ZOOM + PAN STATE
// ==============================
let isZoomed = false;
let scale = 1;
let posX = 0;
let posY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;
let lastTap = 0;

function applyTransform() {
  lightboxImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

function resetZoom() {
  isZoomed = false;
  scale = 1;
  posX = 0;
  posY = 0;
  applyTransform();
}


// ==============================
// 🖼️ OPEN LIGHTBOX
// ==============================
function openLightbox(index) {
  const img = currentThumbs[index];
  if (!img) return;

  currentIndex = index;
  resetZoom();

  lightbox.classList.remove("loaded", "hidden");
  lightboxImg.classList.add("transitioning");

  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.onload = () => lightbox.classList.add("loaded");

    leftText.innerHTML = img.dataset.left || "";
    rightText.innerHTML = img.dataset.right || "";

    updateDots();
    lightboxImg.classList.remove("transitioning");

    preloadImage(currentThumbs[(index + 1) % currentThumbs.length]?.src);
    preloadImage(currentThumbs[(index - 1 + currentThumbs.length) % currentThumbs.length]?.src);
  }, 150);
}


// ==============================
// 🧩 THUMB CLICK (PER CATEGORY)
// ==============================
document.querySelectorAll(".thumb").forEach(img => {
  img.addEventListener("click", () => {
    const gallery = img.closest(".gallery");
    currentThumbs = Array.from(gallery.querySelectorAll(".thumb"));
    currentIndex = currentThumbs.indexOf(img);
    buildDots();
    openLightbox(currentIndex);
  });
});


// ==============================
// ⏪⏩ NAVIGATION
// ==============================
prevBtn.addEventListener("click", () =>
  openLightbox((currentIndex - 1 + currentThumbs.length) % currentThumbs.length)
);
nextBtn.addEventListener("click", () =>
  openLightbox((currentIndex + 1) % currentThumbs.length)
);

document.addEventListener("keydown", e => {
  if (lightbox.classList.contains("hidden")) return;
  if (e.key === "ArrowRight") nextBtn.click();
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "Escape") lightbox.classList.add("hidden");
});


// ==============================
// 📱 SWIPE NAVIGATION
// ==============================
let swipeStartX = 0;

lightbox.addEventListener("touchstart", e => {
  swipeStartX = e.touches[0].clientX;
});

lightbox.addEventListener("touchend", e => {
  if (isZoomed) return;

  const diff = swipeStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? nextBtn.click() : prevBtn.click();
  }
});


// ==============================
// 🔎 ZOOM + DRAG
// ==============================
lightboxImg.addEventListener("click", e => {
  e.stopPropagation();
  if (!isZoomed) {
    isZoomed = true;
    scale = 2;
  } else {
    resetZoom();
  }
  applyTransform();
});

lightboxImg.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - lastTap < 300) {
    e.preventDefault();
    isZoomed ? resetZoom() : (isZoomed = true, scale = 2);
    applyTransform();
  }
  lastTap = now;
});

lightboxImg.addEventListener("mousedown", e => {
  if (!isZoomed) return;
  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
});

window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  applyTransform();
});

window.addEventListener("mouseup", () => isDragging = false);

lightboxImg.addEventListener("touchmove", e => {
  if (!isZoomed || e.touches.length !== 1) return;
  posX = e.touches[0].clientX - startX;
  posY = e.touches[0].clientY - startY;
  applyTransform();
});


// ==============================
// ⚪ PROGRESS DOTS
// ==============================
function buildDots() {
  dotsContainer.innerHTML = "";
  currentThumbs.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "lightbox-dot";
    dot.addEventListener("click", () => openLightbox(i));
    dotsContainer.appendChild(dot);
  });
  updateDots();
}

function updateDots() {
  dotsContainer.querySelectorAll(".lightbox-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}


// ==============================
// 🚪 CLOSE LIGHTBOX
// ==============================
closeBtn.addEventListener("click", () => lightbox.classList.add("hidden"));
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) lightbox.classList.add("hidden");
});


// ==============================
// 📦 UTILS
// ==============================
function preloadImage(src) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}


// ==============================
// 📱 FOOTER AUTO-HIDE (MOBILE)
// ==============================
const footer = document.getElementById("site-footer");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (window.innerWidth > 600) return;
  window.scrollY > lastScrollY
    ? footer.classList.add("hidden")
    : footer.classList.remove("hidden");
  lastScrollY = window.scrollY;
});
