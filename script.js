// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const root = document.getElementById("bcr-toernooi-app");

root.innerHTML = `
  <header>Biljarttoernooi Beheer</header>
  <div class="banner" id="banner">Geen toernooi geselecteerd</div>

  <div class="tabs">
    <button class="tab active" data-tab="toernooi">Toernooi</button>
    <button class="tab" data-tab="spelers">Spelers</button>
    <button class="tab" data-tab="finale">Finale</button>
  </div>

  <div id="toernooi" class="tab-content active">
    <form id="formToernooi">
      <label>Naam toernooi *</label>
      <input type="text" id="naam" required>

      <label>Jaar *</label>
      <input type="number" id="jaar" min="1900" max="2099" required>

      <label>Organisatie</label>
      <textarea id="organisatie" rows="3" placeholder="Namen van organisatoren..."></textarea>

      <label>Max beurten</label>
      <input type="number" id="maxBeurten" min="0" max="999">

      <div class="button-row">
        <button type="button" id="opslaan">Opslaan</button>
        <button type="button" id="laden">Laden</button>
        <button type="button" id="verwijderen">Verwijderen</button>
      </div>
      <div id="feedback"></div>
    </form>
  </div>
`;

root.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    root.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    root.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

function showFeedback(msg, type='success') {
  const fb = document.getElementById('feedback');
  fb.innerHTML = `<div class="feedback ${type === 'error' ? 'error' : ''}">${msg}<span class="close">×</span></div>`;
  fb.querySelector('.close').addEventListener('click', () => fb.innerHTML = '');
}

async function opslaan() {
  const naam = document.getElementById('naam').value.trim();
  const jaar = document.getElementById('jaar').value.trim();
  if (!naam || !jaar) {
    showFeedback('Naam en jaar zijn verplicht.', 'error');
    return;
  }
  const docRef = await addDoc(collection(db, 'toernooien'), {
    naam, jaar,
    organisatie: document.getElementById('organisatie').value,
    maxBeurten: document.getElementById('maxBeurten').value,
    aangemaaktOp: new Date()
  });
  localStorage.setItem('laatsteToernooi', docRef.id);
  document.getElementById('banner').textContent = `Actief toernooi: ${naam} (${jaar})`;
  showFeedback('Toernooi opgeslagen.');
}

async function laden() {
  const q = query(collection(db, 'toernooien'), orderBy('aangemaaktOp', 'desc'));
  const snap = await getDocs(q);
  if (snap.empty) {
    showFeedback('Geen toernooien gevonden.', 'error');
    return;
  }
  const docSnap = snap.docs[0];
  const d = docSnap.data();
  document.getElementById('naam').value = d.naam;
  document.getElementById('jaar').value = d.jaar;
  document.getElementById('organisatie').value = d.organisatie;
  document.getElementById('maxBeurten').value = d.maxBeurten;
  document.getElementById('banner').textContent = `Actief toernooi: ${d.naam} (${d.jaar})`;
  localStorage.setItem('laatsteToernooi', docSnap.id);
  showFeedback(`Toernooi '${d.naam}' geladen.`);
}

async function verwijderen() {
  if (!confirm('Weet je zeker dat je dit toernooi wilt verwijderen?')) return;
  const q = await getDocs(collection(db, 'toernooien'));
  for (const d of q.docs) {
    await deleteDoc(doc(db, 'toernooien', d.id));
  }
  showFeedback('Alle toernooien verwijderd.');
  document.getElementById('banner').textContent = 'Geen toernooi geselecteerd';
}

document.getElementById('opslaan').addEventListener('click', opslaan);
document.getElementById('laden').addEventListener('click', laden);
document.getElementById('verwijderen').addEventListener('click', verwijderen);
