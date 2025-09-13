import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBFWkamflwlXyiX8WXS8lf3hwri4y5Cmqw",
  authDomain: "data-85f1e.firebaseapp.com",
  projectId: "data-85f1e",
  storageBucket: "data-85f1e.appspot.com",
  messagingSenderId: "258131108684",
  appId: "1:258131108684:web:2b0c148b1610594d6da5e9",
  measurementId: "G-N9D14VVN4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin panel: ürün ekleme
const form = document.getElementById("product-form");
if(form){
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name = document.getElementById("prod-name").value;
    const img = document.getElementById("prod-img").value;
    const link = document.getElementById("prod-link").value;

    if(!name || !img || !link){
      alert("Tüm alanları doldurun!");
      return;
    }

    await addDoc(collection(db, "products"), { name, img, link });
    alert("Ürün eklendi!");
    form.reset();
    renderProductsAdmin();
  });
}

// Admin panel: ürün listeleme + güncelleme + silme
async function renderProductsAdmin(){
  const container = document.getElementById("product-list-admin");
  if(!container) return;
  container.innerHTML="";
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((docItem)=>{
    const p = docItem.data();

    const productDiv = document.createElement("div");
    productDiv.className="product";

    const img = document.createElement("img");
    img.src = p.img;
    productDiv.appendChild(img);

    const name = document.createElement("div");
    name.className="product-name";
    name.textContent = p.name;
    productDiv.appendChild(name);

    // Güncelle butonu
    const updateBtn = document.createElement("button");
    updateBtn.textContent="Güncelle";
    updateBtn.className="update-btn";
    updateBtn.onclick = async ()=>{
      const newName = prompt("Yeni isim:", p.name);
      const newImg = prompt("Yeni resim linki:", p.img);
      const newLink = prompt("Yeni link:", p.link);
      if(newName && newImg && newLink){
        await updateDoc(doc(db,"products",docItem.id), { name:newName, img:newImg, link:newLink });
        renderProductsAdmin();
      }
    };
    productDiv.appendChild(updateBtn);

    // Sil butonu
    const delBtn = document.createElement("button");
    delBtn.textContent="Sil";
    delBtn.className="update-btn";
    delBtn.onclick = async ()=>{
      const confirmDel = confirm("Ürünü silmek istediğinize emin misiniz?");
      if(confirmDel){
        await deleteDoc(doc(db,"products",docItem.id));
        renderProductsAdmin();
      }
    };
    productDiv.appendChild(delBtn);

    container.appendChild(productDiv);
  });
}
renderProductsAdmin();

// Guest panel: ürünleri listeleme
async function renderProductsGuest(){
  const container = document.getElementById("product-list");
  if(!container) return;
  container.innerHTML="";
  const querySnapshot = await getDocs(collection(db,"products"));
  querySnapshot.forEach(docItem=>{
    const p = docItem.data();
    const productDiv = document.createElement("div");
    productDiv.className="product";

    const a = document.createElement("a");
    a.href = p.link;
    a.target="_blank";

    const img = document.createElement("img");
    img.src = p.img;
    a.appendChild(img);

    const name = document.createElement("div");
    name.className="product-name";
    name.textContent = p.name;
    a.appendChild(name);

    productDiv.appendChild(a);
    container.appendChild(productDiv);
  });
}
renderProductsGuest();

// Saat
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const clock = document.getElementById("clock");
  if(clock) clock.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock,1000);
updateClock();

// Scroll animasyon
const scrollItems = document.querySelectorAll('.scroll-item');
window.addEventListener('scroll', () => {
  const windowHeight = window.innerHeight;
  scrollItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    if(rect.top < windowHeight * 0.8 && rect.bottom > 0){
      item.classList.add('visible');
      item.style.transitionDelay = `${index*0.2}s`;
    } else {
      item.classList.remove('visible');
    }
  });
});

// Mouse cursor ışıltısı guest panel
const cursor = document.createElement('div');
cursor.style.width = "15px";
cursor.style.height = "15px";
cursor.style.borderRadius = "50%";
cursor.style.position = "fixed";
cursor.style.pointerEvents = "none";
cursor.style.background = "radial-gradient(circle, #ff00ff, #a020f0)";
cursor.style.mixBlendMode = "screen";
document.body.appendChild(cursor);
window.addEventListener('mousemove', e=>{
  cursor.style.left = e.clientX - 7 + "px";
  cursor.style.top = e.clientY - 7 + "px";
});
