// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const appRoot = document.getElementById("bcr-toernooi-app");

// --- UI STRUCTUUR ---
appRoot.innerHTML = `
  <div id="feedback-container"></div>
  <div class="tabs">
    <div class="tab active" data-tab="algemeen">Algemeen</div>
    <div class="tab" data-tab="instellingen">Instellingen</div>
  </div>

  <div id="algemeen" class="tab-content active">
    <label>Naam toernooi</label>
    <input type="text" id="toernooiNaam">

    <label>Jaar</label>
    <input type="number" id="toernooiJaar" min="1900" max="2099">

    <label>Organisatie</label>
    <textarea id="toernooiOrganisatie"></textarea>

    <button id="opslaan">Opslaan</button>
  </div>

  <div id="instellingen" class="tab-content">
    <label>Max beurten</label>
    <input type="number" id="maxBeurten" class="small" min="0" max="999">

    <label>Max punten</label>
    <input type="number" id="maxPunten" class="small" min="0" max="999">

    <button id="nietVanToepassing">Niet van toepassing</button>
  </div>
`;

// --- Tabs ---
const tabs = appRoot.querySelectorAll(".tab");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.tab;
    appRoot.querySelectorAll(".tab-content").forEach(c => {
      c.classList.remove("active");
    });
    document.getElementById(target).classList.add("active");
  });
});

// --- Feedback ---
function showFeedback(msg, type = "success") {
  const container = document.getElementById("feedback-container");
  const div = document.createElement("div");
  div.className = `feedback ${type === "error" ? "error" : ""}`;
  div.innerHTML = `
    <span>${msg}</span>
    <span class="close">&times;</span>
  `;
  container.appendChild(div);
  div.querySelector(".close").addEventListener("click", () => div.remove());
}

// --- Validatie ---
function validateFields() {
  const jaar = document.getElementById("toernooiJaar").value;
  if (jaar && (jaar < 1900 || jaar > 2099)) {
    showFeedback("Jaar moet tussen 1900 en 2099 liggen.", "error");
    return false;
  }
  const beurten = document.getElementById("maxBeurten").value;
  const punten = document.getElementById("maxPunten").value;
  if (beurten > 999 || punten > 999) {
    showFeedback("Max beurten/punten mogen niet groter zijn dan 999.", "error");
    return false;
  }
  return true;
}

// --- Opslaan in Firestore ---
async function saveToernooi() {
  if (!validateFields()) return;

  const data = {
    naam: document.getElementById("toernooiNaam").value.trim(),
    jaar: document.getElementById("toernooiJaar").value.trim(),
    organisatie: document.getElementById("toernooiOrganisatie").value.trim(),
    maxBeurten: document.getElementById("maxBeurten").value.trim(),
    maxPunten: document.getElementById("maxPunten").value.trim(),
    laatstGewijzigd: new Date().toISOString()
  };

  if (!data.naam) {
    showFeedback("Vul een toernooinaam in.", "error");
    return;
  }

  try {
    const docRef = doc(db, "toernooien", data.naam);
    await setDoc(docRef, data);
    localStorage.setItem("laatsteToernooi", data.naam);
    showFeedback("Toernooi opgeslagen.");
  } catch (err) {
    showFeedback("Fout bij opslaan: " + err.message, "error");
  }
}

document.getElementById("opslaan").addEventListener("click", saveToernooi);

// --- Niet van toepassing ---
document.getElementById("nietVanToepassing").addEventListener("click", () => {
  document.getElementById("maxBeurten").value = "";
  document.getElementById("maxPunten").value = "";
  document.getElementById("maxBeurten").classList.add("readonly");
  document.getElementById("maxPunten").classList.add("readonly");
});

// --- Laden van laatst opgeslagen toernooi ---
async function loadLastToernooi() {
  const last = localStorage.getItem("laatsteToernooi");
  if (!last) return;
  const docRef = doc(db, "toernooien", last);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("toernooiNaam").value = data.naam;
    document.getElementById("toernooiJaar").value = data.jaar;
    document.getElementById("toernooiOrganisatie").value = data.organisatie;
    document.getElementById("maxBeurten").value = data.maxBeurten;
    document.getElementById("maxPunten").value = data.maxPunten;
    showFeedback(`Laatst opgeslagen toernooi geladen: ${data.naam}`);
  }
}

loadLastToernooi();
