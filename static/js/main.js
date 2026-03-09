/* ── PostCraft by Rudra Kasturi Inc. — frontend logic ───────────────────── */

'use strict';

// ── element refs ──────────────────────────────────────────────────────────────
const dropZone    = document.getElementById('drop-zone');
const imageInput  = document.getElementById('image-input');
const imgPreview  = document.getElementById('img-preview');
const dzContent   = document.getElementById('dz-content');
const dzChange    = document.getElementById('dz-change');
const dzChangeBtm = document.getElementById('dz-change-btn');
const dzBrowse    = document.getElementById('dz-browse');

const productName = document.getElementById('product_name');
const brandName   = document.getElementById('brand_name');
const tagline     = document.getElementById('tagline');
const description = document.getElementById('description');
const cta         = document.getElementById('cta');
const apiKeyInput = document.getElementById('api_key');
const toggleKey   = document.getElementById('toggle-key');

const creativeDir = document.getElementById('creative_direction');
const postTypeHid = document.getElementById('post_type');
const styleHid    = document.getElementById('style');
const platformSel = document.getElementById('platform');

const generateBtn  = document.getElementById('generate-btn');
const btnIdle      = document.getElementById('btn-idle');
const btnLoading   = document.getElementById('btn-loading');
const errorMsg     = document.getElementById('error-msg');

const emptyState   = document.getElementById('empty-state');
const resultsWrap  = document.getElementById('results-wrap');
const imageGallery = document.getElementById('image-gallery');
const dlZipBtn     = document.getElementById('download-zip-btn');

const outTitle    = document.getElementById('out-title');
const outCaption  = document.getElementById('out-caption');
const outHashtags = document.getElementById('out-hashtags');
const outFeatures = document.getElementById('out-features');
const featCard    = document.getElementById('features-card');

const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lb-img');
const lbDl      = document.getElementById('lb-download');
const lbClose   = document.getElementById('lb-close');
const lbBack    = document.getElementById('lb-backdrop');

let currentSessionId  = null;
let uploadedFile      = null;
let referenceFile     = null;

// ── reference image picker ────────────────────────────────────────────────────
const refDropZone    = document.getElementById('ref-drop-zone');
const refImageInput  = document.getElementById('ref-image-input');
const refDzContent   = document.getElementById('ref-dz-content');
const refPreviewWrap = document.getElementById('ref-preview-wrap');
const refImgPreview  = document.getElementById('ref-img-preview');
const refClearBtn    = document.getElementById('ref-clear-btn');
const refStatus      = document.getElementById('ref-status');
const refDzBrowse    = document.getElementById('ref-dz-browse');

refDropZone.addEventListener('click', (e) => {
  if (e.target === refClearBtn) return;
  refImageInput.click();
});
refDzBrowse.addEventListener('click', () => refImageInput.click());
refImageInput.addEventListener('change', () => {
  if (refImageInput.files[0]) handleRefFile(refImageInput.files[0]);
});
refDropZone.addEventListener('dragover', (e) => {
  e.preventDefault(); refDropZone.classList.add('drag-over');
});
refDropZone.addEventListener('dragleave', () => refDropZone.classList.remove('drag-over'));
refDropZone.addEventListener('drop', (e) => {
  e.preventDefault(); refDropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) handleRefFile(f);
});
refClearBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  referenceFile = null;
  refImageInput.value = '';
  refImgPreview.src = '';
  refPreviewWrap.classList.add('hidden');
  refDzContent.classList.remove('hidden');
  refStatus.classList.add('hidden');
});

function handleRefFile(file) {
  referenceFile = file;
  refImgPreview.src = URL.createObjectURL(file);
  refDzContent.classList.add('hidden');
  refPreviewWrap.classList.remove('hidden');
  refStatus.textContent = '✓ Reference image ready — AI will analyse its style on generate';
  refStatus.className = 'ref-status success';
  refStatus.classList.remove('hidden');
}

// ── drag-and-drop / file input ────────────────────────────────────────────────
dropZone.addEventListener('click', (e) => {
  if (e.target === dzChangeBtm) return;
  imageInput.click();
});
dzBrowse.addEventListener('click', () => imageInput.click());
dzChangeBtm.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', () => {
  if (imageInput.files[0]) handleFile(imageInput.files[0]);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) handleFile(f);
});

function handleFile(file) {
  uploadedFile = file;
  const url    = URL.createObjectURL(file);
  imgPreview.src = url;
  imgPreview.classList.remove('hidden');
  dzContent.classList.add('hidden');
  dzChange.classList.remove('hidden');
  checkReady();
}

// ── form validation → enable generate button ──────────────────────────────────
productName.addEventListener('input', checkReady);

function checkReady() {
  generateBtn.disabled = !productName.value.trim();
}

// ── post type toggle ──────────────────────────────────────────────────────────
document.getElementById('post-type-group').addEventListener('click', (e) => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn) return;
  document.querySelectorAll('#post-type-group .toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  postTypeHid.value = btn.dataset.value;
});

// ── style selection ───────────────────────────────────────────────────────────
document.getElementById('style-group').addEventListener('click', (e) => {
  const btn = e.target.closest('.style-btn');
  if (!btn) return;
  document.querySelectorAll('#style-group .style-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  styleHid.value = btn.dataset.value;
});

// ── show / hide API key ───────────────────────────────────────────────────────
toggleKey.addEventListener('click', () => {
  const isPass = apiKeyInput.type === 'password';
  apiKeyInput.type = isPass ? 'text' : 'password';
  toggleKey.textContent = isPass ? 'Hide' : 'Show';
});

// ── GENERATE ──────────────────────────────────────────────────────────────────
generateBtn.addEventListener('click', generate);

async function generate() {
  if (!productName.value.trim()) return;

  setLoading(true);
  hideError();

  const fd = new FormData();
  if (uploadedFile) fd.append('image', uploadedFile);
  fd.append('product_name', productName.value.trim());
  fd.append('brand_name',   brandName.value.trim());
  fd.append('tagline',      tagline.value.trim());
  fd.append('description',  description.value.trim());
  fd.append('cta',                cta.value.trim() || 'Shop Now');
  fd.append('creative_direction', creativeDir.value.trim());
  fd.append('post_type',          postTypeHid.value);
  fd.append('platform',     platformSel.value);
  fd.append('style',        styleHid.value);
  fd.append('api_key',      apiKeyInput.value.trim());
  if (referenceFile) fd.append('reference_image', referenceFile);

  try {
    const res  = await fetch('/generate', { method: 'POST', body: fd });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!res.ok) {
      showError(data.error || text || 'Something went wrong. Please try again.');
      return;
    }

    currentSessionId = data.session_id;
    renderResults(data);
  } catch (err) {
    showError('Could not reach the server — please try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
}

// ── render results ────────────────────────────────────────────────────────────
function renderResults(data) {
  // show panel
  emptyState.classList.add('hidden');
  resultsWrap.classList.remove('hidden');

  // zip download
  dlZipBtn.style.display = '';
  dlZipBtn.onclick = () => window.location = `/download/${data.session_id}`;

  // platform → aspect class
  const platform = platformSel.value;
  const aspectCls = {
    instagram_portrait: 'tall',
    instagram_story:    'story',
    facebook:           'wide',
    youtube:            'wide',
    twitter:            'wide',
  }[platform] || '';

  // gallery
  imageGallery.innerHTML = '';
  data.images.forEach((fname, idx) => {
    const url     = `/outputs/${data.session_id}/${fname}`;
    const label   = fname.replace('.jpg', '').replace(/_/g, ' ');

    const item = document.createElement('div');
    item.className = `gallery-item ${aspectCls}`;

    const img = document.createElement('img');
    img.src   = url;
    img.alt   = label;
    img.addEventListener('click', () => openLightbox(url, fname));

    const footer = document.createElement('div');
    footer.className = 'gallery-footer';

    const name = document.createElement('span');
    name.className = 'gallery-name';
    name.textContent = label;

    const dl = document.createElement('a');
    dl.className = 'gallery-dl';
    dl.href      = url;
    dl.download  = fname;
    dl.textContent = '↓ Save';

    footer.append(name, dl);
    item.append(img, footer);
    imageGallery.appendChild(item);
  });

  // scroll gallery into view
  resultsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // text content
  outTitle.textContent   = data.title   || '—';
  outCaption.textContent = data.caption || '—';
  outHashtags.textContent = data.hashtags && data.hashtags.length
    ? data.hashtags.map(h => '#' + h).join('  ')
    : '—';

  if (data.post_type === 'carousel' || (data.features && data.features.length)) {
    featCard.style.display = '';
    outFeatures.textContent = (data.features || [])
      .map((f, i) => `${i + 1}. ${f}`)
      .join('\n');
  } else {
    featCard.style.display = 'none';
  }
}

// ── lightbox ──────────────────────────────────────────────────────────────────
function openLightbox(url, fname) {
  lbImg.src      = url;
  lbDl.href      = url;
  lbDl.download  = fname;
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
}
lbClose.addEventListener('click', closeLightbox);
lbBack.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ── copy buttons ──────────────────────────────────────────────────────────────
document.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const el   = document.getElementById(btn.dataset.target);
    const text = el.textContent.trim();
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 2000);
    });
  });
});

// ── URL import ────────────────────────────────────────────────────────────────
const urlInput   = document.getElementById('url-input');
const urlLoadBtn = document.getElementById('url-load-btn');
const urlStatus  = document.getElementById('url-status');

urlLoadBtn.addEventListener('click', importFromUrl);
urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') importFromUrl(); });

async function importFromUrl() {
  const url = urlInput.value.trim();
  if (!url) return;

  setUrlStatus('loading', '⏳ Fetching page…');
  urlLoadBtn.disabled = true;

  try {
    const res  = await fetch('/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, api_key: apiKeyInput.value.trim() }),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!res.ok) {
      setUrlStatus('error', data.error || text || 'Could not import from URL.');
      return;
    }

    // Auto-fill form fields with extracted data
    if (data.product_name) productName.value = data.product_name;
    if (data.brand_name)   brandName.value   = data.brand_name;
    if (data.tagline)      tagline.value      = data.tagline;
    if (data.description)  description.value  = data.description;
    if (data.cta)          cta.value          = data.cta;

    // Auto-fill drop zone with the product's og:image (proxied to bypass CORS)
    if (data.image_url) {
      try {
        const imgRes = await fetch(`/proxy-image?url=${encodeURIComponent(data.image_url)}`);
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          const ext  = blob.type.includes('png') ? 'png' : 'jpg';
          handleFile(new File([blob], `product.${ext}`, { type: blob.type }));
          setUrlStatus('success', '✓ Details & image imported — ready to generate!');
        } else {
          checkReady();
          setUrlStatus('success', '✓ Details imported — add a product image to generate.');
        }
      } catch (_) {
        checkReady();
        setUrlStatus('success', '✓ Details imported — add a product image to generate.');
      }
    } else {
      checkReady();
      setUrlStatus('success', '✓ Details imported — add a product image to generate.');
    }
  } catch (err) {
    setUrlStatus('error', 'Could not reach the server — please try again.');
    console.error(err);
  } finally {
    urlLoadBtn.disabled = false;
  }
}

function setUrlStatus(type, msg) {
  urlStatus.textContent = msg;
  urlStatus.className   = `url-status ${type}`;
  urlStatus.classList.remove('hidden');
}

// ── helpers ───────────────────────────────────────────────────────────────────
function setLoading(on) {
  generateBtn.disabled = on;
  btnIdle.classList.toggle('hidden', on);
  btnLoading.classList.toggle('hidden', !on);
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

function hideError() {
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';
}
