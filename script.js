const productGrid = document.getElementById("productGrid");
const bagCount = document.getElementById("bagCount");
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));

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

let cart = [];
let activeFilter = "all";

const supportReplies = {
  versand: "Support: Versand innerhalb Deutschlands dauert in der Regel 1-3 Werktage.",
  rueckgabe: "Support: Rueckgaben sind innerhalb von 14 Tagen moeglich.",
  rueckerstattung: "Support: Rueckerstattungen werden nach Eingang innerhalb von 3 Werktagen verarbeitet.",
  bestellung: "Support: Sende uns bitte deine Bestellnummer, dann pruefen wir den Status sofort.",
  standard: "Support: Danke fuer die Nachricht. Ein Teammitglied meldet sich zeitnah mit Details.",
};

function syncIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
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
    plusBtn.setAttribute("aria-label", "Menge erhoehen");
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
}

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

function applyFilter() {
  const cards = Array.from(productGrid.querySelectorAll(".product-card"));
  cards.forEach((card) => {
    const visible = activeFilter === "all" || card.dataset.category === activeFilter;
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

function createProductCard({ name, price, category, image, description }) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.category = category;
  card.dataset.name = name;
  card.dataset.price = String(price);

  const imageEl = document.createElement("img");
  imageEl.src = image;
  imageEl.alt = `Parfum ${name}`;

  const info = document.createElement("div");
  info.className = "product-info";

  const title = document.createElement("h3");
  title.textContent = name;

  const copy = document.createElement("p");
  copy.textContent = description;

  const meta = document.createElement("div");
  meta.className = "product-meta";

  const priceEl = document.createElement("span");
  priceEl.textContent = `${Math.round(price * 100) / 100} EUR`;

  const addButton = document.createElement("button");
  addButton.className = "add-btn";
  addButton.type = "button";
  addButton.innerHTML = '<i data-lucide="plus"></i>In den Warenkorb';

  meta.append(priceEl, addButton);
  info.append(title, copy, meta);
  card.append(imageEl, info);
  return card;
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
    return "Fuer Oud-Liebhaber passen Aestas Ruber und Aestas Argentum besonders gut.";
  }
  if (text.includes("frisch") || text.includes("fresh")) {
    return "Fuer frische Duefte empfehle ich Aestas Alba, Aestas Luna oder Aestas Viridis.";
  }
  if (text.includes("rose") || text.includes("rosa") || text.includes("blume") || text.includes("floral")) {
    return "Wenn du florale Duefte magst, schau dir Aestas Rosa und Aestas Flora an.";
  }
  if (text.includes("haltbar") || text.includes("haltbarkeit")) {
    return "Sehr gute Haltbarkeit liefern vor allem Aestas Ruber, Aestas Aurum und Aestas Solis.";
  }
  if (text.includes("geschenk")) {
    return "Als Geschenk werden oft Aestas Luna und Aestas Solis gewaehlt.";
  }
  return "Sag mir gern, ob du eher frisch, warm oder intensiv magst. Dann gebe ich dir eine praezise Empfehlung.";
}

function getSupportReply(userMessage) {
  const text = userMessage.toLowerCase();
  if (text.includes("versand")) return supportReplies.versand;
  if (text.includes("rueckgabe") || text.includes("retoure")) return supportReplies.rueckgabe;
  if (text.includes("rueckerstattung")) return supportReplies.rueckerstattung;
  if (text.includes("bestellung") || text.includes("order")) return supportReplies.bestellung;
  return supportReplies.standard;
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-btn");
  if (!addButton) {
    return;
  }

  const card = addButton.closest(".product-card");
  if (!card) {
    return;
  }

  const product = getCardData(card);
  addToCart(product);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    applyFilter();
  });
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
    "Support: Checkout wurde als Demo ausgeloest. Fuer den Live-Betrieb koennen wir als naechstes Stripe anbinden.",
    "agent"
  );
  setDrawerOpen(false);
});

cartToggleBtn.addEventListener("click", () => setDrawerOpen(true));
openCartFromSection.addEventListener("click", () => setDrawerOpen(true));
cartCloseBtn.addEventListener("click", () => setDrawerOpen(false));
drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setDrawerOpen(false);
  }
});

addProductForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setProductFormStatus("", null);

  const formData = new FormData(addProductForm);
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const price = Number(String(formData.get("price") || "").replace(",", "."));

  if (!name || !description || !image || !category || !Number.isFinite(price) || price <= 0) {
    setProductFormStatus("Bitte alle Felder korrekt ausfuellen.", "error");
    return;
  }

  const card = createProductCard({
    name,
    price,
    category,
    image,
    description,
  });

  productGrid.appendChild(card);
  addProductForm.reset();
  setProductFormStatus(`Produkt "${name}" wurde hinzugefuegt.`, "success");
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

renderCart();
applyFilter();
syncIcons();
