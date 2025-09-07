import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyABzhhrdmXeJSCPj-lqNOKwizL3-qxRBnw",
    authDomain: "vortex-69398.firebaseapp.com",
    projectId: "vortex-69398",
    storageBucket: "vortex-69398.appspot.com",
    messagingSenderId: "526864135908",
    appId: "1:526864135908:web:48d4029a83b417f5395ef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ürün ekleme
window.addProduct = async function() {
    const name = document.getElementById("prodName")?.value.trim();
    const img = document.getElementById("prodImg")?.value.trim();
    const link = document.getElementById("prodLink")?.value.trim();
    if(!name || !img || !link){ alert("Tüm alanları doldur!"); return; }
    const colRef = collection(db,"products");
    const snapshot = await getDocs(colRef);
    if(snapshot.size >= 10){ alert("Maksimum 10 ürün!"); return; }
    await addDoc(colRef,{name,img,link});
    document.getElementById("prodName").value="";
    document.getElementById("prodImg").value="";
    document.getElementById("prodLink").value="";
    document.getElementById("output").textContent = `"${name}" eklendi!`;
}

// Admin ürünleri
async function renderAdminProducts(){
    const container = document.getElementById("adminProducts");
    if(!container) return;
    const colRef = collection(db,"products");
    onSnapshot(colRef,(snapshot)=>{
        container.innerHTML="";
        snapshot.forEach(docSnap=>{
            const p = docSnap.data();
            container.innerHTML += `
            <div class="product">
                <img src="${p.img}" alt="${p.name}">
                <h3 class="neon-text">${p.name}</h3>
                <a href="${p.link}" target="_blank" class="button">Satın Al</a>
                <button onclick="deleteProduct('${docSnap.id}')" style="margin-top:5px;background:#e74c3c;">Sil</button>
            </div>`;
        });
    });
}

// Guest ürünleri
async function renderGuestProducts(){
    const container = document.getElementById("guestProducts");
    if(!container) return;
    const colRef = collection(db,"products");
    onSnapshot(colRef,(snapshot)=>{
        container.innerHTML="";
        snapshot.forEach(docSnap=>{
            const p = docSnap.data();
            container.innerHTML += `
            <div class="product">
                <a href="${p.link}" target="_blank">
                    <img src="${p.img}" alt="${p.name}">
                </a>
                <h3 class="neon-text">${p.name}</h3>
                <a href="${p.link}" target="_blank" class="button">Satın Al</a>
            </div>`;
        });
    });
}

window.deleteProduct = async function(id){
    const docRef = doc(db,"products",id);
    await deleteDoc(docRef);
}

renderAdminProducts();
renderGuestProducts();
