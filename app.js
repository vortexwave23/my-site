import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// 🔹 Admin panel için ürün ekleme
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

// 🔹 Admin panelde ürünleri listeleme
async function renderProductsAdmin() {
  const container = document.getElementById("product-list-admin");
  if (!container) return;
  container.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((doc) => {
    const p = doc.data();
    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.name;
    container.appendChild(img);
  });
}

// 🔹 Ana sayfada ürünleri gösterme
async function renderProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;
  container.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((doc) => {
    const p = doc.data();
    const a = document.createElement("a");
    a.href = p.link;
    a.target = "_blank";
    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.name;
    a.appendChild(img);
    container.appendChild(a);
  });
}
renderProducts();

// 🔹 Saat
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// 🔹 Scroll animasyonu
const scrollItems = document.querySelectorAll(".scroll-item");
window.addEventListener("scroll", () => {
  const windowHeight = window.innerHeight;
  scrollItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
      item.classList.add("visible");
      item.style.transitionDelay = `${index * 0.2}s`;
    } else {
      item.classList.remove("visible");
    }
  });
});

// 🔹 Video otomatik oynatma
const video = document.getElementById("bg-video");
if (video) {
  video.muted = true;
  video.play().catch(() => {});
}
