const productGrid = document.getElementById("productGrid");
const bagCount = document.getElementById("bagCount");
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const searchFocusBtn = document.getElementById("searchFocusBtn");
const shopSearchInput = document.getElementById("shopSearchInput");
const fontDecreaseBtn = document.getElementById("fontDecreaseBtn");
const fontIncreaseBtn = document.getElementById("fontIncreaseBtn");
const speakPageBtn = document.getElementById("speakPageBtn");

// Alle wichtigen DOM-Elemente werden einmal am Anfang gespeichert.
// Dadurch muessen sie spaeter nicht immer wieder neu gesucht werden.
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
const checkoutForm = document.getElementById("checkoutForm");
const deliveryAddressInput = document.getElementById("deliveryAddressInput");
const testDeliveryMapBtn = document.getElementById("testDeliveryMapBtn");
const checkoutStatus = document.getElementById("checkoutStatus");

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
const productModalStory = document.getElementById("productModalStory");
const productModalIngredients = document.getElementById("productModalIngredients");
const productModalSizeSelect = document.getElementById("productModalSizeSelect");
const productModalPricePreview = document.getElementById("productModalPricePreview");

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

// localStorage speichert Demo-Daten im Browser, auch nach einem Neuladen der Seite.
const CART_STORAGE_KEY = "aestas_cart";
const PRODUCTS_STORAGE_KEY = "aestas_custom_products";
const FONT_SCALE_KEY = "aestas_font_scale";

// Die Preisstaffel macht groessere Flakons im Verhaeltnis guenstiger.
const SIZE_OPTIONS = {
  3: { label: "3 ml Probe", multiplier: 0.09 },
  25: { label: "25 ml Reisegröße", multiplier: 0.34 },
  50: { label: "50 ml Standard", multiplier: 0.6 },
  100: { label: "100 ml Vorteilspreis", multiplier: 1 },
};

let cart = normalizeCart(loadFromStorage(CART_STORAGE_KEY, []));
let activeFilter = "all";
let activeSearch = "";
let selectedProduct = null;
let lastFocusedElement = null;
let fontScale = Number(localStorage.getItem(FONT_SCALE_KEY)) || 100;

// Eigenleistung: Die Antworten sind bewusst lokal, damit keine Chatdaten an einen Server gesendet werden.
const supportReplies = {
  versand: "Support: Versand innerhalb Deutschlands dauert in der Regel 1-3 Werktage.",
  rueckgabe: "Support: Rückgaben sind innerhalb von 14 Tagen möglich.",
  rueckerstattung: "Support: Rückerstattungen werden nach Eingang innerhalb von 3 Werktagen verarbeitet.",
  bestellung: "Support: Sende uns bitte deine Bestellnummer, dann prüfen wir den Status sofort.",
  standard: "Support: Danke für die Nachricht. Ein Teammitglied meldet sich zeitnah mit Details.",
};

const aiReplies = [
  {
    keywords: ["herren", "mann", "männer", "eckig", "eckigen"],
    text: "Für Herren empfehle ich die eckigen Flakons: Aestas Ruber, Aurum, Argentum, Viridis und Solis.",
  },
  {
    keywords: ["damen", "frau", "frauen", "rund", "runden"],
    text: "Für Damen passen die runden Flakons: Aestas Luna, Stella, Alba, Flora und Rosa.",
  },
  {
    keywords: ["oud", "intensiv", "stark"],
    text: "Wenn du einen intensiven Duft suchst, passen Aestas Ruber oder Aestas Argentum besonders gut.",
  },
  {
    keywords: ["frisch", "fresh", "leicht", "sommer"],
    text: "Für frische Düfte empfehle ich Aestas Alba, Aestas Luna oder Aestas Viridis.",
  },
  {
    keywords: ["rose", "rosa", "blume", "floral"],
    text: "Wenn du florale Düfte magst, schau dir Aestas Rosa und Aestas Flora an.",
  },
  {
    keywords: ["haltbar", "haltbarkeit", "lange"],
    text: "Sehr gute Haltbarkeit liefern vor allem Aestas Ruber, Aestas Aurum und Aestas Solis.",
  },
  {
    keywords: ["geschenk", "geburtstag"],
    text: "Als Geschenk sind Aestas Luna für Damen und Aestas Solis für Herren gute, elegante Optionen.",
  },
  {
    keywords: ["größe", "groesse", "ml", "inhalt"],
    text: "Klicke bei einem Parfum auf 'Mehr Infos'. Dort kannst du 3 ml, 25 ml, 50 ml oder 100 ml auswählen. Je größer der Flakon, desto günstiger wird der Preis pro ml.",
  },
  {
    keywords: ["warenkorb", "korb", "kaufen", "checkout", "adresse", "maps"],
    text: "Lege dein Parfum in den Warenkorb, gib eine Lieferadresse ein und teste sie mit der Maps-Schaltfläche. Der Checkout ist als Demo vorbereitet.",
  },
  {
    keywords: ["barrierefrei", "vorlesen", "schrift", "größer", "groesser"],
    text: "Oben im Header kannst du die Schrift kleiner oder größer stellen und den Seitentext vorlesen lassen. Fokusrahmen und Alt-Texte helfen zusätzlich.",
  },
];

function syncIcons() {
  // Lucide ersetzt die data-lucide-Platzhalter durch echte SVG-Icons.
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function loadFromStorage(key, fallbackValue) {
  // Fehlerhafte oder fehlende Speicherwerte werden abgefangen, damit die Seite stabil bleibt.
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
  // Arrays wie Warenkorb und eigene Produkte werden als JSON-Text gespeichert.
  localStorage.setItem(key, JSON.stringify(value));
}

function getSizeOption(sizeMl) {
  return SIZE_OPTIONS[sizeMl] || SIZE_OPTIONS[100];
}

function calculateSizePrice(basePrice, sizeMl) {
  const option = getSizeOption(sizeMl);
  return Math.round(basePrice * option.multiplier * 100) / 100;
}

function getCartKey(name, sizeMl) {
  return `${name}__${sizeMl}`;
}

function normalizeCart(rawCart) {
  const cleaned = [];
  rawCart.forEach((item) => {
    const name = String(item.name || "").trim();
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    const sizeMl = Number(item.sizeMl || 100);
    const sizeOption = getSizeOption(sizeMl);

    if (!name || !Number.isFinite(price) || price <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    const existingItem = cleaned.find((entry) => getCartKey(entry.name, entry.sizeMl) === getCartKey(name, sizeMl));
    if (existingItem) {
      existingItem.quantity += Math.round(quantity);
    } else {
      cleaned.push({
        name,
        price,
        sizeMl,
        sizeLabel: sizeOption.label,
        quantity: Math.round(quantity),
      });
    }
  });
  return cleaned;
}

function formatEur(value) {
  // Einheitliche deutsche Preisformatierung fuer Produktkarten und Warenkorb.
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
  // Der Warenkorb wird als seitlicher Drawer geoeffnet und blockiert dabei den Hintergrund.
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", open ? "false" : "true");
  drawerBackdrop.classList.toggle("open", open);
  drawerBackdrop.hidden = !open;
  document.body.classList.toggle("no-scroll", open);
}

function setProductModalOpen(open) {
  // Der Produktdialog ist als modal gekennzeichnet und setzt den Fokus auf den Schliessen-Button.
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

function applyFontScale() {
  // Barrierefreiheit: Die Schriftgroesse wird gespeichert und gilt nach dem Neuladen weiter.
  fontScale = Math.min(125, Math.max(90, fontScale));
  document.documentElement.style.fontSize = `${fontScale}%`;
  localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
}

function speakPageSummary() {
  // Die Vorlesefunktion nutzt die Browser-eigene Sprachausgabe und sendet keine Daten nach aussen.
  if (!("speechSynthesis" in window)) {
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speakPageBtn.classList.remove("speak-active");
    return;
  }

  const heroText = document.querySelector(".hero-content")?.innerText || "";
  const shopText = document.querySelector("#shop .section-head")?.innerText || "";
  const utterance = new SpeechSynthesisUtterance(
    `${heroText}. ${shopText}. Produktdetails enthalten Größe, Inhalt, Duftnoten und Hintergrundgeschichte.`
  );
  utterance.lang = "de-DE";
  utterance.onend = () => speakPageBtn.classList.remove("speak-active");
  speakPageBtn.classList.add("speak-active");
  window.speechSynthesis.speak(utterance);
}

function getCardData(card) {
  // Aus einer Produktkarte werden Name und Preis fuer den Warenkorb ausgelesen.
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
  // Detaildaten wie Groesse, Duftnoten und Inhaltsstoffe liegen als data-Attribute an der Karte.
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
    story: card.dataset.story || "Dieser Duft wurde als kurze Projektgeschichte passend zur Duftfamilie beschrieben.",
    ingredients: card.dataset.ingredients || "Alcohol Denat., Parfum, Aqua",
  };
}

function updateModalPricePreview() {
  if (!selectedProduct) {
    return;
  }

  const sizeMl = Number(productModalSizeSelect.value || 100);
  const sizeOption = getSizeOption(sizeMl);
  const selectedPrice = calculateSizePrice(selectedProduct.price, sizeMl);
  const pricePerMl = selectedPrice / sizeMl;
  productModalPricePreview.textContent = `Auswahl: ${sizeOption.label} · ${formatEur(selectedPrice)} · ${formatEur(pricePerMl)} pro ml`;
}

function openProductDetails(card) {
  // Der Dialog wird dynamisch mit den Daten des angeklickten Parfums gefuellt.
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
  productModalStory.textContent = selectedProduct.story;
  productModalIngredients.textContent = selectedProduct.ingredients;
  productModalSizeSelect.value = "100";
  updateModalPricePreview();
  productModalCartBtn.setAttribute("aria-label", `${selectedProduct.name} in den Warenkorb legen`);

  setProductModalOpen(true);
}

function renderCart() {
  // Der Warenkorb wird komplett neu gerendert, sobald sich Menge oder Inhalt aendern.
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
    li.dataset.key = getCartKey(item.name, item.sizeMl);

    const top = document.createElement("div");
    top.className = "cart-item-top";

    const itemName = document.createElement("span");
    itemName.className = "cart-item-name";
    itemName.textContent = `${item.name} · ${item.sizeLabel || "100 ml Vorteilspreis"}`;

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
    minusBtn.dataset.key = getCartKey(item.name, item.sizeMl);
    minusBtn.setAttribute("aria-label", "Menge reduzieren");
    minusBtn.innerHTML = '<i data-lucide="minus"></i>';

    const qtyValue = document.createElement("span");
    qtyValue.className = "qty-value";
    qtyValue.textContent = String(item.quantity);

    const plusBtn = document.createElement("button");
    plusBtn.className = "qty-btn";
    plusBtn.type = "button";
    plusBtn.dataset.action = "increase";
    plusBtn.dataset.key = getCartKey(item.name, item.sizeMl);
    plusBtn.setAttribute("aria-label", "Menge erhöhen");
    plusBtn.innerHTML = '<i data-lucide="plus"></i>';

    qtyControl.append(minusBtn, qtyValue, plusBtn);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.dataset.action = "remove";
    removeBtn.dataset.key = getCartKey(item.name, item.sizeMl);
    removeBtn.innerHTML = '<i data-lucide="trash-2"></i>Entfernen';

    controls.append(qtyControl, removeBtn);
    li.append(top, controls);
    cartItemsEl.appendChild(li);
  });

  syncIcons();
  saveToStorage(CART_STORAGE_KEY, cart);
}

// Eigenleistung: Warenkorb-Einträge werden nach Produkt und gewaehlter Groesse zusammengefasst.
function addToCart(product) {
  if (!product?.name || !Number.isFinite(product.price) || product.price <= 0) {
    return;
  }

  const sizeMl = Number(product.sizeMl || 100);
  const sizeOption = getSizeOption(sizeMl);
  const existingItem = cart.find((item) => getCartKey(item.name, item.sizeMl) === getCartKey(product.name, sizeMl));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      sizeMl,
      sizeLabel: sizeOption.label,
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
  // Neue Produkte aus dem Formular erhalten dieselbe Struktur wie die festen Produktkarten.
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.category = category;
  card.dataset.gender = gender;
  card.dataset.name = name;
  card.dataset.price = String(price);
  card.dataset.size = "75 ml";
  card.dataset.concentration = "Eau de Parfum";
  card.dataset.notes = description;
  card.dataset.story = `${name} wurde im Produktformular angelegt und ergänzt das Sortiment als eigene Projektidee.`;
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
  // Eigene Produkte kommen aus dem lokalen Browser-Speicher.
  return loadFromStorage(PRODUCTS_STORAGE_KEY, []);
}

function saveCustomProduct(product) {
  // Neue Produkte werden an die vorhandene Liste angehaengt.
  const products = getCustomProducts();
  products.push(product);
  saveToStorage(PRODUCTS_STORAGE_KEY, products);
}

function renderCustomProducts() {
  // Beim Laden der Seite werden eigene Produkte wieder in den Shop eingefuegt.
  getCustomProducts().forEach((product) => {
    productGrid.appendChild(createProductCard(product));
  });
}

function appendChatMessage(container, text, role) {
  // Neue Chatnachrichten werden unten angehaengt und der Chat scrollt automatisch mit.
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  message.textContent = text;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

function normalizeAiText(text) {
  // Vereinheitlicht Eingaben, damit der Bot auch Umlaute, Grossschreibung und Tippvarianten erkennt.
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function includesAny(text, words) {
  return words.some((word) => text.includes(normalizeAiText(word)));
}

function getCatalogProducts() {
  // Der Bot liest die echten Produktkarten aus, statt eine zweite Produktliste zu pflegen.
  return Array.from(productGrid.querySelectorAll(".product-card")).map((card) => ({
    ...getProductDetails(card),
    category: card.dataset.category || "",
    gender: card.dataset.gender || "",
    searchText: normalizeAiText(`${card.dataset.name || ""} ${card.textContent || ""} ${card.dataset.notes || ""} ${card.dataset.story || ""}`),
  }));
}

function getRequestedSize(text) {
  const match = text.match(/\b(3|25|50|100)\s*ml\b/);
  return match ? Number(match[1]) : 100;
}

function getRequestedBudget(text) {
  const match = text.match(/(?:unter|bis|maximal|max\.?|budget)\s*(\d{2,3})/);
  return match ? Number(match[1]) : null;
}

function findMentionedProduct(products, text) {
  return products.find((product) => {
    const simpleName = normalizeAiText(product.name.replace("Aestas", "").trim());
    return text.includes(normalizeAiText(product.name)) || text.includes(simpleName);
  });
}

function scoreProduct(product, text, budget) {
  let score = 0;

  if (includesAny(text, ["damen", "frau", "frauen", "rund"]) && product.gender === "damen") score += 4;
  if (includesAny(text, ["herren", "mann", "männer", "maenner", "eckig"]) && product.gender === "herren") score += 4;
  if (includesAny(text, ["frisch", "leicht", "fresh", "sommer", "zitrisch"]) && product.category === "fresh") score += 4;
  if (includesAny(text, ["warm", "amber", "vanille", "abend", "luxus"]) && product.category === "amber") score += 4;
  if (includesAny(text, ["oud", "intensiv", "stark", "leder", "holz"]) && product.category === "oud") score += 4;
  if (includesAny(text, ["rose", "blume", "floral", "jasmin"]) && includesAny(product.searchText, ["rose", "flora", "jasmin", "pfingstrose"])) score += 3;
  if (includesAny(text, ["haltbar", "lange", "stark"]) && includesAny(product.searchText, ["extrait", "oud", "amber", "lang"])) score += 2;
  if (includesAny(text, ["geschenk", "geburtstag", "schenken"]) && includesAny(product.searchText, ["luna", "solis", "flora"])) score += 2;
  if (budget && product.price <= budget) score += 3;
  if (budget && product.price > budget) score -= 3;

  return score;
}

function formatProductSuggestion(product, sizeMl) {
  const price = calculateSizePrice(product.price, sizeMl);
  const sizeOption = getSizeOption(sizeMl);
  return `${product.name} (${sizeOption.label}, ${formatEur(price)})`;
}

function getAiReply(userMessage) {
  // Lokaler KI-Assistent: wertet Produktdaten, Budget, Groesse und Kaufabsicht aus.
  const text = normalizeAiText(userMessage);
  const products = getCatalogProducts();
  const sizeMl = getRequestedSize(text);
  const budget = getRequestedBudget(text);
  const mentionedProduct = findMentionedProduct(products, text);
  const wantsCartAction = includesAny(text, ["warenkorb", "korb", "kaufen", "bestellen", "hinzufuegen", "hinzufügen"]);

  if (mentionedProduct && wantsCartAction) {
    addToCart({
      name: mentionedProduct.name,
      price: calculateSizePrice(mentionedProduct.price, sizeMl),
      sizeMl,
    });
    setDrawerOpen(true);
    return `${formatProductSuggestion(mentionedProduct, sizeMl)} wurde in den Warenkorb gelegt. Du kannst dort die Menge ändern oder eine Lieferadresse testen.`;
  }

  if (mentionedProduct) {
    return `${mentionedProduct.name}: ${mentionedProduct.description} Duftnoten: ${mentionedProduct.notes}. Hintergrund: ${mentionedProduct.story} Für den Warenkorb kannst du z. B. schreiben: "${mentionedProduct.name} 25 ml in den Warenkorb".`;
  }

  if (includesAny(text, ["alle", "sortiment", "produkte", "parfums"])) {
    const names = products.map((product) => product.name.replace("Aestas ", "")).join(", ");
    return `Im Sortiment sind: ${names}. Frag mich zum Beispiel nach "frisch für Damen", "intensiv für Herren" oder "Geschenk unter 160".`;
  }

  const rankedProducts = products
    .map((product) => ({ product, score: scoreProduct(product, text, budget) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.product);

  if (rankedProducts.length > 0) {
    const suggestions = rankedProducts.map((product) => formatProductSuggestion(product, sizeMl)).join(", ");
    const budgetText = budget ? ` Ich habe dein Budget bis ${formatEur(budget)} berücksichtigt.` : "";
    return `Meine Empfehlung: ${suggestions}.${budgetText} Klicke auf "Mehr Infos" für Duftnoten, Inhaltsstoffe und Hintergrundgeschichte.`;
  }

  const reply = aiReplies.find((entry) => entry.keywords.some((keyword) => text.includes(normalizeAiText(keyword))));

  if (reply) {
    return reply.text;
  }

  return "Sag mir gern: Damen oder Herren, frisch/warm/intensiv, dein Budget und die gewünschte Größe. Beispiel: \"frisch für Damen unter 150\" oder \"Aestas Luna 25 ml in den Warenkorb\".";
}

function getSupportReply(userMessage) {
  // Der Support-Chat erkennt typische Stichwoerter wie Versand oder Retoure.
  const text = userMessage.toLowerCase();
  if (text.includes("versand")) return supportReplies.versand;
  if (text.includes("rückgabe") || text.includes("retoure")) return supportReplies.rueckgabe;
  if (text.includes("rückerstattung")) return supportReplies.rueckerstattung;
  if (text.includes("bestellung") || text.includes("order")) return supportReplies.bestellung;
  return supportReplies.standard;
}

productGrid.addEventListener("click", (event) => {
  // Ein Klick auf "In den Warenkorb" kauft nicht, sondern legt nur lokal in den Demo-Warenkorb.
  const addButton = event.target.closest(".add-btn");
  const detailButton = event.target.closest(".detail-btn");
  const card = event.target.closest(".product-card");
  if (!card) {
    return;
  }

  if (addButton) {
    const product = getCardData(card);
    addToCart({ ...product, price: calculateSizePrice(product.price, 100), sizeMl: 100 });
    return;
  }

  if (detailButton || !event.target.closest("button")) {
    openProductDetails(card);
    return;
  }
});

filterButtons.forEach((button) => {
  // Jeder Filter-Button aktualisiert den aktiven Filter und blendet unpassende Produkte aus.
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    applyFilter();
  });
});

searchFocusBtn.addEventListener("click", () => {
  // Der Suchbutton im Header springt direkt zur Produktsuche.
  document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
  shopSearchInput.focus({ preventScroll: true });
});

shopSearchInput.addEventListener("input", () => {
  activeSearch = shopSearchInput.value.trim().toLowerCase();
  applyFilter();
});

cartItemsEl.addEventListener("click", (event) => {
  // Warenkorb-Buttons steuern Mengen: plus, minus oder entfernen.
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;
  const key = actionButton.dataset.key;
  const item = cart.find((entry) => getCartKey(entry.name, entry.sizeMl) === key);
  if (!item) {
    return;
  }

  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart = cart.filter((entry) => getCartKey(entry.name, entry.sizeMl) !== key);
    }
  } else if (action === "remove") {
    cart = cart.filter((entry) => getCartKey(entry.name, entry.sizeMl) !== key);
  }

  renderCart();
});

clearCartBtn.addEventListener("click", () => {
  cart = [];
  renderCart();
});

checkoutBtn.addEventListener("click", () => {
  const address = deliveryAddressInput.value.trim();
  if (!cart.length) {
    checkoutStatus.textContent = "Der Warenkorb ist noch leer.";
    return;
  }
  if (!address) {
    checkoutStatus.textContent = "Bitte zuerst eine Lieferadresse eingeben.";
    deliveryAddressInput.focus();
    return;
  }

  checkoutStatus.textContent = `Checkout-Demo bereit für: ${address}`;
  appendChatMessage(
    supportMessages,
    "Support: Checkout wurde als Demo ausgelöst. Adresse und Warenkorb wurden lokal geprüft.",
    "agent"
  );
  setDrawerOpen(false);
});

cartToggleBtn.addEventListener("click", () => setDrawerOpen(true));
openCartFromSection.addEventListener("click", () => setDrawerOpen(true));
cartCloseBtn.addEventListener("click", () => setDrawerOpen(false));
drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));

document.addEventListener("keydown", (event) => {
  // Escape schliesst zuerst den Produktdialog, sonst den Warenkorb.
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
  const sizeMl = Number(productModalSizeSelect.value || 100);
  addToCart({
    name: selectedProduct.name,
    price: calculateSizePrice(selectedProduct.price, sizeMl),
    sizeMl,
  });
  setProductModalOpen(false);
  setDrawerOpen(true);
});

productModalSizeSelect.addEventListener("change", updateModalPricePreview);

addProductForm.addEventListener("submit", (event) => {
  // Das Produktformular erstellt eine neue Karte, ohne die Seite neu zu laden.
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
  // Die Karte wird ueber die eingegebene Adresse neu geladen.
  event.preventDefault();
  const query = mapAddressInput.value.trim();
  if (!query) {
    return;
  }
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
});

testDeliveryMapBtn.addEventListener("click", () => {
  // Das Lieferfeld testet dieselbe Karte wie die Filialsuche und zeigt sofort eine Rueckmeldung.
  const query = deliveryAddressInput.value.trim();
  if (!query) {
    checkoutStatus.textContent = "Bitte eine Lieferadresse eintragen.";
    deliveryAddressInput.focus();
    return;
  }

  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  checkoutStatus.textContent = `Adresse wurde in Maps getestet: ${query}`;
  document.getElementById("filiale").scrollIntoView({ behavior: "smooth", block: "start" });
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

aiChatForm.addEventListener("submit", (event) => {
  // Der KI-Chat antwortet zeitverzoegert, damit es wie ein kurzer Dialog wirkt.
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
  // Der Support-Chat nutzt dieselbe Chatlogik, aber andere Antworttexte.
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

fontDecreaseBtn.addEventListener("click", () => {
  fontScale -= 5;
  applyFontScale();
});

fontIncreaseBtn.addEventListener("click", () => {
  fontScale += 5;
  applyFontScale();
});

speakPageBtn.addEventListener("click", speakPageSummary);

applyFontScale();
renderCustomProducts();
renderCart();
applyFilter();
syncIcons();
