// OCs page scripts

const ocData = [
  {
    id: "theodore",
    name: "Theodore Malik",
    role: "Immortal Asshole",
    storyline: "Heaven's Flame",
    image: "images/Commissions/Commission portrait.png",
    tags: ["immortal", "tragic", "fire"],
    blurb:
      "Immortal, impulsive and deeply emotional, Theodore is a dangerously beautiful package of destruction, mostly turned inward but he does have a history.",
    story: [
      "Immortal, impulsive and deeply emotional, Theodore carries centuries of grief under a sharp tongue and a carefully maintained image.",
      "If you seek him you are likely to find him in the park or library with his adopted son, the art store or a quiet trail with his partner, or at the club dancing his pain away alone.",
      "His story is the kind that keeps unfolding backward and forward at the same time, because every version of him is shaped by what he has survived."
    ],
    details: [
      {
        title: "Background",
        content: [
          "Born in a different age and forced to outlive almost everyone he has ever loved, Theodore's immortality is less a gift than an endless accumulation of unfinished mourning.",
          "He learned to weaponize beauty, wit, and cruelty long before he learned how to ask for tenderness without expecting it to disappear."
        ]
      },
      {
        title: "Present Day",
        list: [
          "Trying to build a quieter life without ever fully trusting peace",
          "Protective to a fault when it comes to the people he claims as family",
          "Uses movement, nightlife, and art as ways to outrun memory"
        ]
      },
      {
        title: "Writing Notes",
        content: [
          "Theodore works well as a character whose outward confidence constantly clashes with the exhaustion of being ancient and emotionally raw.",
          "This section format is here so you can keep adding lore without forcing everything into one giant story paragraph."
        ]
      }
    ],
    connections: [
      { target: "orion", label: "Parallel in grief" },
      { target: "mara", label: "Would either adore or fight" }
    ]
  },
  {
    id: "orion",
    name: "Captain Orion Vale",
    role: "Ghost Captain",
    storyline: "Starbound Crew",
    image: "images/Commissions/Commission landscape.png",
    tags: ["leader", "undead", "space"],
    blurb: "A polite ghost bound to his ship; commands with patience and dry humor.",
    story:
      "Orion died mid-voyage and returned tethered to the vessel's AI. He negotiates treaties between the living crew and the ship's will.",
    connections: [
      { target: "theodore", label: "Recognizes the loneliness" },
      { target: "indra", label: "Owes a life" }
    ]
  },
  {
    id: "mara",
    name: "Mara Lynx",
    role: "Smuggler-turned-Co-pilot",
    storyline: "Starbound Crew",
    image: "images/Commissions/Mouse commission color.jpg",
    tags: ["crew", "rogue", "pilot"],
    blurb: "A former smuggler with a talent for impossible docking maneuvers and good tea.",
    story:
      "Mara once stole a moon-core. Now she funnels her instincts into getting the crew out of ambushes and into quiet ports.",
    connections: [
      { target: "orion", label: "Respects his command" },
      { target: "pyre", label: "Rivalry" }
    ]
  },
  {
    id: "indra",
    name: "Indra Quell",
    role: "Archivist of Echoes",
    storyline: "Starbound Crew",
    image: "images/Commissions/Novy comm.jpg",
    tags: ["mystic", "memory", "support"],
    blurb: "Archives memories as crystalline echoes; hears what people forget to say.",
    story:
      "Indra binds echoes into glass beads that replay feelings rather than sounds. They keep the crew's found-family history intact.",
    connections: [
      { target: "orion", label: "Keeps anchor" },
      { target: "mara", label: "Confidant" }
    ]
  },
  {
    id: "pyre",
    name: "Pyre Calder",
    role: "Runaway Embermage",
    storyline: "Starbound Crew",
    image: "images/Commissions/Mouse commission lineart 2.jpg",
    tags: ["magic", "fire", "combat"],
    blurb: "Plasma-slinger with a temper; rebuilding trust after burning bridges.",
    story:
      "Pyre fled an oppressive order. Their flames now power emergency jumps, but they fear becoming a weapon again.",
    connections: [
      { target: "mara", label: "Sparring partner" },
      { target: "indra", label: "Therapy sessions" }
    ]
  }
];

const state = {
  search: "",
  activeTags: new Set(),
  storyline: "all"
};

const grid = document.querySelector("#ocs-grid");
const searchInput = document.querySelector("#ocs-search");
const pillsContainer = document.querySelector("#ocs-tag-pills");
const storylineSelect = document.querySelector("#ocs-storyline");
const clearBtn = document.querySelector("#ocs-clear");
const modal = document.querySelector("#oc-modal");
const modalClose = document.querySelector("#oc-modal-close");
const modalName = document.querySelector("#oc-modal-name");
const modalRole = document.querySelector("#oc-modal-role");
const modalTags = document.querySelector("#oc-modal-tags");
const modalBlurb = document.querySelector("#oc-modal-blurb");
const modalSections = document.querySelector("#oc-modal-sections");
const modalConnections = document.querySelector("#oc-modal-connections");
const modalAvatar = document.querySelector("#oc-modal-avatar");

const getAllTags = () => {
  const tags = new Set();
  ocData.forEach((oc) => oc.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
};

const getAllStorylines = () => {
  const storylines = new Set();
  ocData.forEach((oc) => storylines.add(oc.storyline || "Other"));
  return Array.from(storylines).sort((a, b) => a.localeCompare(b));
};

const normalizeParagraphs = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return [String(value)];
};

const buildTagPills = () => {
  if (!pillsContainer) {
    return;
  }

  pillsContainer.innerHTML = "";
  getAllTags().forEach((tag) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "tag-pill";
    pill.textContent = tag;
    pill.dataset.tag = tag;
    pill.addEventListener("click", () => {
      if (state.activeTags.has(tag)) {
        state.activeTags.delete(tag);
      } else {
        state.activeTags.add(tag);
      }
      render();
    });
    pillsContainer.appendChild(pill);
  });
};

const buildStorylineOptions = () => {
  if (!storylineSelect) {
    return;
  }

  const currentValue = storylineSelect.value || "all";
  storylineSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All storylines";
  storylineSelect.appendChild(allOption);

  getAllStorylines().forEach((storyline) => {
    const option = document.createElement("option");
    option.value = storyline;
    option.textContent = storyline;
    storylineSelect.appendChild(option);
  });

  storylineSelect.value = currentValue;
};

const matchSearch = (oc) => {
  if (!state.search) {
    return true;
  }

  const detailsText = (oc.details || [])
    .flatMap((section) => [section.title, ...(section.content || []), ...(section.list || [])])
    .join(" ");
  const haystack = [oc.name, oc.role, oc.blurb, oc.storyline, detailsText, ...normalizeParagraphs(oc.story), ...oc.tags]
    .join(" ")
    .toLowerCase();

  return haystack.includes(state.search.toLowerCase());
};

const matchTags = (oc) => {
  if (!state.activeTags.size) {
    return true;
  }
  return Array.from(state.activeTags).every((tag) => oc.tags.includes(tag));
};

const matchStoryline = (oc) => {
  return state.storyline === "all" || (oc.storyline || "Other") === state.storyline;
};

const filteredData = () => {
  return ocData.filter((oc) => matchSearch(oc) && matchTags(oc) && matchStoryline(oc));
};

const initialsFromName = (name) => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

const applyAvatarImage = (element, oc) => {
  if (!element) {
    return;
  }

  if (oc.image) {
    element.style.backgroundImage = `url("${oc.image}")`;
    element.classList.add("has-image");
  } else {
    element.style.backgroundImage = "";
    element.classList.remove("has-image");
  }

  element.setAttribute("data-initials", initialsFromName(oc.name));
};

const renderCards = () => {
  if (!grid) {
    return;
  }

  const data = filteredData();
  grid.innerHTML = "";

  if (!data.length) {
    const empty = document.createElement("p");
    empty.textContent = "No characters match these filters.";
    grid.appendChild(empty);
    return;
  }

  data.forEach((oc) => {
    const card = document.createElement("article");
    card.className = "oc-card reveal visible";
    card.dataset.id = oc.id;
    card.id = `oc-${oc.id}`;

    const header = document.createElement("div");
    header.className = "oc-card-header";

    const avatar = document.createElement("div");
    avatar.className = "oc-avatar";
    applyAvatarImage(avatar, oc);
    header.appendChild(avatar);

    const meta = document.createElement("div");
    const role = document.createElement("p");
    role.className = "oc-role";
    role.textContent = `${oc.role} / ${oc.storyline}`;
    const name = document.createElement("h3");
    name.className = "oc-name";
    name.textContent = oc.name;
    meta.appendChild(role);
    meta.appendChild(name);
    header.appendChild(meta);

    const tagRow = document.createElement("div");
    tagRow.className = "oc-tags";
    oc.tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "oc-tag";
      tagElement.textContent = tag;
      tagRow.appendChild(tagElement);
    });

    const blurb = document.createElement("p");
    blurb.className = "oc-blurb";
    blurb.textContent = oc.blurb;

    const actions = document.createElement("div");
    actions.className = "oc-actions";
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "oc-open-btn";
    openBtn.textContent = "Open profile";
    openBtn.addEventListener("click", () => openModal(oc.id));
    actions.appendChild(openBtn);

    card.appendChild(header);
    card.appendChild(tagRow);
    card.appendChild(blurb);
    card.appendChild(actions);
    grid.appendChild(card);
  });
};

const updatePillStates = () => {
  if (!pillsContainer) {
    return;
  }

  pillsContainer.querySelectorAll(".tag-pill").forEach((pill) => {
    pill.classList.toggle("active", state.activeTags.has(pill.dataset.tag));
  });
};

const updateStorylineSelect = () => {
  if (!storylineSelect) {
    return;
  }
  storylineSelect.value = state.storyline;
};

const createParagraphBlock = (paragraphs) => {
  const wrapper = document.createElement("div");
  normalizeParagraphs(paragraphs).forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    wrapper.appendChild(p);
  });
  return wrapper;
};

const createSectionElement = (section, startOpen) => {
  const details = document.createElement("details");
  details.className = "oc-modal-section";
  details.open = startOpen;

  const summary = document.createElement("summary");
  summary.textContent = section.title;
  details.appendChild(summary);

  const body = document.createElement("div");
  body.className = "oc-modal-section-body";

  if (section.content) {
    body.appendChild(createParagraphBlock(section.content));
  }

  if (section.list && section.list.length) {
    const list = document.createElement("ul");
    list.className = "oc-modal-list";
    section.list.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    body.appendChild(list);
  }

  details.appendChild(body);
  return details;
};

const renderModalSections = (oc) => {
  if (!modalSections) {
    return;
  }

  modalSections.innerHTML = "";

  const storyBlock = document.createElement("details");
  storyBlock.className = "oc-modal-section";
  storyBlock.open = true;

  const storySummary = document.createElement("summary");
  storySummary.textContent = "Story";
  storyBlock.appendChild(storySummary);

  const storyBody = document.createElement("div");
  storyBody.className = "oc-modal-section-body oc-modal-story";
  storyBody.appendChild(createParagraphBlock(oc.story));
  storyBlock.appendChild(storyBody);
  modalSections.appendChild(storyBlock);

  (oc.details || []).forEach((section, index) => {
    modalSections.appendChild(createSectionElement(section, index === 0));
  });
};

const renderConnections = (oc) => {
  if (!modalConnections) {
    return;
  }

  modalConnections.innerHTML = "";

  if (!oc.connections || !oc.connections.length) {
    return;
  }

  const title = document.createElement("h4");
  title.textContent = "Connections";
  modalConnections.appendChild(title);

  oc.connections.forEach((conn) => {
    const row = document.createElement("div");
    row.className = "oc-connection";

    const target = ocData.find((item) => item.id === conn.target);
    const link = document.createElement("a");
    link.href = `#oc-${conn.target}`;
    link.textContent = target ? target.name : conn.target;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();

      const card = document.querySelector(`[data-id="${conn.target}"]`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("oc-highlight");
        window.setTimeout(() => card.classList.remove("oc-highlight"), 1200);
      }
    });

    const label = document.createElement("span");
    label.textContent = `- ${conn.label}`;

    row.appendChild(link);
    row.appendChild(label);
    modalConnections.appendChild(row);
  });
};

const closeModal = () => {
  if (!modal) {
    return;
  }
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
};

const openModal = (id) => {
  const oc = ocData.find((item) => item.id === id);
  if (!oc || !modal) {
    return;
  }

  modalName.textContent = oc.name;
  modalRole.textContent = `${oc.role} / ${oc.storyline}`;
  modalBlurb.textContent = oc.blurb;
  renderModalSections(oc);
  renderConnections(oc);
  applyAvatarImage(modalAvatar, oc);

  modalTags.innerHTML = "";
  oc.tags.forEach((tag) => {
    const pill = document.createElement("span");
    pill.className = "oc-tag";
    pill.textContent = tag;
    modalTags.appendChild(pill);
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
};

const clearFilters = () => {
  state.search = "";
  state.activeTags.clear();
  state.storyline = "all";
  if (searchInput) {
    searchInput.value = "";
  }
  render();
};

const bindControls = () => {
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      render();
    });
  }

  if (storylineSelect) {
    storylineSelect.addEventListener("change", (event) => {
      state.storyline = event.target.value;
      render();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearFilters);
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
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
};

const render = () => {
  renderCards();
  updatePillStates();
  updateStorylineSelect();
};

const init = () => {
  buildTagPills();
  buildStorylineOptions();
  bindControls();
  render();
};

init();
