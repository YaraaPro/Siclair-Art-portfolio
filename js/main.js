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
let scale = 1;
let posX = 0;
let posY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;
let isZoomed = false;
let lastTap = 0;
let lastX = 0;
let lastY = 0;


function updateTransform() {
  lightboxImg.style.transform =
    `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`;
}


function resetZoom() {
  scale = 1;
  posX = 0;
  posY = 0;
  isZoomed = false;
  lightboxImg.classList.remove("zoomed");
  updateTransform();
}



/* CLICK / DOUBLE TAP TO ZOOM */
let lastTapTime = 0;
const DOUBLE_TAP_DELAY = 300;

lightboxImg.addEventListener("touchend", e => {
  e.preventDefault();

  const now = Date.now();
  const tapGap = now - lastTapTime;

  if (tapGap < DOUBLE_TAP_DELAY) {
    // 🔍 DOUBLE TAP → TOGGLE ZOOM
    isZoomed = !isZoomed;
    scale = isZoomed ? 2 : 1;
    posX = 0;
    posY = 0;
    updateTransform();
  }

  lastTapTime = now;
}, { passive: false });


/* DOUBLE TAP (mobile) */
lightboxImg.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - lastTap < 300) {
    isZoomed = !isZoomed;
    scale = isZoomed ? 2 : 1;
    posX = 0;
    posY = 0;
    lightboxImg.classList.toggle("zoomed", isZoomed);
    updateTransform();
  }
  lastTap = now;
});

/* DRAG START */
function startDrag(x, y) {
  isDragging = true;
  lastX = x;
  lastY = y;
  lightboxImg.classList.add("dragging");
}

lightboxImg.addEventListener("mousedown", e => {
  if (!isZoomed) return;
  e.preventDefault();
  startDrag(e.clientX, e.clientY);
});

lightboxImg.addEventListener("touchstart", e => {
  if (!isZoomed) return;
  e.preventDefault();
  const t = e.touches[0];
  startDrag(t.clientX, t.clientY);
}, { passive: false });

/* DRAG MOVE */
function dragMove(x, y) {
  if (!isDragging) return;

  const dx = x - lastX;
  const dy = y - lastY;

  posX += dx;
  posY += dy;

  lastX = x;
  lastY = y;

  applyBounds();
  updateTransform();
}

document.addEventListener("mousemove", e => {
  dragMove(e.clientX, e.clientY);
});

document.addEventListener("touchmove", e => {
  if (!isDragging) return;
  e.preventDefault();
  const t = e.touches[0];
  dragMove(t.clientX, t.clientY);
}, { passive: false });


/* DRAG END */
function endDrag() {
  isDragging = false;
  lightboxImg.classList.remove("dragging");
}

document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

/* SOFT BOUNDS */
function applyBounds() {
  const maxOffsetX = (lightboxImg.clientWidth * (scale - 1)) / 2;
  const maxOffsetY = (lightboxImg.clientHeight * (scale - 1)) / 2;

  const damp = 0.85;

  if (posX > maxOffsetX) posX = maxOffsetX * damp;
  if (posX < -maxOffsetX) posX = -maxOffsetX * damp;

  if (posY > maxOffsetY) posY = maxOffsetY * damp;
  if (posY < -maxOffsetY) posY = -maxOffsetY * damp;
}


/* RESET ZOOM WHEN IMAGE CHANGES */
function onImageChange() {
  resetZoom();
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
lightbox.addEventListener("touchend", e => {
  if (isZoomed) return; // 🚫 don’t swipe while zoomed

  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) > 50) {
    diff > 0
      ? openLightbox((currentIndex + 1) % currentThumbs.length)
      : openLightbox((currentIndex - 1 + currentThumbs.length) % currentThumbs.length);
  }
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
