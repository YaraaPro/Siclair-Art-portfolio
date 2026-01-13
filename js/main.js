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

let currentThumbs = [];
let currentIndex = 0;

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-image");
const leftText = document.querySelector(".lightbox-text.left");
const rightText = document.querySelector(".lightbox-text.right");
const closeBtn = document.querySelector(".lightbox-close");

// Close button
closeBtn.addEventListener("click", () => {
  lightbox.classList.add("hidden");
});

// Click backdrop to close
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) {
    lightbox.classList.add("hidden");
  }
});

// Escape key to close (optional but ✨)
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    lightbox.classList.add("hidden");
  }
});




// Open by index
function openLightbox(index) {
  const img = currentThumbs[index];
  if (!img) return;

  currentIndex = index;

lightbox.classList.remove("loaded");

  lightboxImg.classList.add("transitioning");

  lightboxImg.onload = () => {
  lightbox.classList.add("loaded");
};

  setTimeout(() => {
    lightboxImg.src = img.src;
    leftText.innerHTML = img.dataset.left || "";
    rightText.innerHTML = img.dataset.right || "";
    updateDots();


lightbox.classList.remove("show-text");

setTimeout(() => {
  lightbox.classList.add("show-text");
}, 200);


    // Preload neighbors
    preloadImage(currentThumbs[(index + 1) % currentThumbs.length]?.src);
    preloadImage(currentThumbs[(index - 1 + currentThumbs.length) % currentThumbs.length]?.src);

    lightboxImg.classList.remove("transitioning");
  }, 150);

  lightbox.classList.remove("hidden");
}


// Update existing click handler
document.querySelectorAll(".thumb").forEach(img => {
  img.addEventListener("click", () => {
    const gallery = img.closest(".gallery");
    currentThumbs = Array.from(gallery.querySelectorAll(".thumb"));
    currentIndex = currentThumbs.indexOf(img);

    buildDots();           // 👈 category dots
    openLightbox(currentIndex);
  });
});


// Swipe detection
let startX = 0;

lightbox.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

lightbox.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      openLightbox((currentIndex + 1) % currentThumbs.length); // next
    } else {
      openLightbox((currentIndex - 1 + currentThumbs.length) % currentThumbs.length); // prev
    }
  }
});

document.addEventListener("keydown", e => {
  if (lightbox.classList.contains("hidden")) return;

  if (e.key === "ArrowRight") {
    openLightbox((currentIndex + 1) % currentThumbs.length);
  }

  if (e.key === "ArrowLeft") {
    openLightbox((currentIndex - 1 + currentThumbs.length) % currentThumbs.length);
  }
});

const prevBtn = document.querySelector(".lightbox-arrow.left");
const nextBtn = document.querySelector(".lightbox-arrow.right");

prevBtn.addEventListener("click", () => {
  openLightbox((currentIndex - 1 + currentThumbs.length) % currentThumbs.length);
});

nextBtn.addEventListener("click", () => {
  openLightbox((currentIndex + 1) % currentThumbs.length);
});

const dotsContainer = document.querySelector(".lightbox-dots");

function buildDots() {
  dotsContainer.innerHTML = "";

  currentThumbs.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "lightbox-dot";
    dot.setAttribute("aria-label", `Go to image ${i + 1}`);
    dot.addEventListener("click", () => openLightbox(i));
    dotsContainer.appendChild(dot);
  });

  updateDots();
}

function updateDots() {
  const dots = dotsContainer.querySelectorAll(".lightbox-dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}


function updateDots() {
  document.querySelectorAll(".lightbox-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

let isZoomed = false;

lightboxImg.addEventListener("click", e => {
  e.stopPropagation(); // don’t close lightbox

  isZoomed = !isZoomed;
  lightboxImg.classList.toggle("zoomed", isZoomed);
});

isZoomed = false;
lightboxImg.classList.remove("zoomed");


// Footer
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

 // image loading
function preloadImage(src) {
  const img = new Image();
  img.src = src;
}
