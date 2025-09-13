// app.js — guest + admin shared logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ---------- CONFIG (senin verdiğin) ---------- */
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

/* HELPERS */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const escapeHtml = s => String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- SPARKLE CURSOR ---------- */
(function sparkleCursor(){
  const container = document.getElementById('sparkles-container');
  if(!container) return;
  const pool = [];
  for(let i=0;i<12;i++){
    const el = document.createElement('div');
    el.className = 'sparkle';
    container.appendChild(el);
    pool.push(el);
  }
  let idx = 0;
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
let cachedProducts = [];

async function fetchAllProducts(){
  const snap = await getDocs(collection(db,'products'));
  const arr = [];
  snap.forEach(d => arr.push({ id:d.id, ...d.data() }));
  // sort by _ts if exists
  arr.sort((a,b)=> (b._ts||0) - (a._ts||0));
  cachedProducts = arr;
  renderProductsPage(currentPage);
  updatePageInfo();
}

function totalPages(){ return Math.max(1, Math.ceil(cachedProducts.length / PAGE_SIZE)); }
function updatePageInfo(){
  const info = $('#page-info');
  if(info) info.textContent = `${currentPage} / ${totalPages()}`;
  const p = $('#prev-page'), n = $('#next-page');
  if(p) p.disabled = currentPage<=1;
  if(n) n.disabled = currentPage>=totalPages();
}

function renderProductsPage(page){
  const container = $('#product-list');
  if(!container) return;
  container.innerHTML = '';
  const start = (page-1)*PAGE_SIZE;
  const items = cachedProducts.slice(start, start+PAGE_SIZE);
  items.forEach(p=>{
    const a = document.createElement('a');
    a.href = p.link || '#';
    a.target = '_blank';
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<div class="neon-border"></div>
      <div class="img-wrap"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'"></div>
      <div class="product-title">${escapeHtml(p.name)}</div>
      <div class="buy"><button class="btn-buy">Satın Al</button></div>`;
    a.appendChild(card);
    container.appendChild(a);
  });
}

/* pagination buttons */
$('#prev-page')?.addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderProductsPage(currentPage); updatePageInfo(); }});
$('#next-page')?.addEventListener('click', ()=>{ if(currentPage<totalPages()){ currentPage++; renderProductsPage(currentPage); updatePageInfo(); }});

/* ---------- ADMIN: protect route (simple sessionStorage) ---------- */
if(location.pathname.endsWith('admin.html')){
  if(sessionStorage.getItem('vortex_is_admin') !== '1'){
    // not logged in
    location.href = 'admin-login.html';
  }
}

/* ---------- ADMIN: add/update/delete + UI ---------- */
const form = $('#product-form');
if(form){
  const nameIn = $('#prod-name');
  const imgIn  = $('#prod-img');
  const linkIn = $('#prod-link');
  const previewImg = $('#preview-img');
  const previewTitle = $('#preview-title');
  // preview
  [nameIn,imgIn].forEach(i=> i?.addEventListener('input', ()=>{
    previewImg.src = imgIn.value || 'https://via.placeholder.com/300x400?text=Preview';
    previewTitle.textContent = nameIn.value || 'Ürün adı burada görünür';
  }));

  // add
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = nameIn.value.trim();
    const img  = imgIn.value.trim();
    const link = linkIn.value.trim();
    if(!name || !img) return alert('Ürün adı ve görsel gerekli.');
    await addDoc(collection(db,'products'),{ name, img, link, _ts: Date.now() });
    nameIn.value = imgIn.value = linkIn.value = '';
    previewImg.src='';
    fetchAllProducts(); renderProductsAdmin();
  });

  $('#clear-form')?.addEventListener('click', ()=>{ form.reset(); previewImg.src=''; previewTitle.textContent='Ürün adı burada görünür'; });
}

/* modal helpers (in-page confirmations) */
const modal = $('#modal');
const modalTitle = $('#modal-title');
const modalText = $('#modal-text');
const modalCancel = $('#modal-cancel');
const modalConfirm = $('#modal-confirm');

let modalResolve = null;
function showModal(title, text){
  modalTitle.textContent = title; modalText.textContent = text;
  modal.setAttribute('aria-hidden','false');
  return new Promise(res=>{
    modalResolve = res;
  });
}
modalCancel?.addEventListener('click', ()=>{ modal.setAttribute('aria-hidden','true'); modalResolve && modalResolve(false); });
modalConfirm?.addEventListener('click', ()=>{ modal.setAttribute('aria-hidden','true'); modalResolve && modalResolve(true); });

/* render admin products with edit/delete (uses modal) */
async function renderProductsAdmin(){
  const container = $('#product-list-admin');
  if(!container) return;
  container.innerHTML = '';
  const snap = await getDocs(collection(db,'products'));
  const arr = [];
  snap.forEach(d => arr.push({ id:d.id, ...d.data() }));
  arr.sort((a,b)=> (b._ts||0)-(a._ts||0));
  arr.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `<div class="neon-border"></div>
      <div class="img-wrap"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'"></div>
      <div style="margin-top:10px;font-weight:700;color:var(--neon)">${escapeHtml(p.name)}</div>
      <div style="margin-top:auto;display:flex;gap:8px;justify-content:center;margin-bottom:6px">
        <button class="btn-buy" data-id="${p.id}" data-action="edit">Güncelle</button>
        <button style="background:#e74c3c" data-id="${p.id}" data-action="delete">Sil</button>
      </div>`;
    // attach events
    div.querySelector('[data-action="edit"]').addEventListener('click', async ()=>{
      const newName = prompt('Yeni isim:', p.name) || p.name;
      const newImg  = prompt('Yeni görsel URL:', p.img) || p.img;
      const newLink = prompt('Yeni link (boş bırakılabilir):', p.link) || p.link;
      const ok = await showModal('Güncelleme Onayı', 'Bu ürünü güncellemek istediğinize emin misiniz?');
      if(!ok) return;
      await updateDoc(doc(db,'products',p.id), { name:newName, img:newImg, link:newLink });
      fetchAllProducts(); renderProductsAdmin();
    });
    div.querySelector('[data-action="delete"]').addEventListener('click', async ()=>{
      const ok = await showModal('Silme Onayı', 'Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
      if(!ok) return;
      await deleteDoc(doc(db,'products',p.id));
      fetchAllProducts(); renderProductsAdmin();
    });

    container.appendChild(div);
  });
}

/* logout link */
$('#logout-btn')?.addEventListener('click', (e)=>{
  e.preventDefault();
  sessionStorage.removeItem('vortex_is_admin');
  location.href = 'admin-login.html';
});

/* ---------- initial fetches ---------- */
fetchAllProducts();
renderProductsAdmin();

/* ---------- video autoplay fallback ---------- */
const video = $('#bg-video');
if(video){ video.muted = true; video.play().catch(()=>{/* ignore autoplay block */}); }
