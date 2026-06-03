const STORAGE_KEYS = {
  products: "aestas_products",
  cart: "aestas_cart",
  aiChat: "aestas_ai_chat",
  supportChat: "aestas_support_chat",
};

const DEFAULT_PRODUCTS = [
  {
    id: "p-velvet-elixir",
    name: "Velvet Elixir",
    description: "Amber, Safran und ein ruhiger Vanille-Akkord für Abendstunden.",
    price: 149.0,
    image: "assets/images/lux-collection-1.jpg",
  },
  {
    id: "p-erba-luce",
    name: "Erba Luce",
    description: "Frische Zitrusnoten mit weicher Moschus-Basis.",
    price: 128.0,
    image: "assets/images/lux-collection-2.jpg",
  },
  {
    id: "p-notte-nero",
    name: "Notte Nero",
    description: "Tiefes Holzprofil mit Oud und dunklen Gewürzen.",
    price: 169.0,
    image: "assets/images/img-16.jpg",
  },
  {
    id: "p-cashmere-air",
    name: "Cashmere Air",
    description: "Leichter Tagesduft mit Iris, Tee und cleanen Noten.",
    price: 112.0,
    image: "assets/images/img-15.jpg",
  },
];

const productGrid = document.getElementById("product-grid");
const productForm = document.getElementById("product-form");
const productNameInput = document.getElementById("product-name");
const productPriceInput = document.getElementById("product-price");
const productImageInput = document.getElementById("product-image");
const productDescriptionInput = document.getElementById("product-description");

const cartDrawer = document.getElementById("cart-drawer");
const openCartBtn = document.getElementById("open-cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const cartBadge = document.getElementById("cart-badge");
const clearCartBtn = document.getElementById("clear-cart-btn");

const addressForm = document.getElementById("address-form");
const addressInput = document.getElementById("address-input");
const addressFeedback = document.getElementById("address-feedback");
const mapFrame = document.getElementById("map-frame");

const aiChatMessages = document.getElementById("ai-chat-messages");
const aiChatForm = document.getElementById("ai-chat-form");
const aiChatInput = document.getElementById("ai-chat-input");

const supportChatMessages = document.getElementById("support-chat-messages");
const supportChatForm = document.getElementById("support-chat-form");
const supportRole = document.getElementById("support-role");
const supportChatInput = document.getElementById("support-chat-input");
const clearSupportChatBtn = document.getElementById("clear-support-chat-btn");

let products = loadFromStorage(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
let cart = loadFromStorage(STORAGE_KEYS.cart, []);
let aiMessages = loadFromStorage(STORAGE_KEYS.aiChat, [
  {
    role: "assistant",
    text: "Willkommen bei AESTAS. Ich helfe dir mit Duftempfehlungen, Preisen und Versand.",
  },
]);
let supportMessages = loadFromStorage(STORAGE_KEYS.supportChat, []);

function loadFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatEUR(value) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

function normalizeImageUrl(rawValue) {
  const value = rawValue.trim();
  if (!value) return "assets/images/lux-collection-1.jpg";
  if (value.startsWith("assets/")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return "assets/images/lux-collection-1.jpg";
  }
  return "assets/images/lux-collection-1.jpg";
}

function setCartDrawer(open) {
  if (!cartDrawer || !drawerBackdrop || !openCartBtn) return;
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", open ? "false" : "true");
  openCartBtn.setAttribute("aria-expanded", open ? "true" : "false");
  drawerBackdrop.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}

function findProduct(productId) {
  return products.find((product) => product.id === productId);
}

function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.loading = "lazy";
    image.src = product.image;
    image.alt = product.name;

    const body = document.createElement("div");
    body.className = "product-body";

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.name;

    const description = document.createElement("p");
    description.className = "product-desc";
    description.textContent = product.description;

    const row = document.createElement("div");
    row.className = "product-row";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatEUR(product.price);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "add-btn";
    addButton.textContent = "Add to Cart";
    addButton.dataset.productId = product.id;

    row.appendChild(price);
    row.appendChild(addButton);

    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(row);
    card.appendChild(image);
    card.appendChild(body);

    productGrid.appendChild(card);
  });
}

function renderCart() {
  if (!cartList || !cartTotal || !cartBadge) return;
  cartList.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("li");
    empty.className = "cart-empty";
    empty.textContent = "Noch keine Produkte im Warenkorb.";
    cartList.appendChild(empty);
    cartTotal.textContent = formatEUR(0);
    cartBadge.textContent = "0";
    return;
  }

  let total = 0;
  let totalItems = 0;

  cart.forEach((entry) => {
    const product = findProduct(entry.productId);
    if (!product) return;

    total += product.price * entry.qty;
    totalItems += entry.qty;

    const line = document.createElement("li");
    line.className = "cart-item";

    const rowTop = document.createElement("div");
    rowTop.className = "cart-line";

    const name = document.createElement("strong");
    name.textContent = product.name;

    const linePrice = document.createElement("span");
    linePrice.textContent = formatEUR(product.price * entry.qty);

    rowTop.appendChild(name);
    rowTop.appendChild(linePrice);

    const rowBottom = document.createElement("div");
    rowBottom.className = "cart-line";

    const qty = document.createElement("span");
    qty.textContent = `Menge: ${entry.qty}`;

    const actions = document.createElement("div");
    actions.className = "cart-actions";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "small-btn";
    minus.textContent = "-";
    minus.dataset.action = "decrement";
    minus.dataset.productId = product.id;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "small-btn";
    plus.textContent = "+";
    plus.dataset.action = "increment";
    plus.dataset.productId = product.id;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small-btn remove";
    remove.textContent = "x";
    remove.dataset.action = "remove";
    remove.dataset.productId = product.id;

    actions.appendChild(minus);
    actions.appendChild(plus);
    actions.appendChild(remove);

    rowBottom.appendChild(qty);
    rowBottom.appendChild(actions);
    line.appendChild(rowTop);
    line.appendChild(rowBottom);
    cartList.appendChild(line);
  });

  cartTotal.textContent = formatEUR(total);
  cartBadge.textContent = String(totalItems);
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ productId, qty: 1 });
  }
  saveToStorage(STORAGE_KEYS.cart, cart);
  renderCart();
}

function updateCartQuantity(productId, delta) {
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((entry) => entry.productId !== productId);
  }
  saveToStorage(STORAGE_KEYS.cart, cart);
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((entry) => entry.productId !== productId);
  saveToStorage(STORAGE_KEYS.cart, cart);
  renderCart();
}

function renderAiMessages() {
  if (!aiChatMessages) return;
  aiChatMessages.innerHTML = "";
  aiMessages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${message.role}`;
    bubble.textContent = message.text;
    aiChatMessages.appendChild(bubble);
  });
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

function getAIBotReply(userText) {
  const text = userText.toLowerCase();
  const hasProducts = products.length > 0;

  if (text.includes("versand") || text.includes("lieferung")) {
    return "Standardversand dauert 2-4 Werktage. Expressversand kann als Checkout-Option aktiviert werden.";
  }
  if (text.includes("preis") || text.includes("kosten")) {
    if (!hasProducts) return "Aktuell sind noch keine Produkte hinterlegt.";
    const prices = products.map((product) => product.price);
    return `Der aktuelle Preisrahmen liegt bei ${formatEUR(Math.min(...prices))} bis ${formatEUR(Math.max(...prices))}.`;
  }
  if (text.includes("empfehl") || text.includes("duft")) {
    if (!hasProducts) return "Sobald Produkte angelegt sind, kann ich dir konkrete Empfehlungen geben.";
    const suggestion = products[Math.floor(Math.random() * products.length)];
    return `Empfehlung: ${suggestion.name} für ${formatEUR(suggestion.price)}. ${suggestion.description}`;
  }
  if (text.includes("warenkorb")) {
    const items = cart.reduce((sum, entry) => sum + entry.qty, 0);
    const total = cart.reduce((sum, entry) => {
      const product = findProduct(entry.productId);
      return product ? sum + product.price * entry.qty : sum;
    }, 0);
    return `Im Warenkorb sind ${items} Artikel mit Gesamtwert ${formatEUR(total)}.`;
  }
  if (text.includes("adresse") || text.includes("maps") || text.includes("karte")) {
    return "Nutze das Feld im Bereich Boutique Finder, die Karte zentriert sich direkt auf die eingegebene Adresse.";
  }
  return "Ich helfe zu Duftprofilen, Preisen, Versand, Adresse und Warenkorb.";
}

function renderSupportMessages() {
  if (!supportChatMessages) return;
  supportChatMessages.innerHTML = "";
  if (supportMessages.length === 0) {
    const info = document.createElement("div");
    info.className = "bubble support";
    info.textContent = "Noch keine Support-Nachrichten.";
    supportChatMessages.appendChild(info);
    return;
  }

  supportMessages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${message.role}`;
    bubble.textContent = `${message.role === "support" ? "Support" : "Kunde"}: ${message.text}`;
    supportChatMessages.appendChild(bubble);
  });
  supportChatMessages.scrollTop = supportChatMessages.scrollHeight;
}

productForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = productNameInput.value.trim();
  const description = productDescriptionInput.value.trim();
  const price = Number(productPriceInput.value);
  const image = normalizeImageUrl(productImageInput.value);

  if (!name || !description || Number.isNaN(price) || price < 0) return;

  const product = {
    id: `p-${Date.now()}`,
    name,
    description,
    price,
    image,
  };

  products = [product, ...products];
  saveToStorage(STORAGE_KEYS.products, products);
  renderProducts();
  productForm.reset();
});

productGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-product-id]");
  if (!button) return;
  addToCart(button.dataset.productId);
});

cartList?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, productId } = button.dataset;
  if (action === "increment") updateCartQuantity(productId, 1);
  if (action === "decrement") updateCartQuantity(productId, -1);
  if (action === "remove") removeFromCart(productId);
});

clearCartBtn?.addEventListener("click", () => {
  cart = [];
  saveToStorage(STORAGE_KEYS.cart, cart);
  renderCart();
});

openCartBtn?.addEventListener("click", () => {
  setCartDrawer(true);
});

closeCartBtn?.addEventListener("click", () => {
  setCartDrawer(false);
});

drawerBackdrop?.addEventListener("click", () => {
  setCartDrawer(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setCartDrawer(false);
});

addressForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = addressInput.value.trim();
  if (!query) return;
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  addressFeedback.textContent = `Aktuelle Karte: ${query}`;
});

aiChatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = aiChatInput.value.trim();
  if (!message) return;

  aiMessages.push({ role: "user", text: message });
  aiMessages.push({ role: "assistant", text: getAIBotReply(message) });
  saveToStorage(STORAGE_KEYS.aiChat, aiMessages);
  renderAiMessages();
  aiChatForm.reset();
});

supportChatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = supportChatInput.value.trim();
  if (!text) return;
  const role = supportRole.value === "support" ? "support" : "kunde";
  supportMessages.push({ role, text });
  saveToStorage(STORAGE_KEYS.supportChat, supportMessages);
  renderSupportMessages();
  supportChatForm.reset();
});

clearSupportChatBtn?.addEventListener("click", () => {
  supportMessages = [];
  saveToStorage(STORAGE_KEYS.supportChat, supportMessages);
  renderSupportMessages();
});

renderProducts();
renderCart();
renderAiMessages();
renderSupportMessages();
setCartDrawer(false);
