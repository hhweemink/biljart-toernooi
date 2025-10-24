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

    // Tab functionaliteit
    document.querySelectorAll('#bcr-toernooi-app .tab-buttons button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#bcr-toernooi-app .tab-buttons button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#bcr-toernooi-app .tab-content').forEach(tc => tc.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    // Niet van toepassing checkbox
    const noMax = document.getElementById('noMaxTurns');
    const maxInputs = ['pointsWinMax','pointsDrawMax','pointsLoseMax','maxTurns'].map(id => document.getElementById(id));

    noMax.addEventListener('change', () => {
      const disabled = noMax.checked;
      maxInputs.forEach(i => {
        i.disabled = disabled;
        i.style.backgroundColor = disabled ? '#eee' : '';
      });
    });


// Validatie numerieke velden
document.querySelectorAll('#bcr-toernooi-app input[type="number"]').forEach(inp => {

  // Alleen check bij verlaten veld (blur)
  inp.addEventListener('blur', () => {
    const id = inp.id;
    const val = parseInt(inp.value);

    if (id === "tournamentYear") {
      // Jaar: 1900–2099
      if (!val) return;
      if (val > 2099) inp.value = 2099;
      if (val < 1900) inp.value = 1900;
    } else {
      // Andere velden: 0–999
      if (!val && val !== 0) return;
      if (val > 999) inp.value = 999;
      if (val < 0) inp.value = 0;
    }
  });

  // Voor de overige velden blijft realtime maxlengte van 3 handig
  if (inp.id !== "tournamentYear") {
    inp.addEventListener('input', () => {
      if (inp.value.length > 3) inp.value = inp.value.slice(0, 3);
    });
  }
});



    // Feedback melding
    function showFeedback(msg) {
      const fb = document.getElementById('feedback');
      fb.innerHTML = `<div class="message">${msg}<span class="close" onclick="this.parentElement.remove()">×</span></div>`;
    }

    document.getElementById('tournamentForm').addEventListener('submit', async e => {
      e.preventDefault();
      showFeedback("Opslaan...");
    });
