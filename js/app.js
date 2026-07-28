/* ═══════════════════════════════════════════
   CARDEX — app logic
   ═══════════════════════════════════════════ */

import {
  TYPES, TYPE_MAP, RARITIES, RARITY_MAP, COLOURS, COLOUR_MAP, STATS,
  MAKES, MODELS, guessMeta, guessShape, rankFor, RANKS, setCatalogueLookup
} from './data.js';
import * as DB from './store.js';
import { ACHIEVEMENTS, CATS, buildSummary, evaluate } from './achievements.js';
import { CATALOGUE, CATALOGUE_MAKES, CATALOGUE_COUNT, lookup as catLookup } from './catalogue.js';

/* Let the guesser consult the catalogue. */
setCatalogueLookup(catLookup);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ═══════ STATE ═══════ */
const S = {
  entries: [],
  urls: new Map(),      // photoId -> objectURL (revoked on wipe)
  filter: { q: '', type: null, rarity: null, colour: null, fav: false },
  editing: null,        // entry being edited, or null for new
  draft: null,          // working copy in the sheet
  pendingPhotos: [],    // {id, blob, thumb, url} not yet committed
  hiRes: false,
  installEvt: null,
  sheetStack: []
};

/* ═══════ BOOT ═══════ */
init();

async function init() {
  try { await boot(); }
  catch (err) {
    console.error('CARDEX failed to start', err);
    toast('Something went wrong starting up — try reopening the app', 6000);
  }
}

async function boot() {
  await DB.open();
  S.hiRes = await DB.getMeta('hiRes', false);
  $('#optHiRes').checked = S.hiRes;
  DB.persist();

  buildDatalists();
  buildSwatches();
  buildTypeGrid();
  buildRarityRow();
  buildStatSliders();

  S.entries = await DB.allEntries();
  invalidateEval();
  await hydrateThumbs();
  renderChips();
  renderGrid();
  renderSub();
  registerSW();
}

async function hydrateThumbs() {
  const ids = [];
  for (const e of S.entries) if (e.photos && e.photos[0]) ids.push(e.photos[0]);
  const rows = await DB.getPhotos(ids);
  for (const r of rows) {
    if (!r) continue;
    const b = r.thumb || r.blob;
    if (b && !S.urls.has(r.id)) S.urls.set(r.id, URL.createObjectURL(b));
  }
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  const sw = navigator.serviceWorker;

  // One reload per page load, no matter which path triggers it. Without this
  // guard a worker takeover plus a RELOAD message could bounce the page twice.
  let reloading = false;
  const reloadOnce = () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  };

  sw.addEventListener('controllerchange', reloadOnce);
  sw.addEventListener('message', e => {
    if (e.data && e.data.type === 'RELOAD') reloadOnce();
  });

  sw.register('sw.js').then(reg => {
    // A waiting worker means an update is cached but hasn't taken over. New
    // workers self-activate, so this only happens if one is stuck (e.g. left
    // over from an older build) — nudge it through rather than prompting.
    const nudge = () => {
      if (reg.waiting) {
        try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch {}
      }
    };
    nudge();
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => { if (w.state === 'installed') nudge(); });
    });

    // Check for a new deploy on launch and whenever the app is refocused.
    const check = () => reg.update().catch(() => {});
    check();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
    setInterval(check, 60 * 60 * 1000);
  }).catch(() => {});
}

/* ═══════ BUILDERS ═══════ */

function buildDatalists() {
  // union of the curated make list and every make in the catalogue
  const all = [...new Set([...MAKES, ...CATALOGUE_MAKES])]
    .sort((a, b) => a.localeCompare(b));
  $('#dlMakes').innerHTML = all.map(m => `<option value="${esc(m)}">`).join('');
}

function refreshModelList(make) {
  // catalogue first (generation-level, richer), then any curated extras
  const cat = (CATALOGUE[make] || []).map(r => r[0]);
  const extra = (MODELS[make] || []).filter(x => !cat.includes(x));
  const list = [...cat, ...extra];
  $('#dlModels').innerHTML = list.map(m => `<option value="${esc(m)}">`).join('');
}

function isLight(hex) {
  if (!hex || hex.startsWith('linear')) return false;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
}

function buildSwatches() {
  $('#swatches').innerHTML = COLOURS.map(c => `
    <button type="button" class="sw" data-colour="${c.id}" data-light="${isLight(c.hex) ? 1 : 0}"
      style="background:${c.hex}" title="${esc(c.label)}" aria-label="${esc(c.label)}"></button>
  `).join('');
  $('#swatches').addEventListener('click', e => {
    const b = e.target.closest('.sw'); if (!b) return;
    const v = b.dataset.colour;
    S.draft.colour = (S.draft.colour === v) ? null : v;
    syncSwatches();
    haptic(6);
  });
}

function syncSwatches() {
  $$('#swatches .sw').forEach(b => b.classList.toggle('on', b.dataset.colour === S.draft.colour));
}

function buildTypeGrid() {
  $('#typegrid').innerHTML = TYPES.map(t =>
    `<button type="button" class="tbtn" data-type="${t.id}" data-c="${t.colour}">${esc(t.label)}</button>`
  ).join('');
  $('#typegrid').addEventListener('click', e => {
    const b = e.target.closest('.tbtn'); if (!b) return;
    const v = b.dataset.type;
    const i = S.draft.types.indexOf(v);
    if (i >= 0) S.draft.types.splice(i, 1);
    else {
      if (S.draft.types.length >= 3) { toast('Three types max'); return; }
      S.draft.types.push(v);
    }
    syncTypes();
    haptic(6);
  });
}

function syncTypes() {
  $$('#typegrid .tbtn').forEach(b => {
    const on = S.draft.types.includes(b.dataset.type);
    b.classList.toggle('on', on);
    b.style.background = on ? b.dataset.c : '';
    b.style.borderColor = on ? b.dataset.c : '';
    // dark type colours need white text, not the default near-black
    b.style.color = on ? (isLight(b.dataset.c) ? '#0d1015' : '#fff') : '';
  });
}

function buildRarityRow() {
  $('#rarityrow').innerHTML = RARITIES.map(r =>
    `<button type="button" class="rbtn" data-r="${r.id}" data-c="${r.colour}" style="color:${r.colour}">
       <span class="pip"></span>${esc(r.label)}
     </button>`
  ).join('');
  $('#rarityrow').addEventListener('click', e => {
    const b = e.target.closest('.rbtn'); if (!b) return;
    S.draft.rarity = b.dataset.r;
    syncRarity();
    haptic(6);
  });
}

function syncRarity() {
  $$('#rarityrow .rbtn').forEach(b => {
    const on = b.dataset.r === S.draft.rarity;
    b.classList.toggle('on', on);
    b.style.background = on ? b.dataset.c : '';
    b.style.borderColor = on ? b.dataset.c : '';
    b.style.color = on ? '#0d1015' : b.dataset.c;
  });
  const r = RARITY_MAP[S.draft.rarity];
  $('#rarityHint').textContent = r ? `${r.blurb}  ·  +${r.xp} XP` : '';
}

function buildStatSliders() {
  $('#statlist').innerHTML = STATS.map(s => `
    <div class="statrow">
      <span class="sn" title="${esc(s.hint)}">${esc(s.label)}</span>
      <input type="range" min="0" max="10" step="1" data-stat="${s.id}" value="5">
      <span class="sv" data-sv="${s.id}">5</span>
    </div>
  `).join('');
  $('#statlist').addEventListener('input', e => {
    const inp = e.target.closest('input[type=range]'); if (!inp) return;
    const k = inp.dataset.stat;
    S.draft.stats[k] = Number(inp.value);
    $(`[data-sv="${k}"]`).textContent = inp.value;
  });
}

function syncStats() {
  STATS.forEach(s => {
    const v = S.draft.stats[s.id] ?? 5;
    const inp = $(`input[data-stat="${s.id}"]`);
    if (inp) inp.value = v;
    const out = $(`[data-sv="${s.id}"]`);
    if (out) out.textContent = v;
  });
}

/* ═══════ CHIPS ═══════ */

function renderChips() {
  const counts = { type: {}, rarity: {}, colour: {} };
  for (const e of S.entries) {
    (e.types || []).forEach(t => counts.type[t] = (counts.type[t] || 0) + 1);
    counts.rarity[e.rarity] = (counts.rarity[e.rarity] || 0) + 1;
    if (e.colour) counts.colour[e.colour] = (counts.colour[e.colour] || 0) + 1;
  }
  const favN = S.entries.filter(e => e.fav).length;

  let html = '';
  if (favN) {
    html += `<button class="chip ${S.filter.fav ? 'on' : ''}" data-k="fav">★ Favourites <span class="n">${favN}</span></button>`;
  }
  for (const r of RARITIES) {
    const n = counts.rarity[r.id]; if (!n) continue;
    const on = S.filter.rarity === r.id;
    html += `<button class="chip ${on ? 'on' : ''}" data-k="rarity" data-v="${r.id}"
      style="${on ? `background:${r.colour};border-color:${r.colour};color:#0d1015` : `color:${r.colour}`}">
      <span class="dot"></span>${esc(r.label)} <span class="n">${n}</span></button>`;
  }
  const typeIds = Object.keys(counts.type).sort((a, b) => counts.type[b] - counts.type[a]);
  for (const tid of typeIds) {
    const t = TYPE_MAP[tid]; if (!t) continue;
    const on = S.filter.type === tid;
    html += `<button class="chip ${on ? 'on' : ''}" data-k="type" data-v="${tid}"
      style="${on ? `background:${t.colour};border-color:${t.colour};color:${isLight(t.colour) ? '#0d1015' : '#fff'}` : ''}">
      ${esc(t.label)} <span class="n">${counts.type[tid]}</span></button>`;
  }
  $('#chiprow').innerHTML = html;
}

$('#chiprow')?.addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c) return;
  const k = c.dataset.k, v = c.dataset.v;
  if (k === 'fav') S.filter.fav = !S.filter.fav;
  else S.filter[k] = (S.filter[k] === v) ? null : v;
  renderChips(); renderGrid(); haptic(6);
});

/* ═══════ GRID ═══════ */

function visible() {
  const q = S.filter.q.trim().toLowerCase();
  return S.entries.filter(e => {
    if (S.filter.fav && !e.fav) return false;
    if (S.filter.type && !(e.types || []).includes(S.filter.type)) return false;
    if (S.filter.rarity && e.rarity !== S.filter.rarity) return false;
    if (S.filter.colour && e.colour !== S.filter.colour) return false;
    if (q) {
      const hay = `${e.make} ${e.model} ${e.year || ''} ${e.plate || ''} ${e.notes || ''} ${(e.sightings || []).map(s => s.place).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.no - a.no);
}

function renderGrid() {
  const rows = visible();
  const grid = $('#grid');
  $('#emptyState').hidden = S.entries.length > 0;
  $('#noResults').hidden = !(S.entries.length > 0 && rows.length === 0);

  grid.innerHTML = rows.map((e, i) => {
    const r = RARITY_MAP[e.rarity] || RARITY_MAP.common;
    const pid = e.photos && e.photos[0];
    const url = pid ? S.urls.get(pid) : null;
    const n = (e.sightings || []).length;
    return `
    <article class="card ${e.rarity}" data-id="${e.id}" style="animation-delay:${Math.min(i * 22, 330)}ms">
      ${url
        ? `<img class="shot" src="${url}" alt="" loading="lazy" decoding="async">`
        : `<div class="noshot"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`}
      <span class="rar" style="color:${r.colour}">${esc(r.label)}</span>
      ${n > 1 ? `<span class="cnt">×${n}</span>` : ''}
      ${e.fav ? `<span class="cnt" style="left:auto;right:8px;top:34px;color:var(--gold)">★</span>` : ''}
      <div class="meta">
        <div class="no">#${String(e.no).padStart(3, '0')}</div>
        <div class="nm">${esc(e.model || e.make || 'Unknown')}</div>
        <div class="mk">${esc(subMake(e))}${e.year ? (subMake(e) ? ' · ' : '') + e.year : ''}</div>
        <div class="tags">${(e.types || []).slice(0, 3).map(t => {
          const ty = TYPE_MAP[t]; if (!ty) return '';
          return `<span class="tag" style="color:${readable(ty.colour)};background:${hexA(ty.colour, .17)}">${esc(ty.label)}</span>`;
        }).join('')}</div>
      </div>
    </article>`;
  }).join('');
}

$('#grid').addEventListener('click', e => {
  const c = e.target.closest('.card'); if (!c) return;
  openView(c.dataset.id);
});

/* Evaluating 700 achievements is cheap, but not free — cache it and
   invalidate whenever the dex changes. */
let _evalCache = null;
function currentEval() {
  if (!_evalCache) _evalCache = evaluate(buildSummary(S.entries));
  return _evalCache;
}
function invalidateEval() { _evalCache = null; }

function renderSub() {
  const n = S.entries.length;
  const sightings = S.entries.reduce((a, e) => a + (e.sightings || []).length, 0);
  const xp = totalXP(currentEval());
  $('#tbSub').textContent = n === 0
    ? 'Empty dex — go find something'
    : `${n} ${n === 1 ? 'entry' : 'entries'} · ${sightings} spots · ${rankFor(xp).title}`;
}

/* ═══════ SEARCH ═══════ */

$('#search').addEventListener('input', e => {
  S.filter.q = e.target.value;
  $('#clearSearch').hidden = !e.target.value;
  renderGrid();
});
$('#clearSearch').addEventListener('click', () => {
  $('#search').value = ''; S.filter.q = '';
  $('#clearSearch').hidden = true; renderGrid();
});
$('#clearFilters').addEventListener('click', () => {
  S.filter = { q: '', type: null, rarity: null, colour: null, fav: false };
  $('#search').value = ''; $('#clearSearch').hidden = true;
  renderChips(); renderGrid();
});

/* ═══════ SHEETS ═══════ */

function openSheet(sel) {
  const el = $(sel);
  $('#scrim').hidden = false;
  el.hidden = false;
  el.classList.remove('closing');
  el.querySelector('.sheet-body').scrollTop = 0;
  if (!S.sheetStack.includes(sel)) S.sheetStack.push(sel);
  // stacked sheets must paint above whatever is already open, regardless of DOM order
  el.style.zIndex = 60 + S.sheetStack.indexOf(sel);
  document.body.style.overflow = 'hidden';
}

function closeSheet(sel) {
  const el = $(sel);
  el.classList.add('closing');
  setTimeout(() => {
    el.hidden = true;
    el.classList.remove('closing');
    el.style.zIndex = '';
    S.sheetStack = S.sheetStack.filter(s => s !== sel);
    if (!S.sheetStack.length) {
      $('#scrim').hidden = true;
      document.body.style.overflow = '';
    }
  }, 210);
}

$('#scrim').addEventListener('click', () => {
  const top = S.sheetStack[S.sheetStack.length - 1];
  if (top === '#editSheet') { confirmDiscard(); return; }
  if (top) closeSheet(top);
});

/* ═══════ ADD / EDIT ═══════ */

function blankDraft() {
  return {
    id: uid(), no: null, make: '', model: '', year: '', plate: '',
    colour: null, types: [], rarity: 'common',
    stats: { presence: 5, style: 5, sound: 5, condition: 5 },
    notes: '', fav: false, photos: [], sightings: [], created: Date.now()
  };
}

async function openEdit(entry) {
  S.editing = entry || null;
  S.draft = entry ? deepCopy(entry) : blankDraft();
  S.pendingPhotos = [];

  $('#editTitle').textContent = entry ? `Edit #${String(entry.no).padStart(3, '0')}` : 'New spot';
  $('#btnDelete').hidden = !entry;
  $('#fMake').value = S.draft.make;
  $('#fModel').value = S.draft.model;
  $('#fYear').value = S.draft.year || '';
  $('#fPlate').value = S.draft.plate || '';
  $('#fNotes').value = S.draft.notes || '';
  $('#fPlace').value = entry ? '' : '';
  $('#fPlace').closest('.field').hidden = !!entry;
  refreshModelList(S.draft.make);
  syncSwatches(); syncTypes(); syncRarity(); syncStats();

  // load existing photos into the strip
  if (entry && entry.photos && entry.photos.length) {
    const rows = await DB.getPhotos(entry.photos);
    S.pendingPhotos = rows.filter(Boolean).map(r => ({
      id: r.id, existing: true,
      url: S.urls.get(r.id) || URL.createObjectURL(r.thumb || r.blob)
    }));
    S.pendingPhotos.forEach(p => { if (!S.urls.has(p.id)) S.urls.set(p.id, p.url); });
  }
  renderStrip();
  openSheet('#editSheet');
}

function renderStrip() {
  $('#photostrip').innerHTML = S.pendingPhotos.map((p, i) => `
    <div class="pthumb ${i === 0 ? 'main' : ''}" data-i="${i}">
      <img src="${p.url}" alt="">
      <button class="x" data-del="${i}" aria-label="Remove photo">×</button>
    </div>
  `).join('');
}

$('#photostrip').addEventListener('click', e => {
  const del = e.target.closest('[data-del]');
  if (del) {
    const i = Number(del.dataset.del);
    S.pendingPhotos.splice(i, 1);
    renderStrip();
    haptic(8);
    return;
  }
  const th = e.target.closest('.pthumb');
  if (th) { // promote to main
    const i = Number(th.dataset.i);
    if (i > 0) {
      const [p] = S.pendingPhotos.splice(i, 1);
      S.pendingPhotos.unshift(p);
      renderStrip();
      toast('Set as main photo');
      haptic(8);
    }
  }
});

$('#fMake').addEventListener('input', e => {
  S.draft.make = e.target.value;
  refreshModelList(e.target.value);
  autoGuess();
});
$('#fModel').addEventListener('input', e => { S.draft.model = e.target.value; autoGuess(); });
$('#fYear').addEventListener('input', e => { S.draft.year = e.target.value; autoGuess(); });
$('#fPlate').addEventListener('input', e => { S.draft.plate = e.target.value.toUpperCase(); e.target.value = S.draft.plate; });
$('#fNotes').addEventListener('input', e => { S.draft.notes = e.target.value; });

let guessedFor = '';
function autoGuess() {
  // only auto-fill while the user hasn't touched types/rarity themselves
  if (S.editing) return;
  const key = `${S.draft.make}|${S.draft.model}|${S.draft.year}`;
  if (key === guessedFor) return;
  guessedFor = key;
  if (!S.draft.make && !S.draft.model) return;
  if (S.draft._touched) return;
  const g = guessMeta(S.draft.make, S.draft.model, S.draft.year);
  S.draft.types = g.types;
  S.draft.rarity = g.rarity;
  syncTypes(); syncRarity();
}
$('#typegrid').addEventListener('click', () => { S.draft._touched = true; }, true);
$('#rarityrow').addEventListener('click', () => { S.draft._touched = true; }, true);

/* photo inputs */
$('#btnCapture').addEventListener('click', async () => {
  haptic(12);
  await openEdit(null);
  setTimeout(() => $('#fileInput').click(), 260);
});
$('#addPhotoCam').addEventListener('click', () => $('#fileInput').click());
$('#addPhotoLib').addEventListener('click', () => $('#fileInputMulti').click());

$('#fileInput').addEventListener('change', e => handleFiles(e.target.files, e.target));
$('#fileInputMulti').addEventListener('change', e => handleFiles(e.target.files, e.target));

async function handleFiles(files, input) {
  const list = [...files].filter(f => f.type.startsWith('image/'));
  if (!list.length) { input.value = ''; return; }
  toast(list.length > 1 ? `Processing ${list.length} photos…` : 'Processing photo…');
  for (const f of list) {
    if (S.pendingPhotos.length >= 8) { toast('8 photos max per entry'); break; }
    try {
      const { full, thumb } = await DB.processImage(f, S.hiRes ? 'hi' : 'normal');
      const id = uid();
      const url = URL.createObjectURL(thumb);
      S.pendingPhotos.push({ id, blob: full, thumb, url, existing: false });
      S.urls.set(id, url);
    } catch (err) {
      console.error(err);
      toast('Could not read that image');
    }
  }
  renderStrip();
  hideToast();
  input.value = '';
}

/* geolocation */
$('#btnGeo').addEventListener('click', () => {
  if (!navigator.geolocation) { toast('No location on this device'); return; }
  toast('Finding you…');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: la, longitude: lo } = pos.coords;
      S.draft.geo = { lat: +la.toFixed(5), lon: +lo.toFixed(5) };
      if (!$('#fPlace').value.trim()) $('#fPlace').value = `${la.toFixed(4)}, ${lo.toFixed(4)}`;
      toast('Location added');
    },
    () => toast('Location unavailable'),
    { timeout: 8000, maximumAge: 60000 }
  );
});

/* save */
$('#editSave').addEventListener('click', save);
$('#editCancel').addEventListener('click', confirmDiscard);

function confirmDiscard() {
  const dirty = S.pendingPhotos.some(p => !p.existing) || $('#fMake').value || $('#fModel').value;
  if (!S.editing && dirty) {
    if (!confirm('Discard this spot?')) return;
  }
  closeSheet('#editSheet');
}

async function save() {
  const make = $('#fMake').value.trim();
  const model = $('#fModel').value.trim();
  if (!make && !model) { toast('Give it at least a make or model'); $('#fMake').focus(); return; }

  const d = S.draft;
  d.make = make; d.model = model;
  d.year = $('#fYear').value.trim();
  d.plate = $('#fPlate').value.trim().toUpperCase();
  d.notes = $('#fNotes').value.trim();
  if (!d.types.length) {
    const shape = guessShape(make, model);
    if (shape) d.types = [shape];
  }

  // commit new photos
  for (const p of S.pendingPhotos) {
    if (!p.existing) await DB.putPhoto(p.id, p.blob, p.thumb);
  }
  const keptIds = S.pendingPhotos.map(p => p.id);
  // delete photos removed during edit
  if (S.editing) {
    for (const oldId of (S.editing.photos || [])) {
      if (!keptIds.includes(oldId)) { await DB.deletePhoto(oldId); S.urls.delete(oldId); }
    }
  }
  d.photos = keptIds;

  let isNew = false;
  if (S.editing) {
    d.updated = Date.now();
  } else {
    isNew = true;
    d.no = await DB.nextNo();
    const place = $('#fPlace').value.trim();
    d.sightings = [{ at: Date.now(), place, geo: d.geo || null }];
    delete d.geo;
  }
  delete d._touched;

  // snapshot which achievements were already earned, so we can tell what's new
  const before = new Set(currentEval().rows.filter(r => r.done).map(r => r.a.id));

  await DB.putEntry(d);
  S.entries = await DB.allEntries();
  invalidateEval();
  await hydrateThumbs();
  renderChips(); renderGrid(); renderSub();
  closeSheet('#editSheet');

  const earned = currentEval().rows.filter(r => r.done && !before.has(r.a.id)).map(r => r.a);

  if (isNew) { haptic([14, 60, 22]); showUnlock(d, earned); }
  else {
    toast('Saved'); haptic(10);
    if (S.sheetStack.includes('#viewSheet')) openView(d.id);
    if (earned.length) setTimeout(() => showAchPopup(earned), 500);
  }
}

/* delete */
$('#btnDelete').addEventListener('click', async () => {
  if (!S.editing) return;
  if (!confirm(`Delete #${String(S.editing.no).padStart(3, '0')} ${S.editing.make} ${S.editing.model}? This cannot be undone.`)) return;
  await DB.deleteEntry(S.editing.id);
  S.entries = await DB.allEntries();
  invalidateEval();
  renderChips(); renderGrid(); renderSub();
  closeSheet('#editSheet');
  closeSheet('#viewSheet');
  toast('Entry deleted');
});

/* ═══════ UNLOCK ═══════ */

function showUnlock(entry, earned = []) {
  const r = RARITY_MAP[entry.rarity] || RARITY_MAP.common;
  const pid = entry.photos && entry.photos[0];
  const url = pid ? S.urls.get(pid) : null;
  $('#unlockKicker').textContent = 'NEW DEX ENTRY';
  $('#unlockShot').innerHTML = url
    ? `<img src="${url}" alt="">`
    : `<div class="noshot"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`;
  $('#unlockNo').textContent = `#${String(entry.no).padStart(3, '0')}`;
  $('#unlockName').textContent = fullName(entry.make, entry.model);
  $('#unlockRarity').textContent = r.label;
  $('#unlockRarity').style.color = r.colour;
  const bonus = earned.reduce((a, x) => a + x.xp, 0);
  $('#unlockXp').innerHTML = bonus
    ? `+${r.xp} XP <span style="opacity:.75">+ ${bonus.toLocaleString()} bonus</span>`
    : `+${r.xp} XP`;

  const u = $('#unlock');
  u.hidden = false; u.classList.remove('out');
  const dismiss = () => {
    u.classList.add('out');
    setTimeout(() => {
      u.hidden = true; u.classList.remove('out');
      if (earned.length) showAchPopup(earned);
    }, 300);
    u.removeEventListener('click', dismiss);
    clearTimeout(autoT);
  };
  u.addEventListener('click', dismiss);
  const autoT = setTimeout(() => { if (!u.hidden) dismiss(); }, 3400);
}

/* ═══════ ACHIEVEMENT UNLOCK POPUP ═══════ */

function showAchPopup(list) {
  if (!list || !list.length) return;
  // biggest prize first, cap the queue so 20 unlocks don't trap you
  const queue = [...list].sort((a, b) => b.xp - a.xp).slice(0, 5);
  const extra = list.length - queue.length;
  const host = $('#achPop');
  let i = 0;

  const step = () => {
    if (i >= queue.length) {
      host.hidden = true;
      host.classList.remove('in');
      if (extra > 0) toast(`+${extra} more achievement${extra > 1 ? 's' : ''} unlocked`);
      return;
    }
    const a = queue[i++];
    host.innerHTML = `
      <div class="achpop-card">
        <div class="achpop-rays" aria-hidden="true"></div>
        <p class="achpop-kicker">ACHIEVEMENT UNLOCKED</p>
        <div class="achpop-icon">${a.icon}</div>
        <h3 class="achpop-name">${esc(a.name)}</h3>
        <p class="achpop-desc">${esc(a.desc)}</p>
        <p class="achpop-xp">+${a.xp.toLocaleString()} XP</p>
        ${queue.length > 1 ? `<p class="achpop-count">${i} of ${queue.length}</p>` : ''}
      </div>`;
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add('in'));
    haptic([12, 45, 18]);
    clearTimeout(host._t);
    host._t = setTimeout(step, 2400);
  };

  host.onclick = () => { clearTimeout(host._t); step(); };
  step();
}

/* ═══════ DETAIL VIEW ═══════ */

let viewId = null;

async function openView(id) {
  const e = S.entries.find(x => x.id === id); if (!e) return;
  viewId = id;
  $('#viewNo').textContent = `#${String(e.no).padStart(3, '0')}`;

  const rows = await DB.getPhotos(e.photos || []);
  const urls = rows.filter(Boolean).map(r => {
    if (!S.urls.has(r.id + ':full')) S.urls.set(r.id + ':full', URL.createObjectURL(r.blob));
    return S.urls.get(r.id + ':full');
  });

  const r = RARITY_MAP[e.rarity] || RARITY_MAP.common;
  const col = COLOUR_MAP[e.colour];
  const sights = (e.sightings || []).slice().sort((a, b) => b.at - a.at);

  $('#viewBody').innerHTML = `
    <div class="vhero">
      ${urls.length ? `
        <div class="track" id="vtrack">${urls.map(u => `<img src="${u}" alt="">`).join('')}</div>
        ${urls.length > 1 ? `<div class="dots" id="vdots">${urls.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>` : ''}
      ` : `<div class="noshot"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`}
    </div>

    <div class="vtitle">
      <div class="vno">ENTRY #${String(e.no).padStart(3, '0')} · SPOTTED ${sights.length}×</div>
      <h2>${esc(e.model || e.make || 'Unknown')}</h2>
      <div class="vsub">${esc([subMake(e), e.year].filter(Boolean).join(' · ')) || '—'}</div>
      <div class="vbadges">
        <span class="vbadge" style="color:#0d1015;background:${r.colour}">${esc(r.label)}</span>
        ${(e.types || []).map(t => {
          const ty = TYPE_MAP[t]; if (!ty) return '';
          return `<span class="vbadge" style="color:${readable(ty.colour)};background:${hexA(ty.colour, .18)}">${esc(ty.label)}</span>`;
        }).join('')}
      </div>
    </div>

    <div class="vgrid">
      ${col ? `<div class="vcell"><div class="k">Colour</div><div class="v">
        <span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${col.hex};margin-right:6px;vertical-align:-1px"></span>${esc(col.label)}</div></div>` : ''}
      ${e.plate ? `<div class="vcell"><div class="k">Plate</div><div class="v" style="font-family:ui-monospace,monospace;letter-spacing:.05em">${esc(e.plate)}</div></div>` : ''}
      <div class="vcell"><div class="k">First spotted</div><div class="v">${fmtDate(sights.length ? sights[sights.length - 1].at : e.created)}</div></div>
      <div class="vcell"><div class="k">XP earned</div><div class="v" style="color:var(--gold)">${r.xp * sights.length}</div></div>
    </div>

    <div class="vsection">
      <h3>Vibe check</h3>
      ${STATS.map(s => {
        const v = (e.stats && e.stats[s.id]) ?? 5;
        return `<div class="vstat">
          <span class="sn">${esc(s.label)}</span>
          <div class="bar"><i style="width:${v * 10}%;background:${statColour(v)}"></i></div>
          <span class="sv">${v}</span>
        </div>`;
      }).join('')}
    </div>

    ${e.notes ? `<div class="vsection"><h3>Notes</h3><div class="vnotes">${esc(e.notes)}</div></div>` : ''}

    <div class="vsection">
      <h3>Sighting log</h3>
      <div class="sightlist">
        ${sights.map((s, i) => `
          <div class="sight">
            <span class="sn">${sights.length - i}</span>
            <div>
              <div class="sdate">${fmtDate(s.at)}</div>
              ${s.place ? `<div class="splace">${esc(s.place)}</div>` : ''}
            </div>
          </div>`).join('')}
      </div>
      <button class="btn ghost block btn-spotagain" id="btnSpotAgain">Spotted it again</button>
      <button class="btn ghost block" id="btnFav">${e.fav ? '★ Remove from favourites' : '☆ Add to favourites'}</button>
    </div>
    <div class="sheetpad"></div>
  `;

  const track = $('#vtrack');
  if (track && urls.length > 1) {
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      $$('#vdots i').forEach((d, j) => d.classList.toggle('on', j === i));
    }, { passive: true });
  }

  $('#btnSpotAgain').addEventListener('click', async () => {
    const place = prompt('Where did you see it this time? (optional)') ?? null;
    if (place === null) return;
    e.sightings = e.sightings || [];
    e.sightings.push({ at: Date.now(), place: place.trim() });
    await DB.putEntry(e);
    S.entries = await DB.allEntries();
    invalidateEval();
    renderGrid(); renderSub();
    openView(id);
    toast(`Sighting #${e.sightings.length} logged  ·  +${r.xp} XP`);
    haptic([10, 40, 14]);
  });

  $('#btnFav').addEventListener('click', async () => {
    e.fav = !e.fav;
    await DB.putEntry(e);
    S.entries = await DB.allEntries();
    invalidateEval();
    renderChips(); renderGrid();
    openView(id);
    toast(e.fav ? 'Added to favourites' : 'Removed from favourites');
    haptic(8);
  });

  openSheet('#viewSheet');
}

$('#viewClose').addEventListener('click', () => closeSheet('#viewSheet'));
$('#viewEdit').addEventListener('click', () => {
  const e = S.entries.find(x => x.id === viewId); if (!e) return;
  openEdit(e);
});

function statColour(v) {
  if (v >= 8) return '#3ddc84';
  if (v >= 5) return '#f5c542';
  if (v >= 3) return '#f97316';
  return '#e11d33';
}

/* ═══════ STATS SHEET ═══════ */

/* XP from the cars themselves. */
function spotXP() {
  return S.entries.reduce((a, e) => {
    const r = RARITY_MAP[e.rarity] || RARITY_MAP.common;
    return a + r.xp * Math.max(1, (e.sightings || []).length);
  }, 0);
}

/* Spot XP + every achievement you've earned. */
function totalXP(evalResult) {
  const ev = evalResult || evaluate(buildSummary(S.entries));
  return spotXP() + ev.xp;
}


/* One shared summary per render, reused by the charts and all 700 achievements. */
function statSummary() {
  const sum = buildSummary(S.entries);
  sum.rar = sum.rarity;              // legacy alias used by the charts
  return sum;
}

function renderStats() {
  const s = statSummary();
  const ev = currentEval();
  const xp = totalXP(ev);
  const rank = rankFor(xp);
  const next = RANKS.find(r => r.min > xp);
  const prevMin = rank.min;
  const pct = next ? Math.round(((xp - prevMin) / (next.min - prevMin)) * 100) : 100;

  const topMakes = Object.entries(s.makes).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topTypes = Object.entries(s.types).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxMake = topMakes.length ? topMakes[0][1] : 1;
  const maxType = topTypes.length ? topTypes[0][1] : 1;

  $('#statsBody').innerHTML = `
    <div class="rankcard">
      <div class="rk">Rank</div>
      <h2>${esc(rank.title)}</h2>
      <div class="xp">${xp.toLocaleString()} XP</div>
      <div class="rankbar"><i style="width:${pct}%"></i></div>
      <div class="nxt">${next ? `${(next.min - xp).toLocaleString()} XP to “${esc(next.title)}”` : 'Maximum rank reached. Genuinely impressive.'}</div>
    </div>

    <div class="kpis">
      <div class="kpi"><div class="n">${s.n}</div><div class="l">ENTRIES</div></div>
      <div class="kpi"><div class="n">${s.sightings}</div><div class="l">SPOTS</div></div>
      <div class="kpi"><div class="n">${s.makeCount}</div><div class="l">MAKES</div></div>
    </div>

    <div class="vsection" style="margin-top:0">
      <h3>Catalogue</h3>
      <div class="achsummary">
        <div class="achbar"><i style="width:${(s.catCount / CATALOGUE_COUNT * 100).toFixed(2)}%"></i></div>
        <div class="achmeta">
          <span><strong>${s.catCount.toLocaleString()}</strong> of ${CATALOGUE_COUNT.toLocaleString()} known cars found</span>
          <span>${(s.catCount / CATALOGUE_COUNT * 100).toFixed(1)}%</span>
        </div>
      </div>
      <p class="hint" style="margin-top:9px">Log a car the catalogue recognises and it counts towards brand hunts. Nothing is listed for you — you have to find them.</p>
    </div>

    <div class="vsection" style="margin-top:0">
      <h3>By rarity</h3>
      <div class="bars">
        ${RARITIES.map(r => {
          const n = s.rar[r.id] || 0;
          const pc = s.n ? (n / s.n) * 100 : 0;
          return `<div class="brow">
            <span class="bl" style="color:${r.colour}">${esc(r.label)}</span>
            <div class="bt"><i style="width:${pc}%;background:${r.colour}"></i></div>
            <span class="bv">${n}</span></div>`;
        }).join('')}
      </div>
    </div>

    ${topMakes.length ? `<div class="vsection">
      <h3>Most spotted makes</h3>
      <div class="bars">
        ${topMakes.map(([m, n]) => `<div class="brow">
          <span class="bl">${esc(m)}</span>
          <div class="bt"><i style="width:${(n / maxMake) * 100}%;background:linear-gradient(90deg,#3fb6ff,#7ad0ff)"></i></div>
          <span class="bv">${n}</span></div>`).join('')}
      </div></div>` : ''}

    ${topTypes.length ? `<div class="vsection">
      <h3>Types collected</h3>
      <div class="bars">
        ${topTypes.map(([t, n]) => {
          const ty = TYPE_MAP[t]; if (!ty) return '';
          return `<div class="brow">
            <span class="bl" style="color:${readable(ty.colour)}">${esc(ty.label)}</span>
            <div class="bt"><i style="width:${(n / maxType) * 100}%;background:${ty.colour}"></i></div>
            <span class="bv">${n}</span></div>`;
        }).join('')}
      </div></div>` : ''}

    <div class="vsection">
      <h3>Achievements · ${ev.unlocked}/${ev.total}</h3>
      <div class="achsummary">
        <div class="achbar"><i style="width:${(ev.unlocked / ev.total * 100).toFixed(1)}%"></i></div>
        <div class="achmeta">
          <span>${(ev.unlocked / ev.total * 100).toFixed(1)}% complete</span>
          <span>${ev.xp.toLocaleString()} XP earned</span>
        </div>
      </div>
      <button class="btn ghost block" id="btnAchAll" style="margin-top:12px">
        View all ${ev.total} achievements
      </button>

      <h3 style="margin-top:22px">Closest to unlocking</h3>
      <div class="achlist wide" id="achNear"></div>
    </div>
    <div class="sheetpad"></div>
  `;
}

/* ── the six you're closest to finishing (excluding already-done) ── */
function renderNearMisses(ev) {
  const host = $('#achNear');
  if (!host) return;
  const near = ev.rows
    .filter(r => !r.done && r.raw > 0)
    .sort((a, b) => (b.pct - a.pct) || (a.a.goal - b.a.goal))
    .slice(0, 6);

  const pool = near.length ? near : ev.rows
    .filter(r => !r.done)
    .sort((a, b) => a.a.goal - b.a.goal || a.a.xp - b.a.xp)
    .slice(0, 6);

  host.innerHTML = pool.map(achCardHTML).join('') ||
    `<p class="muted" style="grid-column:1/-1">Every single one unlocked. Extraordinary.</p>`;
}

function achCardHTML(r) {
  const a = r.a;
  const pctTxt = Math.round(r.pct * 100);
  return `
    <div class="ach ${r.done ? 'got' : ''} ${a.grail && r.done ? 'grail' : ''}">
      <div class="ahead">
        <span class="ai">${a.icon}</span>
        <span class="axp">${r.done ? '✓' : ''} ${a.xp.toLocaleString()} XP</span>
      </div>
      <div class="an">${esc(a.name)}</div>
      <div class="ad">${esc(a.desc)}</div>
      ${a.goal > 1 ? `
        <div class="aprog"><i style="width:${pctTxt}%"></i></div>
        <div class="apct">${r.raw.toLocaleString()} / ${a.goal.toLocaleString()}</div>
      ` : `<div class="apct single">${r.done ? 'Unlocked' : 'Not yet found'}</div>`}
    </div>`;
}

$('#btnStats').addEventListener('click', () => {
  renderStats();
  renderNearMisses(currentEval());
  openSheet('#statsSheet');
});

/* ═══════ FULL ACHIEVEMENT BROWSER ═══════ */

const achView = { cat: 'all', show: 'all', q: '' };

function renderAchSheet() {
  const ev = currentEval();
  const counts = { all: { got: 0, tot: 0 } };
  for (const c of CATS) counts[c.id] = { got: 0, tot: 0 };
  for (const r of ev.rows) {
    counts.all.tot++; if (r.done) counts.all.got++;
    if (counts[r.a.cat]) { counts[r.a.cat].tot++; if (r.done) counts[r.a.cat].got++; }
  }

  $('#achHead').innerHTML = `
    <div class="achbar big"><i style="width:${(ev.unlocked / ev.total * 100).toFixed(1)}%"></i></div>
    <div class="achmeta">
      <span><strong>${ev.unlocked}</strong> of ${ev.total} unlocked</span>
      <span>${ev.xp.toLocaleString()} XP</span>
    </div>`;

  const tabs = [{ id: 'all', label: 'All', icon: '🏆' }, ...CATS];
  $('#achCats').innerHTML = tabs.map(c => {
    const n = counts[c.id] || { got: 0, tot: 0 };
    return `<button class="chip ${achView.cat === c.id ? 'on' : ''}" data-cat="${c.id}">
      ${c.icon} ${esc(c.label)} <span class="n">${n.got}/${n.tot}</span></button>`;
  }).join('');

  $$('#achShow .segbtn').forEach(b => b.classList.toggle('on', b.dataset.show === achView.show));

  const q = achView.q.trim().toLowerCase();
  let rows = ev.rows.filter(r => {
    if (achView.cat !== 'all' && r.a.cat !== achView.cat) return false;
    if (achView.show === 'locked' && r.done) return false;
    if (achView.show === 'unlocked' && !r.done) return false;
    if (q && !(`${r.a.name} ${r.a.desc}`.toLowerCase().includes(q))) return false;
    return true;
  });

  // unlocked first when browsing everything, otherwise closest-first
  rows.sort((a, b) => {
    if (achView.show === 'all' && a.done !== b.done) return a.done ? -1 : 1;
    if (!a.done && !b.done) return (b.pct - a.pct) || (a.a.goal - b.a.goal);
    return b.a.xp - a.a.xp;
  });

  $('#achCount').textContent = `${rows.length} shown`;
  const body = $('#achGrid');
  if (!rows.length) {
    body.innerHTML = `<p class="muted" style="grid-column:1/-1;text-align:center;padding:30px 0">Nothing matches that filter.</p>`;
    return;
  }
  // cap the DOM for speed; there can be 700 of these
  const CAP = 180;
  body.innerHTML = rows.slice(0, CAP).map(achCardHTML).join('') +
    (rows.length > CAP
      ? `<p class="muted" style="grid-column:1/-1;text-align:center;padding:14px 0">
           +${rows.length - CAP} more — narrow it down with search or a category.</p>`
      : '');
}

$('#statsBody').addEventListener('click', e => {
  if (e.target.closest('#btnAchAll')) { openAchSheet(); }
});

function openAchSheet() {
  renderAchSheet();
  openSheet('#achSheet');
  $('#achSheet .sheet-body').scrollTop = 0;
}

$('#achClose').addEventListener('click', () => closeSheet('#achSheet'));
$('#achCats').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  achView.cat = b.dataset.cat; renderAchSheet();
  $('#achSheet .sheet-body').scrollTop = 0;
  haptic(6);
});
$('#achShow').addEventListener('click', e => {
  const b = e.target.closest('[data-show]'); if (!b) return;
  achView.show = b.dataset.show; renderAchSheet();
  haptic(6);
});
$('#achSearch').addEventListener('input', e => { achView.q = e.target.value; renderAchSheet(); });
$('#statsClose').addEventListener('click', () => closeSheet('#statsSheet'));

/* ═══════ SETTINGS ═══════ */

$('#btnSettings').addEventListener('click', async () => {
  await renderUsage();
  showVersion();
  openSheet('#setSheet');
});

/* Ask the active service worker which build is running, so you can confirm at
   a glance that an update actually landed on the phone. */
function showVersion() {
  const el = $('#version');
  if (!el) return;
  const sw = navigator.serviceWorker;
  if (!sw || !sw.controller) { el.textContent = 'CARDEX · offline'; return; }
  const ch = new MessageChannel();
  const t = setTimeout(() => { ch.port1.close(); }, 1200);
  ch.port1.onmessage = ev => {
    clearTimeout(t);
    if (ev.data && ev.data.version) el.textContent = `CARDEX · offline · ${ev.data.version}`;
    ch.port1.close();
  };
  try { sw.controller.postMessage({ type: 'VERSION' }, [ch.port2]); } catch {}
}
$('#setClose').addEventListener('click', () => closeSheet('#setSheet'));

async function renderUsage() {
  const u = await DB.usage();
  const photos = S.entries.reduce((a, e) => a + (e.photos || []).length, 0);
  const mb = (u.used / 1048576).toFixed(1);
  const qmb = u.quota ? (u.quota / 1048576 / 1024).toFixed(1) + ' GB' : 'unknown';
  $('#usage').innerHTML = `<strong>${photos}</strong> photos · using <strong>${mb} MB</strong>${u.quota ? ` of roughly ${qmb} available` : ''}.`;
}

$('#optHiRes').addEventListener('change', async e => {
  S.hiRes = e.target.checked;
  await DB.setMeta('hiRes', S.hiRes);
  toast(S.hiRes ? 'Photos will be sharper and larger' : 'Photos will be smaller');
});

$('#btnExport').addEventListener('click', async () => {
  if (!S.entries.length) { toast('Nothing to back up yet'); return; }
  toast('Building backup…');
  try {
    const data = await DB.exportBackup((i, n) => { if (i % 5 === 0) toast(`Packing photo ${i}/${n}…`); });
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    download(blob, `cardex-backup-${stamp()}.json`);
    hideToast();
    toast('Backup saved');
  } catch (err) { console.error(err); toast('Backup failed'); }
});

$('#btnExportCsv').addEventListener('click', () => {
  if (!S.entries.length) { toast('Nothing to export yet'); return; }
  const head = ['No', 'Make', 'Model', 'Year', 'Plate', 'Colour', 'Types', 'Rarity', 'Times spotted', 'First spotted', 'Last spotted', 'Places', 'Notes', 'Favourite'];
  const rows = S.entries.map(e => {
    const s = (e.sightings || []).slice().sort((a, b) => a.at - b.at);
    return [
      e.no, e.make, e.model, e.year || '', e.plate || '',
      (COLOUR_MAP[e.colour] || {}).label || '',
      (e.types || []).map(t => (TYPE_MAP[t] || {}).label).filter(Boolean).join(' / '),
      (RARITY_MAP[e.rarity] || {}).label || '',
      s.length,
      s.length ? fmtDate(s[0].at) : '',
      s.length ? fmtDate(s[s.length - 1].at) : '',
      s.map(x => x.place).filter(Boolean).join(' | '),
      e.notes || '', e.fav ? 'Yes' : ''
    ];
  });
  const csv = [head, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
  download(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), `cardex-${stamp()}.csv`);
  toast('Spreadsheet saved');
});

$('#btnRestore').addEventListener('click', () => $('#restoreInput').click());
$('#restoreInput').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  let data;
  try { data = JSON.parse(await f.text()); }
  catch { toast('Could not read that file'); return; }
  const mode = S.entries.length
    ? (confirm('You already have entries.\n\nOK = merge the backup into your dex\nCancel = replace everything with the backup') ? 'merge' : 'replace')
    : 'replace';
  toast('Restoring…');
  try {
    const res = await DB.importBackup(data, mode);
    S.entries = await DB.allEntries();
    invalidateEval();
    await hydrateThumbs();
    renderChips(); renderGrid(); renderSub();
    hideToast();
    toast(`Restored ${res.added} entries${res.skipped ? `, ${res.skipped} already present` : ''}`);
  } catch (err) { console.error(err); toast(err.message || 'Restore failed'); }
});

$('#btnWipe').addEventListener('click', async () => {
  if (!confirm('Delete every entry and photo? This cannot be undone.')) return;
  if (!confirm('Really sure? Export a backup first if you might regret this.')) return;
  for (const u of S.urls.values()) URL.revokeObjectURL(u);
  S.urls.clear();
  await DB.wipe();
  S.entries = [];
  invalidateEval();
  renderChips(); renderGrid(); renderSub();
  closeSheet('#setSheet');
  toast('Everything deleted');
});

/* install prompt */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  S.installEvt = e;
  $('#btnInstall').hidden = false;
  $('#installHelp').textContent = 'Add CARDEX to your home screen so it opens fullscreen like a normal app.';
});
$('#btnInstall').addEventListener('click', async () => {
  if (!S.installEvt) return;
  S.installEvt.prompt();
  await S.installEvt.userChoice;
  S.installEvt = null;
  $('#btnInstall').hidden = true;
});
if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone) {
  $('#installHelp').textContent = 'On iPhone: tap the Share button in Safari, then “Add to Home Screen”. CARDEX will then open fullscreen like a normal app.';
}

/* ═══════ HELPERS ═══════ */

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : 'x' + Date.now() + Math.random().toString(36).slice(2));
}
function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }
/* Catalogue models sometimes legitimately include the make ("DS 3",
   "MG EX181", "Mini Cooper"). Don't print it twice. */
/* The make, unless the model line already says it. */
function subMake(e) {
  const mk = String(e.make || '').trim();
  const md = String(e.model || '').trim();
  if (!md) return '';
  if (!mk) return '';
  if (md.toLowerCase().startsWith(mk.toLowerCase() + ' ') ||
      md.toLowerCase() === mk.toLowerCase()) return '';
  return mk;
}

function fullName(make, model) {
  const mk = String(make || '').trim();
  const md = String(model || '').trim();
  if (!mk) return md;
  if (!md) return mk;
  if (md.toLowerCase().startsWith(mk.toLowerCase() + ' ') ||
      md.toLowerCase() === mk.toLowerCase()) return md;
  return `${mk} ${md}`;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
/* Some type colours (maroon Hypercar, slate Diesel) are too dark to read on a
   dark chip. Lighten anything below a luminance floor before using it as text. */
function readable(hex) {
  let n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = () => 0.299 * r + 0.587 * g + 0.114 * b;
  let guard = 0;
  while (lum() < 130 && guard++ < 24) {
    r = Math.min(255, Math.round(r + (255 - r) * 0.16));
    g = Math.min(255, Math.round(g + (255 - g) * 0.16));
    b = Math.min(255, Math.round(b + (255 - b) * 0.16));
  }
  return `rgb(${r},${g},${b})`;
}
function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function stamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function csvCell(v) {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}
function haptic(p) { if (navigator.vibrate) try { navigator.vibrate(p); } catch {} }

let toastT = null;
function toast(msg, ms = 2100) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false; t.classList.remove('out');
  clearTimeout(toastT);
  toastT = setTimeout(hideToast, ms);
}
function hideToast() {
  const t = $('#toast');
  if (t.hidden) return;
  t.classList.add('out');
  setTimeout(() => { t.hidden = true; t.classList.remove('out'); }, 220);
}

/* back button closes sheets instead of leaving the app */
window.addEventListener('popstate', () => {
  const top = S.sheetStack[S.sheetStack.length - 1];
  if (top) { closeSheet(top); history.pushState({ sheet: 1 }, ''); }
});
history.pushState({ sheet: 1 }, '');
