import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFWkamflwlXyiX8WXS8lf3hwri4y5Cmqw",
  authDomain: "data-85f1e.firebaseapp.com",
  projectId: "data-85f1e",
  storageBucket: "data-85f1e.firebasestorage.app",
  messagingSenderId: "258131108684",
  appId: "1:258131108684:web:2b0c148b1610594d6da5e9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("product-form");
const actionMsg = document.getElementById("action-msg");

async function renderProducts(){
  const container = document.getElementById("product-list-admin");
  container.innerHTML="";
  const querySnapshot = await getDocs(collection(db,"products"));
  querySnapshot.forEach(docSnap=>{
    const p = docSnap.data();
    const div = document.createElement("div");
    div.className="product";
    div.innerHTML=`<strong style="color:#c020ff;text-shadow:0 0 5px #9b59b6;">${p.name}</strong><br>
                   <img src="${p.img}" alt="${p.name}"><br>
                   <button class="update-btn">Güncelle</button>
                   <button class="delete-btn">Sil</button>`;
    // Sil
    div.querySelector(".delete-btn").addEventListener("click", async ()=>{
      if(confirm("Bu ürünü silmek istediğine emin misin?")){
        await deleteDoc(doc(db,"products",docSnap.id));
        actionMsg.style.display="block"; actionMsg.style.background="#ff1a1a"; actionMsg.textContent="Ürün silindi!";
        setTimeout(()=>actionMsg.style.display="none",3000);
        renderProducts();
      }
    });
    // Güncelle
    div.querySelector(".update-btn").addEventListener("click", async ()=>{
      const newName = prompt("Yeni ürün adını girin:", p.name);
      const newImg = prompt("Yeni resim URL girin (3:4 oran)", p.img);
      const newLink = prompt("Yeni Trendyol linki girin:", p.link);
      if(newName && new
