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

// Pagination ayarları
const ITEMS_PER_PAGE = 6;

// 🔹 Admin panel: ürün ekleme
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

// 🔹 Admin panel: ürünleri listeleme ve silme
async function renderProductsAdmin(page=1) {
  const container = document.getElementById("product-list-admin");
  const pagination = document.getElementById("pagination-admin");
  if(!container || !pagination) return;
  container.innerHTML = "";
  pagination.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "products"));
  const products = querySnapshot.docs.map(d=>({id:d.id, ...d.data()}));
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const start = (page-1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageProducts = products.slice(start,end);

  pageProducts.forEach(p=>{
    const div = document.createElement("div");
    div.classList.add("product-admin");
    div.innerHTML = `<img src="${p.img}" alt="${p.name}"><p>${p.name}</p>`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Sil";
    delBtn.classList.add("delete-btn");
    delBtn.onclick = async ()=> {
      if(confirm("Bu ürünü silmek istediğine emin misin?")){
        await deleteDoc(doc(db,"products",p.id));
        renderProductsAdmin(page);
      }
    };
    div.appendChild(delBtn);
    container.appendChild(div);
  });

  for(let i=1;i<=totalPages;i++){
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("page-btn");
    if(i===page) btn.classList.add("active");
    btn.onclick = ()=> renderProductsAdmin(i);
    pagination.appendChild(btn);
  }
}

// 🔹 Guest panel: ürünleri listeleme
async function renderProducts(page=1) {
  const container = document.getElementById("product-list");
  const pagination = document.getElementById("pagination");
  if(!container || !pagination) return;
  container.innerHTML = "";
  pagination.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "products"));
  const products = querySnapshot.docs.map(d=>({id:d.id, ...d.data()}));
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const start = (page-1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageProducts = products.slice(start,end);

  pageProducts.forEach(p=>{
    const a = document.createElement("a");
    a.href = p.link;
    a.target="_blank";
    a.classList.add("product");
    a.innerHTML = `<img src="${p.img}" alt="${p.name}"><p>${p.name}</p>`;
    container.appendChild(a);
  });

  for(let i=1;i<=totalPages;i++){
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("page-btn");
    if(i===page) btn.classList.add("active");
    btn.onclick = ()=> renderProducts(i);
    pagination.appendChild(btn);
  }
}

// Render işlemleri
renderProductsAdmin();
renderProducts();
