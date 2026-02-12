// Commissions page scripts

const modal = document.querySelector("#thumb-modal");
const modalImage = modal ? modal.querySelector(".thumb-modal-image") : null;
const closeModalButton = modal ? modal.querySelector(".thumb-modal-close") : null;
const prevModalButton = modal ? modal.querySelector(".thumb-modal-prev") : null;
const nextModalButton = modal ? modal.querySelector(".thumb-modal-next") : null;
const modalDotsContainer = modal ? modal.querySelector(".thumb-modal-dots") : null;
const thumbs = document.querySelectorAll(".subtype-thumb");
const exampleGrids = document.querySelectorAll(".example-grid");
const exampleImages = document.querySelectorAll(".example-grid img");
const prefersReducedMotionQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
let modalGallery = [];
let modalIndex = -1;
let isModalAnimating = false;

const extractUrlFromCss = (backgroundImage) => {
  if (!backgroundImage || backgroundImage === "none") {
    return "";
  }
  const match = backgroundImage.match(/url\((['"]?)(.*?)\1\)/);
  return match ? match[2] : "";
};

const getElementImageSrc = (element) => {
  if (!element) {
    return "";
  }
  const dataImage = element.getAttribute("data-full");
  if (dataImage) {
    return dataImage;
  }
  if (element.tagName === "IMG") {
    return element.currentSrc || element.src || "";
  }
  return extractUrlFromCss(getComputedStyle(element).backgroundImage);
};

const clearModalTransitionClasses = () => {
  if (!modalImage) {
    return;
  }
  modalImage.classList.remove(
    "is-transitioning",
    "is-exit-left",
    "is-exit-right",
    "is-enter-left",
    "is-enter-right"
  );
};

const updateModalDots = () => {
  if (!modalDotsContainer) {
    return;
  }

  const dots = modalDotsContainer.querySelectorAll(".thumb-modal-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === modalIndex);
    dot.setAttribute("aria-current", index === modalIndex ? "true" : "false");
  });
};

const buildModalDots = () => {
  if (!modalDotsContainer) {
    return;
  }

  modalDotsContainer.innerHTML = "";

  if (modalGallery.length < 2) {
    return;
  }

  modalGallery.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "thumb-modal-dot";
    dot.setAttribute("aria-label", `Go to image ${index + 1}`);
    dot.addEventListener("click", () => {
      if (!modalGallery.length || isModalAnimating) {
        return;
      }
      const direction = index > modalIndex ? 1 : -1;
      transitionModalToIndex(index, direction);
    });
    modalDotsContainer.appendChild(dot);
  });

  updateModalDots();
};

const renderModalImage = () => {
  if (!modalImage || modalGallery.length === 0 || modalIndex < 0) {
    return;
  }
  const src = modalGallery[modalIndex];
  modalImage.style.backgroundImage = `url("${src}")`;
  modalImage.setAttribute("aria-label", `Commission example ${modalIndex + 1} of ${modalGallery.length}`);

  if (prevModalButton && nextModalButton) {
    const shouldDisable = modalGallery.length < 2;
    prevModalButton.disabled = shouldDisable;
    nextModalButton.disabled = shouldDisable;
  }

  updateModalDots();
};

const transitionModalToIndex = (nextIndex, direction) => {
  if (!modalImage || !modalGallery.length || isModalAnimating) {
    return;
  }

  if (nextIndex === modalIndex) {
    return;
  }

  const shouldAnimate =
    !(prefersReducedMotionQuery && prefersReducedMotionQuery.matches) &&
    typeof window.requestAnimationFrame === "function";

  if (!shouldAnimate) {
    modalIndex = nextIndex;
    renderModalImage();
    return;
  }

  isModalAnimating = true;
  const exitClass = direction < 0 ? "is-exit-right" : "is-exit-left";
  const enterClass = direction < 0 ? "is-enter-right" : "is-enter-left";

  clearModalTransitionClasses();
  modalImage.classList.add("is-transitioning", exitClass);

  window.setTimeout(() => {
    modalIndex = nextIndex;
    renderModalImage();
    modalImage.classList.remove(exitClass);
    modalImage.classList.add(enterClass);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        modalImage.classList.remove(enterClass);
      });
    });

    window.setTimeout(() => {
      clearModalTransitionClasses();
      isModalAnimating = false;
    }, 210);
  }, 120);
};

const closeModal = () => {
  if (!modal || !modalImage) {
    return;
  }
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  clearModalTransitionClasses();
  isModalAnimating = false;
  modalImage.style.backgroundImage = "";
  document.body.classList.remove("modal-open");
  if (modalDotsContainer) {
    modalDotsContainer.innerHTML = "";
  }
  modalGallery = [];
  modalIndex = -1;
};

const openModalAt = (gallery, startIndex) => {
  if (!modal || !modalImage || !gallery.length) {
    return;
  }

  clearModalTransitionClasses();
  isModalAnimating = false;
  modalGallery = gallery;
  modalIndex = Math.max(0, Math.min(startIndex, modalGallery.length - 1));
  buildModalDots();
  renderModalImage();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const buildSubtypeGallery = (subtype) => {
  if (!subtype) {
    return [];
  }
  const images = Array.from(subtype.querySelectorAll(".example-grid img"));
  const gallery = images.map((image) => getElementImageSrc(image)).filter(Boolean);
  if (gallery.length) {
    return gallery;
  }

  const thumb = subtype.querySelector(".subtype-thumb");
  const thumbSrc = getElementImageSrc(thumb);
  return thumbSrc ? [thumbSrc] : [];
};

const openFromThumb = (thumb) => {
  const subtype = thumb.closest(".subtype");
  const thumbSrc = getElementImageSrc(thumb);
  let gallery = buildSubtypeGallery(subtype);

  if (!gallery.length && thumbSrc) {
    gallery = [thumbSrc];
  }

  let startIndex = 0;
  const thumbIndex = gallery.indexOf(thumbSrc);
  if (thumbIndex >= 0) {
    startIndex = thumbIndex;
  }

  openModalAt(gallery, startIndex);
};

const openFromExample = (image) => {
  const grid = image.closest(".example-grid");
  if (!grid) {
    return;
  }

  const images = Array.from(grid.querySelectorAll("img"));
  const gallery = [];
  let startIndex = 0;

  images.forEach((currentImage) => {
    const src = getElementImageSrc(currentImage);
    if (!src) {
      return;
    }
    if (currentImage === image) {
      startIndex = gallery.length;
    }
    gallery.push(src);
  });

  openModalAt(gallery, startIndex);
};

const navigateModal = (direction) => {
  if (!modal || !modal.classList.contains("is-open") || modalGallery.length < 2 || isModalAnimating) {
    return;
  }
  const nextIndex = (modalIndex + direction + modalGallery.length) % modalGallery.length;
  transitionModalToIndex(nextIndex, direction);
};

const setupExampleCarousel = (grid) => {
  if (!grid || grid.classList.contains("example-carousel-track")) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "example-carousel";

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "example-arrow example-arrow-prev";
  prev.setAttribute("aria-label", "Scroll examples left");
  prev.textContent = "\u2039";

  const next = document.createElement("button");
  next.type = "button";
  next.className = "example-arrow example-arrow-next";
  next.setAttribute("aria-label", "Scroll examples right");
  next.textContent = "\u203A";

  const parent = grid.parentElement;
  if (!parent) {
    return;
  }

  parent.insertBefore(wrapper, grid);
  wrapper.appendChild(prev);
  wrapper.appendChild(grid);
  wrapper.appendChild(next);
  grid.classList.add("example-carousel-track");

  const scrollStep = () => Math.max(grid.clientWidth * 0.75, 140);

  const updateArrows = () => {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    prev.disabled = grid.scrollLeft <= 2 || maxScroll <= 0;
    next.disabled = grid.scrollLeft >= maxScroll - 2 || maxScroll <= 0;
  };

  prev.addEventListener("click", () => {
    grid.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    grid.scrollBy({ left: scrollStep(), behavior: "smooth" });
  });

  grid.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  updateArrows();
};

exampleGrids.forEach((grid) => {
  setupExampleCarousel(grid);
});

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openFromThumb(thumb);
  });
});

exampleImages.forEach((image) => {
  image.addEventListener("click", (event) => {
    event.preventDefault();
    openFromExample(image);
  });
});

if (closeModalButton) {
  closeModalButton.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

if (prevModalButton) {
  prevModalButton.addEventListener("click", () => {
    navigateModal(-1);
  });
}

if (nextModalButton) {
  nextModalButton.addEventListener("click", () => {
    navigateModal(1);
  });
}

document.addEventListener("keydown", (event) => {
  if (!modal || !modal.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeModal();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    navigateModal(-1);
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    navigateModal(1);
  }
});
