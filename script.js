const productGrid = document.getElementById("productGrid");
const bagCount = document.getElementById("bagCount");
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const searchFocusBtn = document.getElementById("searchFocusBtn");
const shopSearchInput = document.getElementById("shopSearchInput");

const cartToggleBtn = document.getElementById("cartToggleBtn");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const openCartFromSection = document.getElementById("openCartFromSection");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartTotalEl = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

const productModal = document.getElementById("productModal");
const productModalBackdrop = document.getElementById("productModalBackdrop");
const productModalClose = document.getElementById("productModalClose");
const productModalCartBtn = document.getElementById("productModalCartBtn");
const productModalTitle = document.getElementById("productModalTitle");
const productModalDescription = document.getElementById("productModalDescription");
const productModalImage = document.getElementById("productModalImage");
const productModalSize = document.getElementById("productModalSize");
const productModalConcentration = document.getElementById("productModalConcentration");
const productModalGender = document.getElementById("productModalGender");
const productModalNotes = document.getElementById("productModalNotes");
const productModalIngredients = document.getElementById("productModalIngredients");

const addProductForm = document.getElementById("addProductForm");
const productFormStatus = document.getElementById("productFormStatus");

const mapSearchForm = document.getElementById("mapSearchForm");
const mapAddressInput = document.getElementById("mapAddressInput");
const mapFrame = document.getElementById("mapFrame");

const aiChatForm = document.getElementById("aiChatForm");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");

const supportChatForm = document.getElementById("supportChatForm");
const supportInput = document.getElementById("supportInput");
const supportMessages = document.getElementById("supportMessages");

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const CART_STORAGE_KEY = "aestas_cart";
const PRODUCTS_STORAGE_KEY = "aestas_custom_products";

let cart = loadFromStorage(CART_STORAGE_KEY, []);
let activeFilter = "all";
let activeSearch = "";
let selectedProduct = null;
let lastFocusedElement = null;

// Eigenleistung: Die Antworten sind bewusst lokal, damit keine Chatdaten an einen Server gesendet werden.
const supportReplies = {
  versand: "Support: Versand innerhalb Deutschlands dauert in der Regel 1-3 Werktage.",
  rueckgabe: "Support: Rückgaben sind innerhalb von 14 Tagen möglich.",
  rueckerstattung: "Support: Rückerstattungen werden nach Eingang innerhalb von 3 Werktagen verarbeitet.",
  bestellung: "Support: Sende uns bitte deine Bestellnummer, dann prüfen wir den Status sofort.",
  standard: "Support: Danke für die Nachricht. Ein Teammitglied meldet sich zeitnah mit Details.",
};

function syncIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function loadFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatEur(value) {
  return currencyFormatter.format(value);
}

function parsePrice(text) {
  const normalized = text.replace(",", ".").replace(/[^0-9.]/g, "");
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return numeric;
}

function setDrawerOpen(open) {
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", open ? "false" : "true");
  drawerBackdrop.classList.toggle("open", open);
  drawerBackdrop.hidden = !open;
  document.body.classList.toggle("no-scroll", open);
}

function setProductModalOpen(open) {
  productModal.classList.toggle("open", open);
  productModal.setAttribute("aria-hidden", open ? "false" : "true");
  productModalBackdrop.classList.toggle("open", open);
  productModalBackdrop.hidden = !open;
  document.body.classList.toggle("no-scroll", open);

  if (open) {
    productModalClose.focus();
  } else if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function getCardData(card) {
  const nameFromDataset = card.dataset.name;
  const priceFromDataset = Number(card.dataset.price);

  const name = nameFromDataset || card.querySelector("h3")?.textContent?.trim() || "Produkt";

  if (Number.isFinite(priceFromDataset)) {
    return { name, price: priceFromDataset };
  }

  const fallbackPriceText = card.querySelector(".product-meta span")?.textContent || "0";
  return { name, price: parsePrice(fallbackPriceText) };
}

function getProductDetails(card) {
  const image = card.querySelector("img");
  const description = card.querySelector(".product-info p")?.textContent?.trim() || "";
  const genderText = card.dataset.gender === "herren" ? "Herrenparfum, eckiger Flakon" : "Damenparfum, runder Flakon";

  return {
    ...getCardData(card),
    description,
    image: image?.getAttribute("src") || "",
    imageAlt: image?.getAttribute("alt") || "",
    size: card.dataset.size || "75 ml",
    concentration: card.dataset.concentration || "Eau de Parfum",
    genderText,
    notes: card.dataset.notes || description,
    ingredients: card.dataset.ingredients || "Alcohol Denat., Parfum, Aqua",
  };
}

function openProductDetails(card) {
  selectedProduct = getProductDetails(card);
  lastFocusedElement = document.activeElement;

  productModalTitle.textContent = selectedProduct.name;
  productModalDescription.textContent = selectedProduct.description;
  productModalImage.src = selectedProduct.image;
  productModalImage.alt = selectedProduct.imageAlt;
  productModalSize.textContent = selectedProduct.size;
  productModalConcentration.textContent = selectedProduct.concentration;
  productModalGender.textContent = selectedProduct.genderText;
  productModalNotes.textContent = selectedProduct.notes;
  productModalIngredients.textContent = selectedProduct.ingredients;
  productModalCartBtn.setAttribute("aria-label", `${selectedProduct.name} in den Warenkorb legen`);

  setProductModalOpen(true);
}

function renderCart() {
  cartItemsEl.innerHTML = "";

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  bagCount.textContent = String(totalCount);
  cartTotalEl.textContent = formatEur(totalPrice);
  cartEmptyEl.hidden = cart.length > 0;
  checkoutBtn.disabled = cart.length === 0;
  clearCartBtn.disabled = cart.length === 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.name = item.name;

    const top = document.createElement("div");
    top.className = "cart-item-top";

    const itemName = document.createElement("span");
    itemName.className = "cart-item-name";
    itemName.textContent = item.name;

    const itemPrice = document.createElement("span");
    itemPrice.className = "cart-item-price";
    itemPrice.textContent = formatEur(item.price);

    top.append(itemName, itemPrice);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const qtyControl = document.createElement("div");
    qtyControl.className = "qty-control";

    const minusBtn = document.createElement("button");
    minusBtn.className = "qty-btn";
    minusBtn.type = "button";
    minusBtn.dataset.action = "decrease";
    minusBtn.dataset.name = item.name;
    minusBtn.setAttribute("aria-label", "Menge reduzieren");
    minusBtn.innerHTML = '<i data-lucide="minus"></i>';

    const qtyValue = document.createElement("span");
    qtyValue.className = "qty-value";
    qtyValue.textContent = String(item.quantity);

    const plusBtn = document.createElement("button");
    plusBtn.className = "qty-btn";
    plusBtn.type = "button";
    plusBtn.dataset.action = "increase";
    plusBtn.dataset.name = item.name;
    plusBtn.setAttribute("aria-label", "Menge erhöhen");
    plusBtn.innerHTML = '<i data-lucide="plus"></i>';

    qtyControl.append(minusBtn, qtyValue, plusBtn);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.dataset.action = "remove";
    removeBtn.dataset.name = item.name;
    removeBtn.innerHTML = '<i data-lucide="trash-2"></i>Entfernen';

    controls.append(qtyControl, removeBtn);
    li.append(top, controls);
    cartItemsEl.appendChild(li);
  });

  syncIcons();
  saveToStorage(CART_STORAGE_KEY, cart);
}

// Eigenleistung: Warenkorb-Einträge werden nach Produktnamen zusammengefasst und lokal gespeichert.
function addToCart(product) {
  const existingItem = cart.find((item) => item.name === product.name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  renderCart();
}

// Eigenleistung: Kategorie-Filter und Suche wirken gleichzeitig auf die Produktkarten.
function applyFilter() {
  const cards = Array.from(productGrid.querySelectorAll(".product-card"));
  cards.forEach((card) => {
    const matchesCategory =
      activeFilter === "all" || card.dataset.category === activeFilter || card.dataset.gender === activeFilter;
    const searchableText = `${card.dataset.name || ""} ${card.textContent || ""}`.toLowerCase();
    const matchesSearch = !activeSearch || searchableText.includes(activeSearch);
    const visible = matchesCategory && matchesSearch;
    card.hidden = !visible;
  });
}

function setProductFormStatus(message, type) {
  productFormStatus.textContent = message;
  productFormStatus.classList.remove("success", "error");
  if (type) {
    productFormStatus.classList.add(type);
  }
}

function createProductCard({ name, price, category, gender, image, description }) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.category = category;
  card.dataset.gender = gender;
  card.dataset.name = name;
  card.dataset.price = String(price);
  card.dataset.size = "75 ml";
  card.dataset.concentration = "Eau de Parfum";
  card.dataset.notes = description;
  card.dataset.ingredients = "Alcohol Denat., Parfum, Aqua";
  const imageEl = document.createElement("img");
  imageEl.src = image;
  imageEl.alt = `Parfum ${name}`;

  const info = document.createElement("div");
  info.className = "product-info";

  const badge = document.createElement("span");
  badge.className = `gender-badge ${gender === "herren" ? "gender-men" : "gender-women"}`;
  badge.textContent = gender === "herren" ? "Herren · eckiger Flakon" : "Damen · runder Flakon";

  const title = document.createElement("h3");
  title.textContent = name;

  const copy = document.createElement("p");
  copy.textContent = description;

  const meta = document.createElement("div");
  meta.className = "product-meta";

  const priceEl = document.createElement("span");
  priceEl.textContent = `${Math.round(price * 100) / 100} EUR`;

  const detailButton = document.createElement("button");
  detailButton.className = "detail-btn";
  detailButton.type = "button";
  detailButton.textContent = "Mehr Infos";

  const addButton = document.createElement("button");
  addButton.className = "add-btn";
  addButton.type = "button";
  addButton.setAttribute("aria-label", `${name} in den Warenkorb legen`);
  addButton.innerHTML = '<i data-lucide="plus"></i>In den Warenkorb';

  meta.append(priceEl, detailButton, addButton);
  info.append(badge, title, copy, meta);
  card.append(imageEl, info);
  return card;
}

function getCustomProducts() {
  return loadFromStorage(PRODUCTS_STORAGE_KEY, []);
}

function saveCustomProduct(product) {
  const products = getCustomProducts();
  products.push(product);
  saveToStorage(PRODUCTS_STORAGE_KEY, products);
}

function renderCustomProducts() {
  getCustomProducts().forEach((product) => {
    productGrid.appendChild(createProductCard(product));
  });
}

function appendChatMessage(container, text, role) {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  message.textContent = text;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

function getAiReply(userMessage) {
  const text = userMessage.toLowerCase();

  if (text.includes("oud")) {
    return "Für Oud-Liebhaber passen Aestas Ruber und Aestas Argentum besonders gut.";
  }
  if (text.includes("frisch") || text.includes("fresh")) {
    return "Für frische Düfte empfehle ich Aestas Alba, Aestas Luna oder Aestas Viridis.";
  }
  if (text.includes("rose") || text.includes("rosa") || text.includes("blume") || text.includes("floral")) {
    return "Wenn du florale Düfte magst, schau dir Aestas Rosa und Aestas Flora an.";
  }
  if (text.includes("haltbar") || text.includes("haltbarkeit")) {
    return "Sehr gute Haltbarkeit liefern vor allem Aestas Ruber, Aestas Aurum und Aestas Solis.";
  }
  if (text.includes("geschenk")) {
    return "Als Geschenk werden oft Aestas Luna und Aestas Solis gewählt.";
  }
  return "Sag mir gern, ob du eher frisch, warm oder intensiv magst. Dann gebe ich dir eine präzise Empfehlung.";
}

function getSupportReply(userMessage) {
  const text = userMessage.toLowerCase();
  if (text.includes("versand")) return supportReplies.versand;
  if (text.includes("rückgabe") || text.includes("retoure")) return supportReplies.rueckgabe;
  if (text.includes("rückerstattung")) return supportReplies.rueckerstattung;
  if (text.includes("bestellung") || text.includes("order")) return supportReplies.bestellung;
  return supportReplies.standard;
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-btn");
  const detailButton = event.target.closest(".detail-btn");
  const card = event.target.closest(".product-card");
  if (!card) {
    return;
  }

  if (addButton) {
    const product = getCardData(card);
    addToCart(product);
    return;
  }

  if (detailButton || !event.target.closest("button")) {
    openProductDetails(card);
    return;
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    applyFilter();
  });
});

searchFocusBtn.addEventListener("click", () => {
  document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
  shopSearchInput.focus({ preventScroll: true });
});

shopSearchInput.addEventListener("input", () => {
  activeSearch = shopSearchInput.value.trim().toLowerCase();
  applyFilter();
});

cartItemsEl.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;
  const name = actionButton.dataset.name;
  const item = cart.find((entry) => entry.name === name);
  if (!item) {
    return;
  }

  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart = cart.filter((entry) => entry.name !== name);
    }
  } else if (action === "remove") {
    cart = cart.filter((entry) => entry.name !== name);
  }

  renderCart();
});

clearCartBtn.addEventListener("click", () => {
  cart = [];
  renderCart();
});

checkoutBtn.addEventListener("click", () => {
  appendChatMessage(
    supportMessages,
    "Support: Checkout wurde als Demo ausgelöst. Für den Live-Betrieb können wir als nächstes Stripe anbinden.",
    "agent"
  );
  setDrawerOpen(false);
});

cartToggleBtn.addEventListener("click", () => setDrawerOpen(true));
openCartFromSection.addEventListener("click", () => setDrawerOpen(true));
cartCloseBtn.addEventListener("click", () => setDrawerOpen(false));
drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && productModal.classList.contains("open")) {
    setProductModalOpen(false);
    return;
  }
  if (event.key === "Escape") {
    setDrawerOpen(false);
  }
});

productModalClose.addEventListener("click", () => setProductModalOpen(false));
productModalBackdrop.addEventListener("click", () => setProductModalOpen(false));
productModalCartBtn.addEventListener("click", () => {
  if (!selectedProduct) {
    return;
  }
  addToCart({ name: selectedProduct.name, price: selectedProduct.price });
  setProductModalOpen(false);
  setDrawerOpen(true);
});

addProductForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setProductFormStatus("", null);

  const formData = new FormData(addProductForm);
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const price = Number(String(formData.get("price") || "").replace(",", "."));

  // Eingaben werden geprüft, bevor eine neue Produktkarte im DOM erstellt wird.
  if (!name || !description || !image || !category || !gender || !Number.isFinite(price) || price <= 0) {
    setProductFormStatus("Bitte alle Felder korrekt ausfüllen.", "error");
    return;
  }

  const card = createProductCard({
    name,
    price,
    category,
    gender,
    image,
    description,
  });

  productGrid.appendChild(card);
  saveCustomProduct({ name, price, category, gender, image, description });
  addProductForm.reset();
  setProductFormStatus(`Produkt "${name}" wurde hinzugefügt.`, "success");
  applyFilter();
  syncIcons();
});

mapSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = mapAddressInput.value.trim();
  if (!query) {
    return;
  }
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
});

aiChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = aiInput.value.trim();
  if (!message) {
    return;
  }

  appendChatMessage(aiMessages, message, "user");
  aiInput.value = "";

  window.setTimeout(() => {
    appendChatMessage(aiMessages, getAiReply(message), "bot");
  }, 350);
});

supportChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = supportInput.value.trim();
  if (!message) {
    return;
  }

  appendChatMessage(supportMessages, message, "user");
  supportInput.value = "";

  window.setTimeout(() => {
    appendChatMessage(supportMessages, getSupportReply(message), "agent");
  }, 420);
});

renderCustomProducts();
renderCart();
applyFilter();
syncIcons();
