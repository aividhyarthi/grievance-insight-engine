/* ═══════════════════════════════════════════════════════════
   app.js
   Main application controller — screen flow, scanning,
   results rendering.
═══════════════════════════════════════════════════════════ */

/* ── App state ──────────────────────────────────────────── */
const state = {
  language: 'English',   // selected language code (matches keys in UI / LANGUAGES)
};

/* ── DOM refs ────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const screens = {
  language: $('screen-language'),
  scanner:  $('screen-scanner'),
  loading:  $('screen-loading'),
  results:  $('screen-results'),
};

/* ── Camera ──────────────────────────────────────────────── */
const camera = new CameraManager($('cam-video'), $('cam-canvas'));

/* ══════════════════════════════════════════════════════════
   Screen transitions
══════════════════════════════════════════════════════════ */
function show(screenKey) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenKey].classList.add('active');
}

/* ══════════════════════════════════════════════════════════
   Toast (error notifications)
══════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const toast = $('toast');
  $('toast-msg').textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4500);
}

/* ══════════════════════════════════════════════════════════
   SCREEN 1 — Language Selection
══════════════════════════════════════════════════════════ */
function buildLanguageGrid() {
  const grid = $('lang-grid');
  grid.innerHTML = '';

  LANGUAGES.forEach(lang => {
    const card = document.createElement('button');
    card.className = 'lang-card';
    card.setAttribute('aria-label', `Select ${lang.name}`);
    card.innerHTML = `
      <span class="lang-native">${lang.nativeName}</span>
      <span class="lang-en">${lang.name}</span>
    `;
    card.addEventListener('click', () => onLanguageSelected(lang.code));
    grid.appendChild(card);
  });
}

async function onLanguageSelected(langCode) {
  state.language = langCode;

  // Update scanner topbar badge with native name
  const langObj = LANGUAGES.find(l => l.code === langCode);
  $('topbar-lang').textContent = langObj ? langObj.nativeName : langCode;

  // Update scan tip text
  $('scan-tip').textContent = getUI(langCode).scanTip;

  // Show scanner screen first, then start camera
  show('scanner');
  const ok = await camera.start();
  if (!ok) {
    showToast(getUI(langCode).errCamera);
    show('language');
  }
}

/* ══════════════════════════════════════════════════════════
   SCREEN 2 — Scanner controls
══════════════════════════════════════════════════════════ */

// Back to language selection
$('btn-change-lang').addEventListener('click', () => {
  camera.stop();
  show('language');
});

// Flip front/rear camera
$('btn-flip').addEventListener('click', async () => {
  const ok = await camera.flip();
  if (!ok) showToast(getUI(state.language).errCamera);
});

// Shutter — capture + analyze
$('btn-scan').addEventListener('click', handleScan);

/* ══════════════════════════════════════════════════════════
   Scan & Analyze
══════════════════════════════════════════════════════════ */
async function handleScan() {
  const ui = getUI(state.language);

  // Capture image from camera
  const imageBase64 = camera.capture();
  camera.stop();

  // Show loading screen
  $('loading-main').textContent = ui.analyzing;
  $('loading-sub').textContent  = ui.pleaseWait;
  show('loading');

  try {
    const response = await fetch('/api/analyze', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ imageBase64, language: state.language }),
    });

    const result = await response.json();

    if (result.success && result.data) {
      renderResults(result.data, ui);
    } else {
      const msg = result.error?.includes('API key')
        ? ui.errNoKey
        : ui.errNotFound;
      showToast(msg);
      restartScanner();
    }
  } catch (err) {
    console.error('Analyze error:', err);
    showToast(ui.errAnalyze);
    restartScanner();
  }
}

async function restartScanner() {
  show('scanner');
  await camera.start();
}

/* ══════════════════════════════════════════════════════════
   SCREEN 4 — Results rendering
══════════════════════════════════════════════════════════ */

/**
 * Each entry: { key in data, label key in UI, CSS card class }
 */
const CARD_DEFS = [
  { dataKey: 'use',         uiLabel: 'labelUse',   css: 'card-use'         },
  { dataKey: 'ingredients', uiLabel: 'labelIng',   css: 'card-ingredients' },
  { dataKey: 'dosage',      uiLabel: 'labelDose',  css: 'card-dosage'      },
  { dataKey: 'sideEffects', uiLabel: 'labelSide',  css: 'card-sideEffects' },
  { dataKey: 'warnings',    uiLabel: 'labelWarn',  css: 'card-warnings'    },
  { dataKey: 'storage',     uiLabel: 'labelStore', css: 'card-storage'     },
  { dataKey: 'fdaNote',     uiLabel: 'labelFda',   css: 'card-fda'         },
];

function renderResults(data, ui) {
  // Hero
  $('result-name').textContent = data.name  || '—';
  $('result-type').textContent = data.type  || '';

  // Cards
  const scroll = $('results-scroll');
  scroll.innerHTML = '';

  CARD_DEFS.forEach(({ dataKey, uiLabel, css }) => {
    const value = (data[dataKey] || '').trim();
    if (!value) return;

    const card = document.createElement('div');
    card.className = `info-card ${css}`;
    card.innerHTML = `
      <div class="info-card-label">${ui[uiLabel]}</div>
      <div class="info-card-text">${escapeHtml(value)}</div>
    `;
    scroll.appendChild(card);
  });

  // "Scan again" button at bottom
  const btn = document.createElement('button');
  btn.className = 'btn-scan-again';
  btn.textContent = ui.scanAgain;
  btn.addEventListener('click', () => restartScanner());
  scroll.appendChild(btn);

  // Scroll to top
  scroll.scrollTop = 0;

  show('results');
}

// Results back button (top-left arrow)
$('btn-results-back').addEventListener('click', () => restartScanner());

/* ══════════════════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/\n/g, '<br>');
}

/* ══════════════════════════════════════════════════════════
   Boot
══════════════════════════════════════════════════════════ */
buildLanguageGrid();
show('language');
