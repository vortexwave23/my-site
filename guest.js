// Ürünleri listele (test için elle ekledim, sen Firestore’dan çekebilirsin)
const products = [
  { name: "Ürün 1", img: "https://via.placeholder.com/200x270", link: "https://example.com/urun1" },
  { name: "Ürün 2", img: "https://via.placeholder.com/200x270", link: "https://example.com/urun2" },
  { name: "Ürün 3", img: "https://via.placeholder.com/200x270", link: "https://example.com/urun3" },
];

const guestList = document.getElementById("guest-product-list");
products.forEach((p, index) => {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <img src="${p.img}" alt="${p.name}">
    <h3>${p.name}</h3>
  `;
  card.onclick = () => openProductModal(p);
  guestList.appendChild(card);
});

// Modal
const modal = document.getElementById("productModal");
const modalName = document.getElementById("modalProductName");
const modalImg = document.getElementById("modalProductImage");
const modalBuy = document.getElementById("modalBuy");
const modalClose = document.getElementById("modalClose");

function openProductModal(product) {
  modalName.textContent = product.name;
  modalImg.src = product.img;
  modalBuy.onclick = () => window.open(product.link, "_blank");
  modal.style.display = "flex";
}

modalClose.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
