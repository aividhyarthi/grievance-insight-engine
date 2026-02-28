/* ═══════════════════════════════════════════════════════════
   app.js
   Main application controller — screen flow, scanning,
   results rendering.
═══════════════════════════════════════════════════════════ */

/* ── App state ──────────────────────────────────────────── */
const state = {
  language:    'English',   // selected language code (matches keys in UI / LANGUAGES)
  currentData: null,        // last scan result, used for audio playback
  isSpeaking:  false,
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
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 6000);
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
      const serverError = result.error || '';
      console.error('Analyze API error:', serverError);
      const msg = serverError.includes('API key') || serverError.includes('ANTHROPIC')
        ? ui.errNoKey
        : (serverError || ui.errNotFound);
      showToast(msg);
      setTimeout(restartScanner, 3500);
    }
  } catch (err) {
    console.error('Analyze fetch error:', err);
    showToast(ui.errAnalyze);
    setTimeout(restartScanner, 3500);
  }
}

async function restartScanner() {
  stopSpeaking();
  show('scanner');
  await camera.start();
}

/* ══════════════════════════════════════════════════════════
   Audio — Text-to-Speech
══════════════════════════════════════════════════════════ */
function speakResults() {
  if (!('speechSynthesis' in window)) {
    showToast('Text-to-speech is not supported on this device.');
    return;
  }

  if (state.isSpeaking) {
    stopSpeaking();
    return;
  }

  const data    = state.currentData;
  const ui      = getUI(state.language);
  const langObj = LANGUAGES.find(l => l.code === state.language);
  const bcp47   = langObj?.speechLang || 'en-IN';

  // Build a natural spoken summary from available fields
  const parts = [
    data.name,
    data.type,
    data.use        && `${ui.labelUse}: ${data.use}`,
    data.dosage     && `${ui.labelDose}: ${data.dosage}`,
    data.sideEffects && `${ui.labelSide}: ${data.sideEffects}`,
    data.warnings   && `${ui.labelWarn}: ${data.warnings}`,
    data.storage    && `${ui.labelStore}: ${data.storage}`,
  ].filter(Boolean).join('. ');

  const utterance  = new SpeechSynthesisUtterance(parts);
  utterance.lang   = bcp47;
  utterance.rate   = 0.88;
  utterance.pitch  = 1;

  utterance.onstart = () => {
    state.isSpeaking = true;
    setListenBtnState(true);
  };
  utterance.onend = utterance.onerror = () => {
    state.isSpeaking = false;
    setListenBtnState(false);
  };

  window.speechSynthesis.cancel(); // clear any queued speech
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  state.isSpeaking = false;
  setListenBtnState(false);
}

function setListenBtnState(speaking) {
  const btn      = $('btn-listen');
  const iconPlay = $('icon-listen');
  const iconStop = $('icon-stop');
  if (!btn) return;
  const ui = getUI(state.language);
  if (speaking) {
    btn.classList.add('listening');
    btn.setAttribute('aria-label', ui.stop);
    iconPlay.style.display = 'none';
    iconStop.style.display = '';
  } else {
    btn.classList.remove('listening');
    btn.setAttribute('aria-label', ui.listen);
    iconPlay.style.display = '';
    iconStop.style.display = 'none';
  }
}

$('btn-listen').addEventListener('click', speakResults);

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
  state.currentData = data;
  stopSpeaking();
  setListenBtnState(false);

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
$('btn-results-back').addEventListener('click', () => { stopSpeaking(); restartScanner(); });

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
