// Commissions page scripts

const modal = document.querySelector("#thumb-modal");
const modalImage = modal ? modal.querySelector(".thumb-modal-image") : null;
const closeModalButton = modal ? modal.querySelector(".thumb-modal-close") : null;
const thumbs = document.querySelectorAll(".subtype-thumb");

const closeModal = () => {
  if (!modal || !modalImage) {
    return;
  }
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalImage.style.backgroundImage = "";
  document.body.classList.remove("modal-open");
};

const openModal = (thumb) => {
  if (!modal || !modalImage) {
    return;
  }
  const dataImage = thumb.getAttribute("data-full");
  let background = "";

  if (dataImage) {
    background = `url("${dataImage}")`;
  } else {
    background = getComputedStyle(thumb).backgroundImage;
  }

  if (!background || background === "none") {
    return;
  }

  modalImage.style.backgroundImage = background;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openModal(thumb);
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && modal.classList.contains("is-open")) {
    closeModal();
  }
});
