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
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Oturum kontrolü
function checkAuth() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (!isAuthenticated && window.location.pathname.includes("admin.html")) {
    window.location.href = "admin-login.html";
  }
}

// Sayfada oturum kontrolü yap
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
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
      renderProductsAdmin();
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

    await addDoc(collection(db, "products"), { name, img, link });
    alert("Ürün eklendi!");
    form.reset();
    renderProductsAdmin();
  });
}

// Ürün listeleme + silme
async function renderProductsAdmin() {
  const container = document.getElementById("product-list-admin");
  if (!container) return;
  container.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((d) => {
    const p = d.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${p.name}</p>
      <img src="${p.img}" alt="${p.name}" width="100">
      <a href="${p.link}" target="_blank">Git</a>
      <button data-id="${d.id}">Sil</button>
    `;
    div.querySelector("button").addEventListener("click", async () => {
      await deleteDoc(doc(db, "products", d.id));
      renderProductsAdmin();
    });
    container.appendChild(div);
  });
}