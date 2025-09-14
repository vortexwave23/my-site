import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// 🔹 Admin panel ürün ekleme
const form = document.getElementById("product-form");
if(form){
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name = document.getElementById("prod-name").value;
    const img = document.getElementById("prod-img").value;
    const link = document.getElementById("prod-link").value;

    // Yeni ürün eklerken sıra indexini alıyoruz
    const querySnapshot = await getDocs(collection(db,"products"));
    const order = querySnapshot.size;

    await addDoc(collection(db,"products"), {name, img, link, order});
    form.reset();
    renderProductsAdmin();
    renderProductsGuest();
  });
}

// 🔹 Admin panelde ürünleri listeleme ve sürükle-bırak
async function renderProductsAdmin(){
  const container = document.getElementById("product-list-admin");
  if(!container) return;
  container.innerHTML="";

  const q = query(collection(db,"products"), orderBy("order"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(docSnap=>{
    const p = docSnap.data();
    const div = document.createElement("div");
    div.className = "product";
    div.dataset.id = docSnap.id;

    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <p class="prod-name">${p.name}</p>
      <button class="delete-btn">Sil</button>
    `;

    // Silme butonu
    div.querySelector(".delete-btn").addEventListener("click", async ()=>{
      if(confirm("Ürünü silmek istediğine emin misin?")){
        await deleteDoc(doc(db,"products",docSnap.id));
        renderProductsAdmin();
        renderProductsGuest();
      }
    });

    container.appendChild(div);
  });

  // 🔹 SortableJS ile sürükle-bırak
  Sortable.create(container, {
    animation: 150,
    onEnd: async (evt)=>{
      const children = Array.from(container.children);
      for(let i=0;i<children.length;i++){
        const id = children[i].dataset.id;
        await updateDoc(doc(db,"products",id), {order: i});
      }
    }
  });
}

// 🔹 Guest panelde ürünleri listeleme
async function renderProductsGuest(){
  const container = document.getElementById("product-list");
  if(!container) return;
  container.innerHTML="";
  const q = query(collection(db,"products"), orderBy("order"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(docSnap=>{
    const p = docSnap.data();
    const a = document.createElement("a");
    a.href = p.link;
    a.target="_blank";
    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.name;
    const span = document.createElement("span");
    span.textContent = p.name;
    span.className = "prod-name-guest";
    a.appendChild(img);
    a.appendChild(span);
    container.appendChild(a);
  });
}

renderProductsAdmin();
renderProductsGuest();
