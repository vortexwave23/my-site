import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// ----------------- Admin panel -----------------
const form = document.getElementById("product-form");
if(form){
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
}

async function renderProductsAdmin(){
  const container = document.getElementById("product-list-admin");
  if(!container) return;
  container.innerHTML="";
  const querySnapshot = await getDocs(collection(db,"products"));
  querySnapshot.forEach(docSnap=>{
    const p = docSnap.data();
    const div = document.createElement("div");
    div.style.marginBottom="10px";

    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.name;
    img.style.width="100px";

    const name = document.createElement("span");
    name.textContent = p.name + " ";

    // Silme butonu
    const delBtn = document.createElement("button");
    delBtn.textContent = "Sil";
    delBtn.addEventListener("click", async ()=>{
      await deleteDoc(doc(db,"products",docSnap.id));
      renderProductsAdmin();
    });

    // Güncelleme butonu
    const editBtn = document.createElement("button");
    editBtn.textContent = "Güncelle";
    editBtn.addEventListener("click", async ()=>{
      const newName = prompt("Yeni ürün adı:", p.name) || p.name;
      const newImg = prompt("Yeni resim linki:", p.img) || p.img;
      const newLink = prompt("Yeni ürün linki:", p.link) || p.link;
      await updateDoc(doc(db,"products",docSnap.id),{
        name:newName,
        img:newImg,
        link:newLink
      });
      renderProductsAdmin();
    });

    div.appendChild(img);
    div.appendChild(name);
    div.appendChild(delBtn);
    div.appendChild(editBtn);
    container.appendChild(div);
  });
}
renderProductsAdmin();

// ----------------- Guest panel -----------------
// renderProductsGuest(); 
// artık sayfa açılır açılmaz çalışacak
renderProductsGuest();

// ----------------- Saat -----------------
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const clock = document.getElementById("clock");
  if(clock) clock.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock,1000);
updateClock();

// ----------------- Scroll animasyon -----------------
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

// ----------------- Video ses açma -----------------
const video = document.getElementById('bg-video');
if(video){
  video.muted = true; 
  video.play().catch(()=>{});

  // Ses butonu oluştur
  const soundBtn = document.createElement('button');
  soundBtn.textContent = "Ses Aç";
  soundBtn.id = "sound-btn";
  document.body.appendChild(soundBtn);

  soundBtn.addEventListener('click', () => {
    video.muted = false;
    video.play();
    soundBtn.style.display = 'none';
  });
}
