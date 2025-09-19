// app.js — tek dosya: index.html ve admin.html ile kullanılır
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  updateDoc, doc, deleteDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* --------- firebaseConfig (senin verdiğin) --------- */
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

/* ---------- COMMON UTIL ---------- */
function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

/* ---------- SPARKLE CURSOR ---------- */
(function sparkleCursor(){
  const container = document.getElementById('sparkles-container');
  if(!container) return;
  const pool = [];
  function make(){
    const s = document.createElement('div');
    s.className='sparkle';
    container.appendChild(s);
    pool.push(s);
    return s;
  }
  for(let i=0;i<10;i++) make();
  let idx=0;
  window.addEventListener('mousemove', (e)=>{
    const s = pool[idx++ % pool.length];
    s.style.left = e.clientX + 'px';
    s.style.top  = e.clientY + 'px';
    s.style.opacity = '1';
    s.style.transform = 'translate(-50%,-50%) scale(1)';
    setTimeout(()=>{ s.style.opacity='0'; s.style.transform='translate(-50%,-50%) scale(.6)'; }, 350);
  });
})();

/* ---------- PAGINATION (guest) ---------- */
const PAGE_SIZE = 9;
let currentPage = 1;
let cachedProducts = []; // tüm ürünleri tutacağız

async function fetchAllProducts(){
  const snap = await getDocs(collection(db,'products'));
  const arr = [];
  snap.forEach(d => arr.push({id:d.id, ...d.data()}));
  // en son eklenen üstte olsun:
  arr.sort((a,b)=> (a._ts||0) < (b._ts||0) ? 1:-1);
  cachedProducts = arr;
  renderProductsPage(currentPage);
  updatePageInfo();
}
function totalPages(){ return Math.max(1, Math.ceil(cachedProducts.length / PAGE_SIZE)); }
function updatePageInfo(){
  const info = $('#page-info');
  if(info) info.textContent = `${currentPage} / ${totalPages()}`;
  $('#prev-page')?.setAttribute('disabled', currentPage<=1);
  $('#next-page')?.setAttribute('disabled', currentPage>=totalPages());
}
function renderProductsPage(page){
  const container = $('#product-list');
  if(!container) return;
  container.innerHTML = '';
  const start = (page-1)*PAGE_SIZE;
  const pageItems = cachedProducts.slice(start, start+PAGE_SIZE);
  pageItems.forEach(p => {
    const a = document.createElement('a');
    a.href = p.link || '#';
    a.target = '_blank';
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<div class="neon-border"></div>
      <img src="${p.img}" alt="${escapeHtml(p.name)}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="product-title">${escapeHtml(p.name)}</div>
      <div class="buy"><button class="btn-buy">Satın Al</button></div>
    `;
    a.appendChild(card);
    container.appendChild(a);
  });
}

/* ---------- ADMIN UI ---------- */
const form = $('#product-form');
if(form){
  const nameIn = $('#prod-name');
  const imgIn  = $('#prod-img');
  const linkIn = $('#prod-link');
  const previewImg = $('#preview-img');
  const previewTitle = $('#preview-title');
  // preview update
  [nameIn,imgIn].forEach(i => i?.addEventListener('input', ()=>{
    previewImg.src = imgIn.value || 'https://via.placeholder.com/300x200?text=Preview';
    previewTitle.textContent = nameIn.value || 'Ürün adı burada görünür';
  }));

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = nameIn.value.trim();
    const img = imgIn.value.trim();
    const link = linkIn.value.trim();
    if(!name || !img) return alert('Ad ve görsel gerekli.');
    // ekle
    await addDoc(collection(db,'products'), { name, img, link, _ts: Date.now() });
    nameIn.value = imgIn.value = linkIn.value = '';
    previewImg.src = '';
    renderProductsAdmin(); fetchAllProducts();
  });

  $('#clear-form')?.addEventListener('click', ()=>{
    form.reset();
    $('#preview-img').src='';
    $('#preview-title').textContent='Ürün adı burada görünür';
  });
}

/* ---------- ADMIN: listele/güncelle/sil (live snapshot ile) ---------- */
async function renderProductsAdmin(){
  const container = $('#product-list-admin');
  if(!container) return;
  container.innerHTML = '';
  // snapshot yerine getDocs (basit)
  const snap = await getDocs(collection(db,'products'));
  // sort by timestamp desc
  const arr = [];
  snap.forEach(d => arr.push({id:d.id,...d.data()}));
  arr.sort((a,b)=> (b._ts||0)-(a._ts||0));
  arr.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `<div class="neon-border"></div>
      <img src="${p.img}" alt="${escapeHtml(p.name)}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div style="margin-top:8px;font-weight:700;color:var(--neon)">${escapeHtml(p.name)}</div>
      <div style="margin-top:auto;display:flex;gap:8px;justify-content:center">
        <button class="btn-buy" data-id="${p.id}" data-action="edit">Güncelle</button>
        <button style="background:#e74c3c" data-id="${p.id}" data-action="delete">Sil</button>
      </div>`;
    // actions
    div.querySelector('[data-action="edit"]').addEventListener('click', async ()=>{
      const newName = prompt('Yeni isim:', p.name) || p.name;
      const newImg  = prompt('Yeni görsel URL:', p.img) || p.img;
      const newLink = prompt('Yeni link:', p.link) || p.link;
      await updateDoc(doc(db,'products',p.id), { name:newName, img:newImg, link:newLink });
      renderProductsAdmin(); fetchAllProducts();
    });
    div.querySelector('[data-action="delete"]').addEventListener('click', async ()=>{
      if(!confirm('Silinsin mi?')) return;
      await deleteDoc(doc(db,'products',p.id));
      renderProductsAdmin(); fetchAllProducts();
    });
    container.appendChild(div);
  });
}

/* ---------- HELPERS ---------- */
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/* ---------- PAGE CONTROLS ---------- */
$('#prev-page')?.addEventListener('click', ()=>{
  if(currentPage>1) currentPage--, renderProductsPage(currentPage), updatePageInfo();
});
$('#next-page')?.addEventListener('click', ()=>{
  if(currentPage<totalPages()) currentPage++, renderProductsPage(currentPage), updatePageInfo();
});

/* ---------- initial fetch ---------- */
fetchAllProducts();
renderProductsAdmin();

/* ---------- video autoplay safety ---------- */
const video = document.getElementById('bg-video');
if(video){
  video.muted = true;
  video.play().catch(()=>{ /* ignore autoplay block */ });
}
