// Contact page scripts

const orderForm = document.querySelector("#commission-order-form");
const orderMediumSelect = document.querySelector("#order-medium");
const orderSubtypeSelect = document.querySelector("#order-subtype");
const orderSizeSelect = document.querySelector("#order-size");
const orderEstimate = document.querySelector("#order-estimate");
const orderResult = document.querySelector("#order-result");
const orderPreview = document.querySelector("#order-preview");
const orderEmailLink = document.querySelector("#order-email-link");
const orderCopyButton = document.querySelector("#order-copy-button");
const orderCopyStatus = document.querySelector("#order-copy-status");

const COMMISSION_CATALOG = {
  Graphite: {
    Sketch: { bust: 3, halfbody: 5, fullbody: 10 },
    Shaded: { bust: 5, halfbody: 10, fullbody: 15 },
    "Classical Shading": { bust: 10, halfbody: 15, fullbody: 20 }
  },
  Lineart: {
    Base: { bust: 15, halfbody: 20, fullbody: 25 },
    Shaded: { bust: 18, halfbody: 23, fullbody: 28 },
    Colored: { bust: 20, halfbody: 28, fullbody: 35 }
  },
  Watercolor: {
    Sketch: { bust: 10, halfbody: 15, fullbody: 20 },
    Rendered: { bust: 15, halfbody: 20, fullbody: 30 }
  }
};

const ORDER_SIZE_LABELS = {
  bust: "Bust",
  halfbody: "Halfbody",
  fullbody: "Fullbody"
};

const normalizeLabel = (value) => String(value || "").trim().toLowerCase();

const findMatchingKey = (keys, value) => {
  const target = normalizeLabel(value);
  if (!target) {
    return "";
  }
  return keys.find((key) => normalizeLabel(key) === target) || "";
};

const formatDollarAmount = (value) => {
  if (!Number.isFinite(value)) {
    return "";
  }
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
};

const populateMediumOptions = () => {
  if (!orderMediumSelect) {
    return;
  }

  orderMediumSelect.innerHTML = "";
  Object.keys(COMMISSION_CATALOG).forEach((medium) => {
    const option = document.createElement("option");
    option.value = medium;
    option.textContent = medium;
    orderMediumSelect.appendChild(option);
  });
};

const populateSubtypeOptions = () => {
  if (!orderMediumSelect || !orderSubtypeSelect) {
    return;
  }

  const medium = orderMediumSelect.value;
  const subtypeKeys = Object.keys(COMMISSION_CATALOG[medium] || {});
  const previousSubtype = orderSubtypeSelect.value;

  orderSubtypeSelect.innerHTML = "";
  subtypeKeys.forEach((subtype) => {
    const option = document.createElement("option");
    option.value = subtype;
    option.textContent = subtype;
    orderSubtypeSelect.appendChild(option);
  });

  if (findMatchingKey(subtypeKeys, previousSubtype)) {
    orderSubtypeSelect.value = previousSubtype;
  }
};

const getBasePrice = () => {
  if (!orderMediumSelect || !orderSubtypeSelect || !orderSizeSelect) {
    return NaN;
  }

  const medium = orderMediumSelect.value;
  const subtype = orderSubtypeSelect.value;
  const size = orderSizeSelect.value;

  const sizePrices = COMMISSION_CATALOG[medium]?.[subtype];
  if (!sizePrices || !Number.isFinite(sizePrices[size])) {
    return NaN;
  }

  return sizePrices[size];
};

const calculateOrderEstimate = () => {
  if (!orderForm) {
    return null;
  }

  const baseAmount = getBasePrice();
  if (!Number.isFinite(baseAmount)) {
    return { available: false, text: "Estimate unavailable for this selection." };
  }

  const selectedAddons = Array.from(orderForm.querySelectorAll("input[name='addons']:checked"));
  const flatAddons = selectedAddons.reduce(
    (sum, addon) => sum + (Number.parseFloat(addon.getAttribute("data-flat")) || 0),
    0
  );
  const percentAddons = selectedAddons.reduce(
    (sum, addon) => sum + (Number.parseFloat(addon.getAttribute("data-percent")) || 0),
    0
  );

  const estimate = (baseAmount + flatAddons) * (1 + percentAddons);
  const text = `Base ${formatDollarAmount(baseAmount)}${
    flatAddons ? ` + ${formatDollarAmount(flatAddons)}` : ""
  }${percentAddons ? ` then +${Math.round(percentAddons * 100)}%` : ""} => Est. ${formatDollarAmount(estimate)}`;

  return {
    available: true,
    text
  };
};

const updateEstimateDisplay = () => {
  if (!orderEstimate) {
    return;
  }
  const estimate = calculateOrderEstimate();
  orderEstimate.textContent = estimate ? estimate.text : "";
};

const formatDeadline = (value) => {
  if (!value) {
    return "Flexible";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

const setCopyStatus = (value) => {
  if (!orderCopyStatus) {
    return;
  }
  orderCopyStatus.textContent = value;
};

const copyPreviewText = async () => {
  if (!orderPreview || !orderPreview.value.trim()) {
    setCopyStatus("Generate a request before copying.");
    return;
  }

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(orderPreview.value);
    } else {
      orderPreview.focus();
      orderPreview.select();
      document.execCommand("copy");
      orderPreview.setSelectionRange(0, 0);
    }
    setCopyStatus("Request copied to clipboard.");
  } catch (_) {
    setCopyStatus("Could not copy automatically. Select the text and copy it manually.");
  }
};

const applyQueryPrefill = () => {
  if (!orderMediumSelect || !orderSubtypeSelect) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const mediumParam = params.get("medium");
  const styleParam = params.get("style") || params.get("subtype");

  const mediumKeys = Object.keys(COMMISSION_CATALOG);
  const matchingMedium = findMatchingKey(mediumKeys, mediumParam);
  if (matchingMedium) {
    orderMediumSelect.value = matchingMedium;
  }

  populateSubtypeOptions();

  const subtypeKeys = Object.keys(COMMISSION_CATALOG[orderMediumSelect.value] || {});
  const matchingSubtype = findMatchingKey(subtypeKeys, styleParam);
  if (matchingSubtype) {
    orderSubtypeSelect.value = matchingSubtype;
  }
};

const handleOrderSubmit = (event) => {
  event.preventDefault();

  if (!orderForm || !orderPreview || !orderResult || !orderEmailLink || !orderSizeSelect) {
    return;
  }

  const formData = new FormData(orderForm);
  const estimate = calculateOrderEstimate();
  const selectedAddons = Array.from(orderForm.querySelectorAll("input[name='addons']:checked")).map((input) =>
    input.value.trim()
  );

  const clientName = String(formData.get("clientName") || "").trim();
  const contactHandle = String(formData.get("contactHandle") || "").trim();
  const medium = String(formData.get("medium") || "").trim();
  const subtype = String(formData.get("subtype") || "").trim();
  const size = String(formData.get("size") || "").trim();
  const sizeLabel = ORDER_SIZE_LABELS[size] || size;
  const references = String(formData.get("references") || "").trim() || "N/A";
  const notes = String(formData.get("notes") || "").trim() || "N/A";
  const deadline = formatDeadline(String(formData.get("deadline") || "").trim());
  const estimateLine = estimate && estimate.available ? estimate.text : "Estimate unavailable";

  const requestLines = [
    "Hello Moony! I want to order a commission.",
    `Name: ${clientName}`,
    `Preferred contact: ${contactHandle}`,
    `Medium: ${medium}`,
    `Style: ${subtype}`,
    `Framing: ${sizeLabel}`,
    `Add-ons: ${selectedAddons.length ? selectedAddons.join(", ") : "None"}`,
    `Reference links: ${references}`,
    `Preferred deadline: ${deadline}`,
    `Extra notes: ${notes}`,
    `Price estimate: ${estimateLine}`
  ];

  const requestText = requestLines.join("\n");
  const emailTarget = (orderForm.getAttribute("data-order-email") || "").trim();
  const emailSubject = `Commission Order - ${medium} ${subtype}`.trim();
  const mailtoBase = emailTarget ? `mailto:${emailTarget}` : "mailto:";

  orderPreview.value = requestText;
  orderEmailLink.href = `${mailtoBase}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
    requestText
  )}`;

  orderResult.hidden = false;
  setCopyStatus("");
};

const initializeOrderForm = () => {
  if (!orderForm || !orderMediumSelect || !orderSubtypeSelect || !orderSizeSelect || !orderEstimate) {
    return;
  }

  populateMediumOptions();
  applyQueryPrefill();
  updateEstimateDisplay();

  orderMediumSelect.addEventListener("change", () => {
    populateSubtypeOptions();
    updateEstimateDisplay();
  });

  orderSubtypeSelect.addEventListener("change", updateEstimateDisplay);
  orderSizeSelect.addEventListener("change", updateEstimateDisplay);

  Array.from(orderForm.querySelectorAll("input[name='addons']")).forEach((input) => {
    input.addEventListener("change", updateEstimateDisplay);
  });

  orderForm.addEventListener("submit", handleOrderSubmit);

  if (orderCopyButton) {
    orderCopyButton.addEventListener("click", copyPreviewText);
  }
};

initializeOrderForm();
