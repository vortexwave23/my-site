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
// Özel onay penceresi
function customConfirm(message, callback) {
    // Eski onay kutusu varsa temizle
    let oldBox = document.querySelector(".custom-confirm");
    if (oldBox) oldBox.remove();

    // Kutu oluştur
    let box = document.createElement("div");
    box.className = "custom-confirm";
    box.innerHTML = `
        <div class="confirm-content">
            <p>${message}</p>
            <div class="confirm-buttons">
                <button id="confirm-yes">Evet</button>
                <button id="confirm-no">Hayır</button>
            </div>
        </div>
    `;
    document.body.appendChild(box);

    // Butonlar
    document.getElementById("confirm-yes").onclick = function() {
        box.remove();
        callback(true);
    };
    document.getElementById("confirm-no").onclick = function() {
        box.remove();
        callback(false);
    };
}

// Silme işlemi
function deleteProduct(id) {
    customConfirm("Bu ürünü silmek istediğine emin misin?", function(result) {
        if (result) {
            console.log("Ürün silindi:", id);
            // Buraya silme işlemi backend kodunu ekle
        }
    });
}

// Güncelleme işlemi
function updateProduct(id) {
    customConfirm("Bu ürünü güncellemek istediğine emin misin?", function(result) {
        if (result) {
            console.log("Ürün güncellendi:", id);
            // Buraya güncelleme işlemi backend kodunu ekle
        }
    });
}
