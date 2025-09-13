import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

async function renderProducts(){
  const container = document.getElementById('product-list');
  container.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'products'));
  snapshot.forEach(doc=>{
    const data = doc.data();
    const div = document.createElement('div');
    div.className = 'product';
    const a = document.createElement('a');
    a.href = data.link;
    a.target = '_blank';
    const img = document.createElement('img');
    img.src = data.img;
    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = data.name;
    a.appendChild(img);
    div.appendChild(a);
    div.appendChild(name);
    container.appendChild(div);
  });
}
renderProducts();

function updateClock(){
  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const clock = document.getElementById('clock');
  if(clock) clock.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock,1000);
updateClock();
