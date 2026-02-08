// Shared site interactions
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Starfield canvas
const canvas = document.getElementById("starfield");
const toggleButton = document.getElementById("ambience-toggle");
let ambienceEnabled = true;

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    ambienceEnabled = !ambienceEnabled;
    toggleButton.textContent = ambienceEnabled ? "✨ Ambience: On" : "🌙 Ambience: Off";
    toggleButton.setAttribute("aria-pressed", ambienceEnabled);
  });
}

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

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
}

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navBar = document.querySelector(".navbar");
const navLinks = document.querySelector(".navbar .nav-links");

if (navToggle && navBar && navLinks) {
  const mq = window.matchMedia("(max-width: 800px)");

  const closeMenu = () => {
    if (!navBar.classList.contains("open")) return;
    navBar.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navBar.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (mq.matches) closeMenu();
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });

  mq.addEventListener("change", e => {
    if (!e.matches) closeMenu();
  });
}

// Entrance animations
const revealItems = document.querySelectorAll(".fade-in, .reveal");
if (revealItems.length) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (prefersReducedMotion) {
            entry.target.classList.add("visible");
          } else {
            const delay = Number.parseInt(entry.target.dataset.revealDelay, 10);
            if (!Number.isNaN(delay)) {
              entry.target.style.transitionDelay = `${delay}ms`;
            }
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                entry.target.classList.add("visible");
              });
            });
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach(el => {
    observer.observe(el);
  });
}

// Dev shortcut to ProjectVC
const params = new URLSearchParams(window.location.search);
if (params.has("dev")) {
  const footer = document.getElementById("site-footer");
  const devLink = document.createElement("a");
  devLink.href = "projectVC.html";
  devLink.className = "dev-access-link";
  devLink.textContent = "Dev: ProjectVC";
  devLink.setAttribute("aria-label", "Developer shortcut to ProjectVC");
  if (footer) {
    footer.appendChild(devLink);
  } else {
    document.body.appendChild(devLink);
  }
}
