import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFWkamflwlXyiX8WXS8lf3hwri4y5Cmqw",
  authDomain: "data-85f1e.firebaseapp.com",
  projectId: "data-85f1e",
  storageBucket: "data-85f1e.firebasestorage.app",
  messagingSenderId: "258131108684",
  appId: "1:258131108684:web:2b0c148b1610594d6da5e9",
  measurementId: "G-N9D14VVN4R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sabit admin bilgileri
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Oturum kontrolü
function checkAuth() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (!isAuthenticated && window.location.pathname.includes("admin.html")) {
    window.location.href = "admin-login.html";
  }
}

// Sayfada oturum kontrolü yap ve ürünleri yükle
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  renderProductsAdmin();
});

// Giriş alanı
const loginForm = document.getElementById("login-form");
const loginArea = document.getElementById("login-area");
const adminArea = document.getElementById("admin-area");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem("isAuthenticated", "true");
      loginArea.style.display = "none";
      adminArea.style.display = "block";
      window.location.href = "admin.html";
    } else {
      alert("Kullanıcı adı veya şifre hatalı!");
    }
  });
}

// Çıkış yapma işlemi
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "admin-login.html";
  });
}

// Ürün ekleme
const form = document.getElementById("product-form");
if (form) {
  const nameIn = document.getElementById("prod-name");
  const imgIn = document.getElementById("prod-img");
  const linkIn = document.getElementById("prod-link");
  const previewImg = document.getElementById("preview-img");
  const previewTitle = document.getElementById("preview-title");

  [nameIn, imgIn].forEach(i => i?.addEventListener('input', () => {
    previewImg.src = imgIn.value || 'https://via.placeholder.com/300x200?text=Preview';
    previewTitle.textContent = nameIn.value || 'Ürün adı burada görünür';
  }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameIn.value.trim();
    const img = imgIn.value.trim();
    const link = linkIn.value.trim();

    if (!name || !img) {
      alert("Ürün adı ve görsel URL zorunludur!");
      return;
    }

    // Varsayılan order değeri için mevcut ürün sayısını al
    const snap = await getDocs(collection(db, "products"));
    const order = snap.size;

    await addDoc(collection(db, "products"), { name, img, link, order, _ts: Date.now() });
    alert("Ürün eklendi!");
    form.reset();
    previewImg.src = "https://via.placeholder.com/300x200?text=Preview";
    previewTitle.textContent = "Ürün adı burada görünür";
    renderProductsAdmin();
  });
}

// Ürün listeleme + silme + sürükle-bırak
async function renderProductsAdmin() {
  const container = document.getElementById("product-list-admin");
  if (!container) return;
  container.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  const products = [];
  querySnapshot.forEach((d) => products.push({ id: d.id, ...d.data() }));
  products.sort((a, b) => (a.order || 0) - (b.order || 0)); // order alanına göre sırala

  products.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.setAttribute("draggable", "true");
    div.setAttribute("data-id", p.id);
    div.innerHTML = `
      <div class="neon-border"></div>
      <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="product-title">${p.name}</div>
      <div class="buy">
        <a href="${p.link}" target="_blank" class="btn-buy">Git</a>
        <button class="btn-ghost" data-id="${p.id}">Sil</button>
      </div>
    `;

    // Sürükle-bırak olayları
    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", p.id);
      div.classList.add("dragging");
    });

    div.addEventListener("dragend", () => {
      div.classList.remove("dragging");
    });

    div.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    div.addEventListener("drop", async (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      const targetId = p.id;
      if (draggedId !== targetId) {
        await reorderProducts(draggedId, targetId);
        renderProductsAdmin();
      }
    });

    div.querySelector("button").addEventListener("click", async () => {
      await deleteDoc(doc(db, "products", p.id));
      await updateProductOrders(); // Silme sonrası sıralamayı güncelle
      renderProductsAdmin();
    });

    container.appendChild(div);
  });
}

// Ürün sıralamasını güncelleme
async function reorderProducts(draggedId, targetId) {
  const snap = await getDocs(collection(db, "products"));
  const products = [];
  snap.forEach((d) => products.push({ id: d.id, ...d.data() }));
  products.sort((a, b) => (a.order || 0) - (b.order || 0));

  const draggedIndex = products.findIndex(p => p.id === draggedId);
  const targetIndex = products.findIndex(p => p.id === targetId);

  const [draggedProduct] = products.splice(draggedIndex, 1);
  products.splice(targetIndex, 0, draggedProduct);

  // Yeni sıralamayı Firestore’a kaydet
  for (let i = 0; i < products.length; i++) {
    await updateDoc(doc(db, "products", products[i].id), { order: i });
  }
}

// Ürün silindikten sonra sıralamayı güncelle
async function updateProductOrders() {
  const snap = await getDocs(collection(db, "products"));
  const products = [];
  snap.forEach((d) => products.push({ id: d.id, ...d.data() }));
  products.sort((a, b) => (a.order || 0) - (b.order || 0));

  for (let i = 0; i < products.length; i++) {
    await updateDoc(doc(db, "products", products[i].id), { order: i });
  }
}