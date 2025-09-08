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

// Şifre kontrol
const loginForm = document.getElementById("login-form");
const loginArea = document.getElementById("login-area");
const adminArea = document.getElementById("admin-area");

const ADMIN_PASSWORD = "1234"; // burayı istediğin gibi değiştir

loginForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const pass = document.getElementById("password").value;
  if(pass === ADMIN_PASSWORD){
    loginArea.style.display="none";
    adminArea.style.display="block";
    renderProductsAdmin();
  }else{
    alert("Yanlış şifre!");
  }
});

// Ürün ekleme
const form = document.getElementById("product-form");
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name = document.getElementById("prod-name").value;
  const img = document.getElementById("prod-img").value;
  const link = document.getElementById("prod-link").value;

  await addDoc(collection(db,"products"),{name,img,link});
  alert("Ürün eklendi!");
  form.reset();
  renderProductsAdmin();
});

// Ürün listeleme + silme
async function renderProductsAdmin(){
  const container = document.getElementById("product-list-admin");
  container.innerHTML="";
  const querySnapshot = await getDocs(collection(db,"products"));
  querySnapshot.forEach(d=>{
    const p = d.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${p.name}</p>
      <img src="${p.img}" alt="${p.name}" width="100">
      <a href="${p.link}" target="_blank">Git</a>
      <button data-id="${d.id}">Sil</button>
    `;
    div.querySelector("button").addEventListener("click", async ()=>{
      await deleteDoc(doc(db,"products",d.id));
      renderProductsAdmin();
    });
    container.appendChild(div);
  });
}
