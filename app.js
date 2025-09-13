import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// 🔹 Admin panel: ürün ekleme
const form = document.getElementById("product-form");
if(form){
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name = document.getElementById("prod-name").value;
    const img = document.getElementById("prod-img").value;
    const link = document.getElementById("prod-link").value;

    await addDoc(collection(db,"products"), {name,img,link});
    form.reset();
    renderProductsAdmin();
    renderProductsGuest();
  });
}

// 🔹 Admin ürünleri listeleme + güncelleme/silme
async function renderProductsAdmin(){
  const container = document.getElementById("product-list-admin");
  if(!container) return;
  container.innerHTML="";
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach((docItem)=>{
    const p = docItem.data();
    const div = document.createElement("div");
    div.classList.add("product");

    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <button class="update-btn">Güncelle</button>
      <button class="update-btn">Sil</button>
    `;

    // Güncelle butonu
    div.querySelector("button:first-of-type").addEventListener("click", ()=>{
      const newName = prompt("Yeni isim:", p.name);
      const newImg = prompt("Yeni görsel URL:", p.img);
      const newLink = prompt("Yeni link:", p.link);
      updateDoc(doc(db,"products",docItem.id), {name:newName,img:newImg,link:newLink})
        .then(()=>{renderProductsAdmin(); renderProductsGuest();});
    });

    // Sil butonu
    div.querySelector("button:last-of-type").addEventListener("click", ()=>{
      deleteDoc(doc(db,"products",docItem.id))
        .then(()=>{renderProductsAdmin(); renderProductsGuest();});
    });

    container.appendChild(div);
  });
}
renderProductsAdmin();

// 🔹 Ana sayfa ürünleri göster
async function renderProductsGuest(){
  const container = document.getElementById("product-list");
  if(!container) return;
  container.innerHTML="";
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach((docItem)=>{
    const p = docItem.data();
    const a = document.createElement("a");
    a.href = p.link;
    a.target="_blank";
    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.name;
    a.appendChild(img);
    container.appendChild(a);
  });
}
renderProductsGuest();

// 🔹 Saat
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const clock = document.getElementById("clock");
  if(clock) clock.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock,1000);
updateClock();

// 🔹 Scroll animasyon
const scrollItems = document.querySelectorAll(".scroll-item");
window.addEventListener("scroll", () => {
  const windowHeight = window.innerHeight;
  scrollItems.forEach((item,index)=>{
    const rect = item.getBoundingClientRect();
    if(rect.top < windowHeight*0.8 && rect.bottom>0){
      item.classList.add("visible");
      item.style.transitionDelay=`${index*0.2}s`;
    } else { item.classList.remove("visible"); }
  });
});

// 🔹 Video otomatik oynatma
const video = document.getElementById("bg-video");
if(video){ video.muted=true; video.play().catch(()=>{}); }
