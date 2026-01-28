
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


// =========================
// ✨ ENTRANCE ANIMATIONS
// =========================

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".fade-in, .reveal").forEach(el => {
  observer.observe(el);
});



// ==============================
// 🌙 LIGHTBOX CORE (READY-TO-PASTE)
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

// Zoom / Pan State
let scale = 1, posX = 0, posY = 0;
let isZoomed = false, isDragging = false;
let lastX = 0, lastY = 0;
let touchStartX = 0, touchStartY = 0, touchMoved = false;
const ZOOM_SCALE = 2;
const DOUBLE_TAP_DELAY = 400; // ✅ more forgiving
const MOVE_THRESHOLD = 10;
let lastTapTime = 0;

// ------------------------------
// Update image transform
function updateTransform() {
  lightboxImg.style.transform = `translate3d(${posX}px, ${posY}px,0) scale(${scale})`;
}

// Reset zoom
function resetZoom() {
  scale = 1; posX = 0; posY = 0;
  isZoomed = false;
  isDragging = false;
  lightboxImg.classList.remove("zoomed", "dragging");
  updateTransform();
}

// Toggle zoom
function toggleZoom() {
  isZoomed = !isZoomed;
  scale = isZoomed ? ZOOM_SCALE : 1;
  posX = 0; posY = 0;
  lightboxImg.classList.toggle("zoomed", isZoomed);
  updateTransform();
}

// Apply bounds
function applyBounds() {
  const maxX = (lightboxImg.clientWidth * (scale - 1)) / 2;
  const maxY = (lightboxImg.clientHeight * (scale - 1)) / 2;
  const damp = 0.85;
  if (posX > maxX) posX = maxX * damp;
  if (posX < -maxX) posX = -maxX * damp;
  if (posY > maxY) posY = maxY * damp;
  if (posY < -maxY) posY = -maxY * damp;
}

// ------------------------------
// Drag handlers
function startDrag(x, y) {
  isDragging = true; lastX = x; lastY = y;
  lightboxImg.classList.add("dragging");
}
function dragMove(x, y) {
  if (!isDragging) return;
  const dx = x - lastX, dy = y - lastY;
  posX += dx; posY += dy;
  lastX = x; lastY = y;
  applyBounds();
  updateTransform();
}
function endDrag() {
  isDragging = false;
  lightboxImg.classList.remove("dragging");
}

// ------------------------------
// Desktop double-click
lightboxImg.addEventListener("dblclick", e => { e.preventDefault(); toggleZoom(); });

// ------------------------------
// Mobile touch gestures (double-tap + drag + swipe)
lightboxImg.addEventListener("touchstart", e => {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  touchStartX = t.clientX; touchStartY = t.clientY;
  lastX = t.clientX; lastY = t.clientY;
  touchMoved = false;

  if (isZoomed) isDragging = true;
});

lightboxImg.addEventListener("touchmove", e => {
  if (!isDragging) return;
  const t = e.touches[0];
  const dx = t.clientX - lastX, dy = t.clientY - lastY;
  if (!touchMoved && Math.hypot(dx, dy) < MOVE_THRESHOLD) return;
  touchMoved = true;
  e.preventDefault();
  posX += dx; posY += dy;
  lastX = t.clientX; lastY = t.clientY;
  applyBounds(); updateTransform();
});

lightboxImg.addEventListener("touchend", e => {
  const now = Date.now();
  if (!touchMoved) {
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      toggleZoom();
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;
  }
  isDragging = false;
  touchMoved = false;
});

// ------------------------------
// Open lightbox
function openLightbox(index) {
  const img = currentThumbs[index];
  if (!img) return;
  currentIndex = index; resetZoom();

  lightbox.classList.remove("loaded", "hidden");
  lightboxImg.classList.add("transitioning");

  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.onload = () => lightbox.classList.add("loaded");

    leftText.innerHTML = img.dataset.left || "";
    rightText.innerHTML = img.dataset.right || "";

    lightbox.classList.remove("show-text");
    requestAnimationFrame(() => lightbox.classList.add("show-text"));

    updateDots();
    lightboxImg.classList.remove("transitioning");

    preloadImage(currentThumbs[(index + 1) % currentThumbs.length]?.src);
    preloadImage(currentThumbs[(index - 1 + currentThumbs.length) % currentThumbs.length]?.src);
  }, 150);
}

// ------------------------------
// Thumbnail click (per category)
document.querySelectorAll(".thumb").forEach(img => {
  img.addEventListener("click", () => {
    const gallery = img.closest(".gallery");
    currentThumbs = Array.from(gallery.querySelectorAll(".thumb"));
    currentIndex = currentThumbs.indexOf(img);
    buildDots();
    openLightbox(currentIndex);
  });
});

// ------------------------------
// Navigation arrows
prevBtn.addEventListener("click", () =>
  openLightbox((currentIndex - 1 + currentThumbs.length) % currentThumbs.length));
nextBtn.addEventListener("click", () =>
  openLightbox((currentIndex + 1) % currentThumbs.length));

document.addEventListener("keydown", e => {
  if (lightbox.classList.contains("hidden")) return;
  if (e.key === "ArrowRight") nextBtn.click();
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "Escape") lightbox.classList.add("hidden");
});

// ------------------------------
// Swipe (only when not zoomed)
lightbox.addEventListener("touchstart", e => {
  if (isZoomed) return;
  startX = e.touches[0].clientX;
});
lightbox.addEventListener("touchend", e => {
  if (isZoomed) return;
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (Math.abs(diff) > 50) {
    diff > 0
      ? openLightbox((currentIndex + 1) % currentThumbs.length)
      : openLightbox((currentIndex - 1 + currentThumbs.length) % currentThumbs.length);
  }
});

// ------------------------------
// Progress dots
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

// ------------------------------
// Close
closeBtn.addEventListener("click", () => lightbox.classList.add("hidden"));
lightbox.addEventListener("click", e => { if (e.target === lightbox) lightbox.classList.add("hidden"); });

// ------------------------------
// Utilities
function preloadImage(src) {
  if (!src) return;
  const img = new Image(); img.src = src;
}

// touch end
lightboxImg.addEventListener("touchend", e => {
  const now = Date.now();
  const tapDuration = now - touchStartTime;

  // DOUBLE TAP (only if finger didn't move)
  if (!touchMoved && tapDuration < 250) {
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      toggleZoom();
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;
  }

  isDragging = false;
  touchMoved = false;
});

/* DRAG START */
lightboxImg.addEventListener("mousedown", e => {
  if (!isZoomed) return;
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});



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
  if (!isDragging) return;
  dragMove(e.clientX, e.clientY);
});


lightboxImg.addEventListener("touchmove", e => {
  if (!isZoomed) return;

  const t = e.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  // 👇 movement threshold (prevents clunk)
  if (!hasMoved && Math.hypot(dx, dy) < 8) return;

  hasMoved = true;
  e.preventDefault(); // 🚫 stop scrolling

  posX += t.clientX - lastX;
  posY += t.clientY - lastY;

  lastX = t.clientX;
  lastY = t.clientY;

  applyBounds();
  updateTransform();
}, { passive: false });


/* DRAG END */
function endDrag() {
  isDragging = false;
  lightboxImg.classList.remove("dragging");
}

document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", () => {
  endDrag();
  hasMoved = false;
});


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

  // ✨ re-trigger caption animation
  lightbox.classList.remove("show-text");
  requestAnimationFrame(() => {
    lightbox.classList.add("show-text");
  });

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

