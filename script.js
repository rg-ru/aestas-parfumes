const bagCount = document.getElementById("bagCount");
const addButtons = Array.from(document.querySelectorAll(".add-btn"));
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const productCards = Array.from(document.querySelectorAll(".product-card"));

let itemsInBag = 0;

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    itemsInBag += 1;
    bagCount.textContent = String(itemsInBag);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetFilter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    productCards.forEach((card) => {
      const category = card.dataset.category;
      const visible = targetFilter === "all" || category === targetFilter;
      card.hidden = !visible;
    });
  });
});

if (window.lucide) {
  window.lucide.createIcons();
}
