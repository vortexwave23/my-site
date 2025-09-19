import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const ADMIN_USER = "vortex";
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
  renderProductsAdmin(); // Sayfa yüklendiğinde ürünleri listele
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
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("prod-name").value;
    const img = document.getElementById("prod-img").value;
    const link = document.getElementById("prod-link").value;

    await addDoc(collection(db, "products"), { name, img, link, _ts: Date.now() });
    alert("Ürün eklendi!");
    form.reset();
    document.getElementById("preview-img").src = "https://via.placeholder.com/300x200?text=Preview";
    document.getElementById("preview-title").textContent = "Ürün adı burada görünür";
    renderProductsAdmin();
  });
}

// Ürün listeleme + silme
async function renderProductsAdmin() {
  const container = document.getElementById("product-list-admin");
  if (!container) return;
  container.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  const products = [];
  querySnapshot.forEach((d) => products.push({ id: d.id, ...d.data() }));
  products.sort((a, b) => (b._ts || 0) - (a._ts || 0)); // En son eklenen üstte

  products.forEach((p) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <div class="neon-border"></div>
      <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="product-title">${p.name}</div>
      <div class="buy">
        <a href="${p.link}" target="_blank" class="btn-buy">Git</a>
        <button class="btn-ghost" data-id="${p.id}">Sil</button>
      </div>
    `;
    div.querySelector("button").addEventListener("click", async () => {
      await deleteDoc(doc(db, "products", p.id));
      renderProductsAdmin();
    });
    container.appendChild(div);
  });
}