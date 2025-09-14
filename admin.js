// Modal kontrol fonksiyonu
function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    const modalMessage = document.getElementById("confirmMessage");
    const confirmBtn = document.getElementById("confirmYes");
    const cancelBtn = document.getElementById("confirmNo");

    modalMessage.textContent = message;
    modal.style.display = "flex";

    confirmBtn.onclick = () => {
        modal.style.display = "none";
        onConfirm();
    };
    cancelBtn.onclick = () => {
        modal.style.display = "none";
    };
}

// Ürün ekle
function addProduct() {
    const name = document.getElementById("productName").value;
    const img = document.getElementById("productImage").value;

    if (name.trim() === "" || img.trim() === "") {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    const list = document.getElementById("product-list");

    const card = document.createElement("div");
    card.className = "product-card";
    const id = "product-" + Date.now();
    card.id = id;

    card.innerHTML = `
        <img src="${img}" alt="${name}">
        <h3>${name}</h3>
        <button class="update-btn" onclick="updateProduct('${id}')">Güncelle</button>
        <button class="delete-btn" onclick="deleteProduct('${id}')">Sil</button>
    `;

    list.appendChild(card);

    document.getElementById("productName").value = "";
    document.getElementById("productImage").value = "";
}

// Ürün sil
function deleteProduct(productId) {
    showConfirmModal("Bu ürünü silmek istediğine emin misin?", () => {
        document.getElementById(productId).remove();
    });
}

// Ürün güncelle
function updateProduct(productId) {
    showConfirmModal("Bu ürünü güncellemek istediğine emin misin?", () => {
        alert("Ürün güncellendi!");
    });
}
