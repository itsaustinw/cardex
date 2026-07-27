/* ═══════════════════════════════════════════
   CARDEX — achievement engine
   ~500 achievements, every one with live progress.
   Each achievement is { id, name, desc, icon, cat, goal, xp, value(s) }
   where value(s) reads a PRE-COMPUTED summary, so evaluating the whole
   set is a few hundred map lookups — fast even with thousands of cars.
   ═══════════════════════════════════════════ */

import { TYPES, TYPE_MAP, RARITIES, COLOURS } from './data.js';

/* ───────── words for generated names ───────── */
const TW = {
  hatch:     { one: 'hatchback',          many: 'hatchbacks',          icon: '🚗' },
  saloon:    { one: 'saloon',             many: 'saloons',             icon: '🚙' },
  estate:    { one: 'estate',             many: 'estates',             icon: '🚐' },
  suv:       { one: 'SUV',                many: 'SUVs',                icon: '🚙' },
  crossover: { one: 'crossover',          many: 'crossovers',          icon: '🚙' },
  coupe:     { one: 'coupé',              many: 'coupés',              icon: '🏎️' },
  convert:   { one: 'convertible',        many: 'convertibles',        icon: '🌤️' },
  sports:    { one: 'sports car',         many: 'sports cars',         icon: '🏎️' },
  super:     { one: 'supercar',           many: 'supercars',           icon: '🦸' },
  hyper:     { one: 'hypercar',           many: 'hypercars',           icon: '👽' },
  hothatch:  { one: 'hot hatch',          many: 'hot hatches',         icon: '🔥' },
  luxury:    { one: 'luxury car',         many: 'luxury cars',         icon: '🥂' },
  classic:   { one: 'classic',            many: 'classics',            icon: '🕰️' },
  jdm:       { one: 'JDM car',            many: 'JDM cars',            icon: '🗾' },
  usdm:      { one: 'American car',       many: 'American cars',       icon: '🦅' },
  ev:        { one: 'EV',                 many: 'EVs',                 icon: '⚡' },
  hybrid:    { one: 'hybrid',             many: 'hybrids',             icon: '🍃' },
  diesel:    { one: 'diesel',             many: 'diesels',             icon: '🛢️' },
  offroad:   { one: 'off-roader',         many: 'off-roaders',         icon: '⛰️' },
  van:       { one: 'van',                many: 'vans',                icon: '📦' },
  pickup:    { one: 'pickup',             many: 'pickups',             icon: '🛻' },
  mpv:       { one: 'MPV',                many: 'MPVs',                icon: '👪' },
  city:      { one: 'city car',           many: 'city cars',           icon: '🏙️' },
  modified:  { one: 'modified car',       many: 'modified cars',       icon: '🔧' },
  track:     { one: 'track car',          many: 'track cars',          icon: '🏁' },
  rally:     { one: 'rally car',          many: 'rally cars',          icon: '🌲' },
  emergency: { one: 'emergency vehicle',  many: 'emergency vehicles',  icon: '🚨' },
  commercial:{ one: 'commercial vehicle', many: 'commercial vehicles', icon: '🚛' },
  barnfind:  { one: 'barn find',          many: 'barn finds',          icon: '🚜' },
  concept:   { one: 'concept car',        many: 'concept cars',        icon: '🔮' }
};

const TIER = ['Novice', 'Regular', 'Devotee', 'Fanatic', 'Master', 'Legend', 'Immortal'];

/* Common types get a long ladder; rare ones a short, achievable one. */
const LADDER_COMMON = [1, 5, 10, 25, 50, 100, 250];
const LADDER_MID    = [1, 5, 10, 25, 50, 100];
const LADDER_RARE   = [1, 3, 5, 10, 25];

const TYPE_LADDER = {
  hatch: LADDER_COMMON, saloon: LADDER_COMMON, suv: LADDER_COMMON, estate: LADDER_COMMON,
  crossover: LADDER_COMMON, ev: LADDER_COMMON, hybrid: LADDER_COMMON, diesel: LADDER_COMMON,
  van: LADDER_COMMON, city: LADDER_COMMON, coupe: LADDER_COMMON, sports: LADDER_COMMON,
  luxury: LADDER_MID, hothatch: LADDER_MID, classic: LADDER_MID, convert: LADDER_MID,
  mpv: LADDER_MID, pickup: LADDER_MID, offroad: LADDER_MID, commercial: LADDER_MID,
  jdm: LADDER_MID, usdm: LADDER_MID, modified: LADDER_MID,
  super: LADDER_RARE, hyper: LADDER_RARE, track: LADDER_RARE, rally: LADDER_RARE,
  emergency: LADDER_RARE, barnfind: LADDER_RARE, concept: LADDER_RARE
};

function xpFor(goal) {
  if (goal <= 1) return 25;
  if (goal <= 3) return 40;
  if (goal <= 5) return 60;
  if (goal <= 10) return 110;
  if (goal <= 25) return 220;
  if (goal <= 50) return 380;
  if (goal <= 100) return 650;
  if (goal <= 250) return 1300;
  if (goal <= 500) return 2200;
  if (goal <= 1000) return 4000;
  return 8000;
}

/* ═══════════════════════════════════════════
   MODEL QUESTS — regexes tested once per unique
   "make model" string when the summary is built.
   ═══════════════════════════════════════════ */

export const MODEL_QUESTS = {
  f40:        /\bf40\b/i,
  f50:        /\bf50\b/i,
  enzo:       /\benzo\b/i,
  laferrari:  /\blaferrari\b/i,
  testarossa: /\btestarossa\b/i,
  p1:         /\bp1\b/i,
  f1road:     /mclaren\s+f1\b/i,
  senna:      /\bsenna\b/i,
  n918:       /\b918\b/i,
  carreragt:  /\bcarrera\s*gt\b/i,
  veyron:     /\bveyron\b/i,
  chiron:     /\bchiron\b/i,
  zonda:      /\bzonda\b/i,
  huayra:     /\bhuayra\b/i,
  utopia:     /\butopia\b/i,
  agera:      /\bagera\b/i,
  jesko:      /\bjesko\b/i,
  regera:     /\bregera\b/i,
  valkyrie:   /\bvalkyrie\b/i,
  countach:   /\bcountach\b/i,
  miura:      /\bmiura\b/i,
  diablo:     /\bdiablo\b/i,
  murcielago: /murci[ée]lago/i,
  aventador:  /\baventador\b/i,
  huracan:    /hurac[áa]n/i,
  gallardo:   /\bgallardo\b/i,
  urus:       /\burus\b/i,
  xj220:      /\bxj220\b/i,
  etype:      /\be-?type\b/i,
  dbfive:     /\bdb5\b/i,
  db9:        /\bdb9\b/i,
  db11:       /\bdb11\b/i,
  vantage:    /\bvantage\b/i,
  esprit:     /\besprit\b/i,
  elise:      /\belise\b/i,
  exige:      /\bexige\b/i,
  emira:      /\bemira\b/i,
  evija:      /\bevija\b/i,
  gt40:       /\bgt40\b/i,
  fordgt:     /ford\s+gt\b/i,
  delorean:   /\b(dmc-?12|delorean)\b/i,
  stratos:    /\bstratos\b/i,
  integrale:  /\bintegrale\b/i,
  quattro:    /audi\s+quattro|\bur-?quattro\b/i,
  rs200:      /\brs200\b/i,
  t16:        /\b205\s*t16\b/i,
  cossie:     /\b(rs\s*cosworth|sierra\s*cosworth|escort\s*cosworth)\b/i,
  skyline:    /\bskyline\b/i,
  r32:        /\br32\b/i,
  r33:        /\br33\b/i,
  r34:        /\br34\b/i,
  gtr:        /\bgt-?r\b/i,
  supra:      /\bsupra\b/i,
  rx7:        /\brx-?7\b/i,
  rx8:        /\brx-?8\b/i,
  nsx:        /\bnsx\b/i,
  s2000:      /\bs2000\b/i,
  evo:        /\bevo\s?(i{1,3}v?|[0-9]|x)\b|lancer\s+evo/i,
  sti:        /\b(wrx\s*sti|impreza\s*sti|\bsti\b)/i,
  mx5:        /\bmx-?5\b/i,
  mr2:        /\bmr-?2\b/i,
  celica:     /\bcelica\b/i,
  silvia:     /\bsilvia\b/i,
  ae86:       /\b(ae86|\b86\b|gr86|brz)\b/i,
  civictyper: /civic\s+type\s*r/i,
  gtigolf:    /golf\s+gti/i,
  golfr:      /golf\s+r\b/i,
  gti205:     /\b205\s+gti\b/i,
  clioW:      /clio\s+williams/i,
  meganers:   /m[ée]gane\s+r\.?s\.?/i,
  focusrs:    /focus\s+rs/i,
  fiestast:   /fiesta\s+st/i,
  corsavxr:   /corsa\s+vxr/i,
  m3:         /\bm3\b/i,
  m5:         /\bm5\b/i,
  e30:        /\be30\b/i,
  e46:        /\be46\b/i,
  rs6:        /\brs6\b/i,
  rs4:        /\brs4\b/i,
  amggt:      /\bamg\s*gt\b/i,
  c63:        /\bc63\b/i,
  g63:        /\bg63\b|\bg-?wagon\b/i,
  n911:       /\b911\b/i,
  gt3:        /\bgt3\b/i,
  gt2rs:      /\bgt2\s*rs\b/i,
  turbo930:   /\b930\b/i,
  n959:       /\b959\b/i,
  cayman:     /\bcayman\b/i,
  taycan:     /\btaycan\b/i,
  modelS:     /model\s*s\b/i,
  cybertruck: /\bcybertruck\b/i,
  roadster:   /tesla\s+roadster/i,
  defender:   /\bdefender\b/i,
  serieslr:   /series\s+i{1,3}\b/i,
  wrangler:   /\bwrangler\b/i,
  gwagen:     /\bg-?class\b/i,
  landcruiser:/land\s*cruiser/i,
  hilux:      /\bhilux\b/i,
  minicl:     /classic\s+mini|\bmini\s+cooper\b/i,
  beetle:     /\bbeetle\b/i,
  campervan:  /\b(camper|westfalia|t2\b|t25\b|transporter)\b/i,
  n2cv:       /\b2cv\b/i,
  fiat500:    /\bfiat\s*500\b|\b500\b/i,
  trabant:    /\btrabant\b/i,
  lada:       /\blada\b/i,
  reliant:    /\b(robin|reliant)\b/i,
  hummerh1:   /\bh1\b/i,
  spitfire:   /\bspitfire\b/i,
  stag:       /\bstag\b/i,
  mgb:        /\bmgb\b/i,
  morrisminor:/morris\s+minor/i,
  phantom:    /\bphantom\b/i,
  cullinan:   /\bcullinan\b/i,
  bentayga:   /\bbentayga\b/i,
  contigt:    /continental\s+gt/i,
  maybachs:   /\bmaybach\b/i,
  smart:      /\bfortwo\b|\bsmart\b/i,
  ami:        /\bami\b/i,
  twizy:      /\btwizy\b/i,
  caterham:   /\bseven\b|\bcaterham\b/i,
  ariel:      /\batom\b/i,
  xbow:       /\bx-?bow\b/i,
  morgan3:    /\b3\s*wheeler\b|super\s*3/i,
  nevera:     /\bnevera\b/i,
  battista:   /\bbattista\b/i,
  rimacc2:    /\bconcept\s*(one|two)\b/i,
  amgone:     /\bamg\s*one\b/i,
  speedtail:  /\bspeedtail\b/i,
  valour:     /\bvalour\b/i,
  revuelto:   /\brevuelto\b/i,
  sf90:       /\bsf90\b/i,
  purosangue: /\bpurosangue\b/i,
  tourbillon: /\btourbillon\b/i,
  ioniq5n:    /ioniq\s*5\s*n/i,
  cyberster:  /\bcyberster\b/i,
  emeya:      /\bemeya\b/i
};

/* ═══════════════════════════════════════════
   SUMMARY — one pass over the dex
   ═══════════════════════════════════════════ */

export function buildSummary(entries) {
  const s = {
    n: entries.length,
    sightings: 0,
    photos: 0,
    types: {}, rarity: {}, makes: {}, colours: {}, decades: {}, model: {},
    makeSet: new Set(),
    favs: 0, withPlate: 0, withNotes: 0, withPlace: 0, withGeo: 0, withPhoto: 0,
    maxSightings: 0, maxPhotos: 0,
    oldest: null, newest: null,
    places: new Set(), days: new Set(), months: new Set(), years: new Set(),
    hours: {}, weekend: 0, night: 0, dawn: 0,
    perfect: 0, zeroStat: 0, loudest: 0, mint: 0,
    longestNote: 0, uniqueModels: new Set(),
    bestDay: 0, streak: 0
  };

  const dayCounts = {};
  const names = new Set();

  for (const e of entries) {
    (e.types || []).forEach(t => s.types[t] = (s.types[t] || 0) + 1);
    s.rarity[e.rarity] = (s.rarity[e.rarity] || 0) + 1;
    if (e.make) { s.makes[e.make] = (s.makes[e.make] || 0) + 1; s.makeSet.add(e.make.toLowerCase()); }
    if (e.colour) s.colours[e.colour] = (s.colours[e.colour] || 0) + 1;
    if (e.fav) s.favs++;
    if (e.plate) s.withPlate++;
    if (e.notes) { s.withNotes++; s.longestNote = Math.max(s.longestNote, e.notes.length); }

    const np = (e.photos || []).length;
    s.photos += np;
    if (np) s.withPhoto++;
    s.maxPhotos = Math.max(s.maxPhotos, np);

    const y = Number(e.year);
    if (y && y > 1885 && y < 2100) {
      s.years.add(y);
      const dec = Math.floor(y / 10) * 10;
      s.decades[dec] = (s.decades[dec] || 0) + 1;
      if (!s.oldest || y < s.oldest) s.oldest = y;
      if (!s.newest || y > s.newest) s.newest = y;
    }

    const st = e.stats || {};
    const vals = ['presence', 'style', 'sound', 'condition'].map(k => st[k] ?? 5);
    if (vals.every(v => v === 10)) s.perfect++;
    if (vals.some(v => v === 0)) s.zeroStat++;
    if ((st.sound ?? 5) === 10) s.loudest++;
    if ((st.condition ?? 5) === 10) s.mint++;

    const sg = e.sightings || [];
    s.sightings += sg.length;
    s.maxSightings = Math.max(s.maxSightings, sg.length);
    for (const x of sg) {
      if (x.place) { s.withPlace++; s.places.add(x.place.trim().toLowerCase()); }
      if (x.geo) s.withGeo++;
      if (x.at) {
        const d = new Date(x.at);
        const key = d.toISOString().slice(0, 10);
        s.days.add(key);
        dayCounts[key] = (dayCounts[key] || 0) + 1;
        s.months.add(key.slice(0, 7));
        const h = d.getHours();
        s.hours[h] = (s.hours[h] || 0) + 1;
        const dow = d.getDay();
        if (dow === 0 || dow === 6) s.weekend++;
        if (h >= 22 || h < 5) s.night++;
        if (h >= 5 && h < 8) s.dawn++;
      }
    }

    const nm = `${e.make || ''} ${e.model || ''}`.trim();
    if (nm) { names.add(nm); s.uniqueModels.add(nm.toLowerCase()); }
  }

  s.bestDay = Object.values(dayCounts).reduce((m, v) => Math.max(m, v), 0);

  // longest run of consecutive days with at least one spot
  const sortedDays = [...s.days].sort();
  let run = 0, best = 0, prev = null;
  for (const d of sortedDays) {
    const t = Date.parse(d + 'T00:00:00Z');
    run = (prev !== null && t - prev === 86400000) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  s.streak = best;

  // model quests — tested once per unique name, not per entry
  for (const key in MODEL_QUESTS) s.model[key] = 0;
  for (const nm of names) {
    for (const key in MODEL_QUESTS) if (MODEL_QUESTS[key].test(nm)) s.model[key]++;
  }

  s.typeCount = Object.keys(s.types).length;
  s.makeCount = Object.keys(s.makes).length;
  s.colourCount = Object.keys(s.colours).length;
  s.decadeCount = Object.keys(s.decades).length;
  s.placeCount = s.places.size;
  s.dayCount = s.days.size;
  s.monthCount = s.months.size;
  s.modelCount = s.uniqueModels.size;
  s.topMake = Object.entries(s.makes).sort((a, b) => b[1] - a[1])[0] || null;

  s.has = (make) => s.makeSet.has(make.toLowerCase()) ? 1 : 0;
  s.hasAll = (list) => list.filter(m => s.makeSet.has(m.toLowerCase())).length;
  s.hasModels = (keys) => keys.filter(k => (s.model[k] || 0) > 0).length;
  return s;
}

/* ═══════════════════════════════════════════
   CATEGORIES
   ═══════════════════════════════════════════ */

export const CATS = [
  { id: 'collection', label: 'Collection', icon: '📚' },
  { id: 'types',      label: 'Types',      icon: '🚗' },
  { id: 'rarity',     label: 'Rarity',     icon: '💎' },
  { id: 'makes',      label: 'Makes',      icon: '🏭' },
  { id: 'quests',     label: 'Quests',     icon: '🗺️' },
  { id: 'colours',    label: 'Colours',    icon: '🎨' },
  { id: 'era',        label: 'Eras',       icon: '🕰️' },
  { id: 'field',      label: 'Fieldwork',  icon: '🥾' },
  { id: 'oddball',    label: 'Oddball',    icon: '🎲' }
];

/* ═══════════════════════════════════════════
   BUILD THE LIST
   ═══════════════════════════════════════════ */

const A = [];
const add = (o) => { A.push(o); return o; };

/* ── 1. Collection totals ───────────────── */
const DEX_TIERS = [
  [1, 'Ignition', '🔑'], [5, 'Warming Up', '🌡️'], [10, 'Getting Going', '🔟'],
  [25, 'Quarter Ton', '📦'], [50, 'Half Century', '🏏'], [100, 'Centurion', '💯'],
  [150, 'Sesquicentury', '📈'], [200, 'Double Ton', '🎯'], [250, 'Quarter Grand', '🎖️'],
  [300, 'Three Hundred', '🛡️'], [400, 'Four Hundred', '🏅'], [500, 'Half a Grand', '🏆'],
  [750, 'Seven-Fifty', '👑'], [1000, 'Four Figures', '🌟'], [1500, 'Fifteen Hundred', '💫'],
  [2000, 'Two Thousand', '🚀'], [3000, 'Three Thousand', '🌌'], [5000, 'Five Thousand', '🌌'],
  [7500, 'Seven-Five', '🔭'], [10000, 'Ten Thousand', '♾️']
];
DEX_TIERS.forEach(([goal, name, icon]) => add({
  id: `dex_${goal}`, name, icon, cat: 'collection',
  desc: `Log ${goal.toLocaleString()} ${goal === 1 ? 'car' : 'cars'} in your dex`,
  goal, xp: xpFor(goal), value: s => s.n
}));

[[10, 'Snap Happy', '📸'], [50, 'Shutterbug', '🎞️'], [100, 'Photographer', '🖼️'],
 [250, 'Photojournalist', '📰'], [500, 'Archivist', '🗄️'], [1000, 'Photo Library', '📚'],
 [2500, 'Image Bank', '🏦'], [5000, 'Visual Historian', '🎬']
].forEach(([goal, name, icon]) => add({
  id: `pho_${goal}`, name, icon, cat: 'collection',
  desc: `Take ${goal.toLocaleString()} photos`, goal, xp: xpFor(goal), value: s => s.photos
}));

[[10, 'Ten Spots', '👀'], [50, 'Fifty Spots', '🔍'], [100, 'Hundred Spots', '🕵️'],
 [500, 'Five Hundred Spots', '📡'], [1000, 'Thousand Spots', '🛰️'], [5000, 'Eagle Eye', '🦅']
].forEach(([goal, name, icon]) => add({
  id: `sig_${goal}`, name, icon, cat: 'collection',
  desc: `Log ${goal.toLocaleString()} total sightings`, goal, xp: xpFor(goal), value: s => s.sightings
}));

[[5, 'Variety Pack', '🎁'], [25, 'Broad Church', '⛪'], [100, 'Model Citizen', '🏛️'],
 [500, 'Encyclopaedic', '📖'], [1000, 'Total Recall', '🧠']
].forEach(([goal, name, icon]) => add({
  id: `mdl_${goal}`, name, icon, cat: 'collection',
  desc: `Log ${goal} different models`, goal, xp: xpFor(goal), value: s => s.modelCount
}));

[[5, 'Starred', '⭐'], [25, 'Curated', '🌠'], [100, 'Hall of Fame', '🏛️']
].forEach(([goal, name, icon]) => add({
  id: `fav_${goal}`, name, icon, cat: 'collection',
  desc: `Favourite ${goal} entries`, goal, xp: xpFor(goal), value: s => s.favs
}));

/* ── 2. Per-type ladders ────────────────── */
for (const t of TYPES) {
  const w = TW[t.id]; if (!w) continue;
  const ladder = TYPE_LADDER[t.id] || LADDER_MID;
  ladder.forEach((goal, i) => {
    const name = goal === 1
      ? `First ${w.one.replace(/^./, c => c.toUpperCase())}`
      : `${t.label} ${TIER[i - 1] || 'Immortal'}`;
    add({
      id: `typ_${t.id}_${goal}`, name, icon: w.icon, cat: 'types',
      desc: goal === 1 ? `Log your first ${w.one}` : `Log ${goal} ${w.many}`,
      goal, xp: xpFor(goal), colour: t.colour,
      value: s => s.types[t.id] || 0
    });
  });
}

[[5, 'Jack of Five Trades', '🃏'], [10, 'Ten Disciplines', '🎓'], [15, 'Fifteen Fields', '🧭'],
 [20, 'Twenty Types', '🗂️'], [25, 'Twenty-Five Types', '🧩'], [30, 'Every Type Going', '🌈']
].forEach(([goal, name, icon]) => add({
  id: `tyc_${goal}`, name, icon, cat: 'types',
  desc: `Cover ${goal} different types`, goal, xp: xpFor(goal) * 2, value: s => s.typeCount
}));

/* ── 3. Rarity ladders ──────────────────── */
const RAR_LADDER = {
  common:    [1, 10, 50, 100, 250, 500],
  uncommon:  [1, 10, 50, 100, 250],
  rare:      [1, 5, 25, 50, 100],
  epic:      [1, 3, 10, 25, 50],
  legendary: [1, 2, 5, 10, 25]
};
const RAR_ICON = { common: '⚪', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡' };
for (const r of RARITIES) {
  (RAR_LADDER[r.id] || [1, 5, 10]).forEach((goal, i) => {
    add({
      id: `rar_${r.id}_${goal}`,
      name: goal === 1 ? `First ${r.label}` : `${r.label} ${TIER[i - 1] || 'Immortal'}`,
      icon: RAR_ICON[r.id], cat: 'rarity', colour: r.colour,
      desc: goal === 1 ? `Log your first ${r.label} car` : `Log ${goal} ${r.label} cars`,
      goal, xp: xpFor(goal) + (r.xp / 2 | 0), value: s => s.rarity[r.id] || 0
    });
  });
}
add({ id: 'rar_allone', name: 'Full House', icon: '🎰', cat: 'rarity',
  desc: 'Log at least one car of every rarity', goal: 5, xp: 500,
  value: s => RARITIES.filter(r => (s.rarity[r.id] || 0) > 0).length });
add({ id: 'rar_epicplus10', name: 'Exotic Taste', icon: '💜', cat: 'rarity',
  desc: 'Log 10 Epic-or-better cars', goal: 10, xp: 600,
  value: s => (s.rarity.epic || 0) + (s.rarity.legendary || 0) });
add({ id: 'rar_epicplus50', name: 'Rich Tastes', icon: '💎', cat: 'rarity',
  desc: 'Log 50 Epic-or-better cars', goal: 50, xp: 1800,
  value: s => (s.rarity.epic || 0) + (s.rarity.legendary || 0) });

/* ── 4. Per-make ladders ────────────────── */
const MAKE_TIERS = {
  volume: [1, 10, 25, 50, 100],
  normal: [1, 5, 15, 40],
  rare:   [1, 3, 10],
  exotic: [1, 2, 5]
};
const MAKE_LIST = [
  ['Ford', 'volume', '🔵'], ['Vauxhall', 'volume', '🦅'], ['Volkswagen', 'volume', '🔩'],
  ['BMW', 'volume', '🔷'], ['Mercedes-Benz', 'volume', '⭐'], ['Audi', 'volume', '⭕'],
  ['Toyota', 'volume', '🔴'], ['Nissan', 'volume', '🌀'], ['Honda', 'volume', '🏁'],
  ['Peugeot', 'volume', '🦁'], ['Renault', 'volume', '💠'], ['Citroën', 'volume', '⌃'],
  ['Kia', 'volume', '🟥'], ['Hyundai', 'volume', '🏁'], ['Škoda', 'volume', '🏹'],
  ['SEAT', 'normal', '🇪🇸'], ['Volvo', 'normal', '🛡️'], ['Mazda', 'normal', '🌊'],
  ['Mini', 'normal', '🇬🇧'], ['Land Rover', 'normal', '🏔️'], ['Fiat', 'normal', '🇮🇹'],
  ['Suzuki', 'normal', '🏍️'], ['Mitsubishi', 'normal', '🔻'], ['Dacia', 'normal', '⛰️'],
  ['MG', 'normal', '🐙'], ['Tesla', 'normal', '⚡'], ['Jaguar', 'normal', '🐆'],
  ['Lexus', 'normal', '🎌'], ['Subaru', 'normal', '✨'], ['Jeep', 'normal', '🏕️'],
  ['Porsche', 'rare', '🐎'], ['Alfa Romeo', 'rare', '🐍'], ['Abarth', 'rare', '🦂'],
  ['Cupra', 'rare', '🥉'], ['Polestar', 'rare', '⭐'], ['Smart', 'rare', '🤏'],
  ['Ferrari', 'exotic', '🐎'], ['Lamborghini', 'exotic', '🐂'], ['McLaren', 'exotic', '🧡'],
  ['Aston Martin', 'exotic', '🕴️'], ['Bentley', 'exotic', '👼'], ['Rolls-Royce', 'exotic', '👑'],
  ['Maserati', 'exotic', '🔱'], ['Lotus', 'exotic', '🌸'], ['Bugatti', 'exotic', '🐘'],
  ['Koenigsegg', 'exotic', '👻'], ['Pagani', 'exotic', '🌬️'], ['Morgan', 'exotic', '🌳'],
  ['TVR', 'exotic', '🐉'], ['Caterham', 'exotic', '🕊️']
];
const MAKE_TIER_NAME = ['Spotter', 'Fan', 'Faithful', 'Fanatic', 'Obsessive'];
for (const [make, band, icon] of MAKE_LIST) {
  MAKE_TIERS[band].forEach((goal, i) => add({
    id: `mk_${make.replace(/\W/g, '')}_${goal}`,
    name: `${make} ${MAKE_TIER_NAME[i] || 'Obsessive'}`,
    icon, cat: 'makes',
    desc: goal === 1 ? `Log a ${make}` : `Log ${goal} ${make}s`,
    goal, xp: xpFor(goal), value: s => s.makes[make] || 0
  }));
}
[[5, 'Five Badges', '🏷️'], [10, 'Ten Badges', '🎫'], [20, 'Cosmopolitan', '🌍'],
 [30, 'Thirty Marques', '🗺️'], [50, 'Fifty Marques', '🧳'], [75, 'Badge Collector', '🎖️'],
 [100, 'The Whole Grid', '🏁']
].forEach(([goal, name, icon]) => add({
  id: `mkc_${goal}`, name, icon, cat: 'makes',
  desc: `Log ${goal} different manufacturers`, goal, xp: xpFor(goal) * 2, value: s => s.makeCount
}));

/* ── 5. Make-set quests ─────────────────── */
const MAKE_SETS = [
  ['q_big3', 'The Big Three', '👑', 'Photograph a Koenigsegg, a Bugatti and a Pagani', ['Koenigsegg', 'Bugatti', 'Pagani'], 5000],
  ['q_german3', 'German Big Three', '🇩🇪', 'Log a BMW, a Mercedes-Benz and an Audi', ['BMW', 'Mercedes-Benz', 'Audi'], 300],
  ['q_italy', 'Italian Job', '🇮🇹', 'Log a Ferrari, Lamborghini, Maserati and Alfa Romeo', ['Ferrari', 'Lamborghini', 'Maserati', 'Alfa Romeo'], 1800],
  ['q_britpack', 'Brit Pack', '🇬🇧', 'Log a Jaguar, Land Rover, Aston Martin, Bentley and Rolls-Royce', ['Jaguar', 'Land Rover', 'Aston Martin', 'Bentley', 'Rolls-Royce'], 2000],
  ['q_jpn7', 'Japanese Seven', '🇯🇵', 'Log a Toyota, Nissan, Honda, Mazda, Subaru, Mitsubishi and Suzuki', ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki'], 900],
  ['q_korea', 'Korean Wave', '🇰🇷', 'Log a Hyundai, a Kia and a Genesis', ['Hyundai', 'Kia', 'Genesis'], 600],
  ['q_france', 'French Connection', '🇫🇷', 'Log a Renault, Peugeot, Citroën, DS and Alpine', ['Renault', 'Peugeot', 'Citroën', 'DS', 'Alpine'], 800],
  ['q_sweden', 'Nordic Noir', '🇸🇪', 'Log a Volvo, Saab, Polestar and Koenigsegg', ['Volvo', 'Saab', 'Polestar', 'Koenigsegg'], 1500],
  ['q_vag', 'The VAG Empire', '🏰', 'Log a VW, Audi, Škoda, SEAT, Porsche, Lamborghini and Bentley', ['Volkswagen', 'Audi', 'Škoda', 'SEAT', 'Porsche', 'Lamborghini', 'Bentley'], 2200],
  ['q_stellantis', 'Stellantis Sweep', '🌌', 'Log a Peugeot, Citroën, Fiat, Vauxhall, Jeep, Alfa Romeo and DS', ['Peugeot', 'Citroën', 'Fiat', 'Vauxhall', 'Jeep', 'Alfa Romeo', 'DS'], 1200],
  ['q_usa', 'Stars and Stripes', '🇺🇸', 'Log a Ford, Chevrolet, Dodge, Jeep and Cadillac', ['Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Cadillac'], 900],
  ['q_china', 'New Wave', '🇨🇳', 'Log a BYD, Xpeng, Omoda, Maxus or Great Wall — any four', ['BYD', 'Xpeng', 'Omoda', 'Maxus', 'Great Wall', 'JAC'], 800, 4],
  ['q_leyland', 'British Leyland', '🔧', 'Log an Austin, Morris, Rover, Triumph and MG', ['Austin', 'Morris', 'Rover', 'Triumph', 'MG'], 1600],
  ['q_supercars', 'Supercar Row', '🦸', 'Log a Ferrari, Lamborghini, McLaren, Porsche and Aston Martin', ['Ferrari', 'Lamborghini', 'McLaren', 'Porsche', 'Aston Martin'], 1500],
  ['q_hyperclub', 'Hypercar Club', '👽', 'Log a Bugatti, Koenigsegg, Pagani, Rimac and McLaren', ['Bugatti', 'Koenigsegg', 'Pagani', 'Rimac', 'McLaren'], 6000],
  ['q_luxury', 'Old Money', '🥂', 'Log a Rolls-Royce, Bentley and Maybach', ['Rolls-Royce', 'Bentley', 'Maybach'], 2500],
  ['q_kitcar', 'Kit and Caboodle', '🔩', 'Log a Caterham, Westfield, Radical or Zenos — any three', ['Caterham', 'Westfield', 'Radical', 'Zenos', 'KTM'], 1800, 3],
  ['q_evbrands', 'Electric Avenue', '⚡', 'Log a Tesla, Polestar, BYD, Rimac and Fisker', ['Tesla', 'Polestar', 'BYD', 'Rimac', 'Fisker'], 1400],
  ['q_vans', 'Fleet Manager', '🚚', 'Log a Transit, Sprinter, Ducato and Transporter maker set', ['Ford', 'Mercedes-Benz', 'Fiat', 'Volkswagen', 'Iveco'], 500],
  ['q_lorry', 'Big Rigs', '🚛', 'Log a Scania, MAN and Iveco', ['Scania', 'MAN', 'Iveco'], 900],
  ['q_eastern', 'Eastern Bloc', '☭', 'Log a Lada, Škoda and Dacia', ['Lada', 'Škoda', 'Dacia'], 1000],
  ['q_defunct', 'Gone But Not Forgotten', '⚰️', 'Log a Saab, Rover, Daewoo, Talbot or Austin — any four', ['Saab', 'Rover', 'Daewoo', 'Talbot', 'Austin', 'Morris', 'Triumph'], 2000, 4],
  ['q_threewheel', 'Three Wheels Good', '🛺', 'Log a Reliant or a Morgan', ['Reliant', 'Morgan'], 1500, 1],
  ['q_hotbrands', 'Warm Hatch Club', '🔥', 'Log an Abarth, Cupra and Alpine', ['Abarth', 'Cupra', 'Alpine'], 900],
  ['q_tuners', 'Tuner Houses', '🛠️', 'Log an Alpina, Abarth, Cupra or Polestar — any three', ['Alpina', 'Abarth', 'Cupra', 'Polestar'], 1200, 3]
];
for (const [id, name, icon, desc, list, xp, need] of MAKE_SETS) {
  const goal = need || list.length;
  add({ id, name, icon, cat: 'quests', desc, goal, xp, value: s => s.hasAll(list) });
}

/* ── 6. Model quests ────────────────────── */
const MODEL_SETS = [
  ['q_trinity', 'The Holy Trinity', '🙏', 'Photograph a McLaren P1, Ferrari LaFerrari and Porsche 918', ['p1', 'laferrari', 'n918'], 8000],
  ['q_ferrariflag', 'Maranello Flagships', '🐎', 'Log an F40, F50, Enzo and LaFerrari', ['f40', 'f50', 'enzo', 'laferrari'], 7000],
  ['q_bullpen', 'Raging Bulls', '🐂', 'Log a Countach, Diablo, Murciélago, Aventador and Revuelto', ['countach', 'diablo', 'murcielago', 'aventador', 'revuelto'], 5000],
  ['q_wedge', 'Wedge Era', '📐', 'Log a Countach, Stratos, Esprit or DeLorean — any three', ['countach', 'stratos', 'esprit', 'delorean'], 3500, 3],
  ['q_jdmgrail', 'JDM Holy Grail', '🗾', 'Log a Skyline, Supra, RX-7, NSX and Evo', ['skyline', 'supra', 'rx7', 'nsx', 'evo'], 4000],
  ['q_skylines', 'Godzilla Lineage', '🦖', 'Log an R32, R33 and R34 Skyline', ['r32', 'r33', 'r34'], 5000],
  ['q_groupb', 'Group B Survivors', '🌲', 'Log a Delta Integrale, Quattro, RS200 or 205 T16 — any two', ['integrale', 'quattro', 'rs200', 't16'], 4500, 2],
  ['q_hothatch', 'Hot Hatch Royalty', '🔥', 'Log a Golf GTI, 205 GTI, Clio Williams and Integrale', ['gtigolf', 'gti205', 'clioW', 'integrale'], 2500],
  ['q_stclub', 'Fast Ford Club', '🔵', 'Log a Fiesta ST, Focus RS and an RS Cosworth', ['fiestast', 'focusrs', 'cossie'], 2000],
  ['q_mpower', 'M Division', '🔷', 'Log an M3, M5 and an E30', ['m3', 'm5', 'e30'], 1500],
  ['q_amg', 'Affalterbach', '⭐', 'Log an AMG GT, C63 and G63', ['amggt', 'c63', 'g63'], 1500],
  ['q_rsaudi', 'Ingolstadt Rockets', '⭕', 'Log an RS4, RS6 and a Quattro', ['rs4', 'rs6', 'quattro'], 1800],
  ['q_porsche', 'Zuffenhausen Set', '🐎', 'Log a 911, GT3, Cayman and Taycan', ['n911', 'gt3', 'cayman', 'taycan'], 1500],
  ['q_aircooled', 'Air-Cooled Era', '💨', 'Log a 930, 959 or classic Beetle — any two', ['turbo930', 'n959', 'beetle'], 3000, 2],
  ['q_bond', 'Licence to Spot', '🕴️', 'Log a DB5, Esprit and a classic Mini', ['dbfive', 'esprit', 'minicl'], 4000],
  ['q_movie', 'Movie Stars', '🎬', 'Log a DeLorean, GT40 and Mustang-era Ford GT', ['delorean', 'gt40', 'fordgt'], 5000],
  ['q_lemans', 'Le Mans Legends', '🏁', 'Log a GT40, Ford GT or XJ220 — any two', ['gt40', 'fordgt', 'xj220'], 4500, 2],
  ['q_britsports', 'British Sports Cars', '🇬🇧', 'Log an E-Type, Elise, MGB and Spitfire', ['etype', 'elise', 'mgb', 'spitfire'], 3000],
  ['q_lotus', 'Hethel Lightweights', '🌸', 'Log an Elise, Exige, Emira and Evija', ['elise', 'exige', 'emira', 'evija'], 3500],
  ['q_astons', 'Gaydon Grand Tourers', '🕴️', 'Log a DB9, DB11 and Vantage', ['db9', 'db11', 'vantage'], 2000],
  ['q_peoplecar', "People's Cars", '👪', 'Log a Beetle, 2CV, Fiat 500 and classic Mini', ['beetle', 'n2cv', 'fiat500', 'minicl'], 3000],
  ['q_offroad', 'Green Laning', '⛰️', 'Log a Defender, Wrangler, G-Class and Land Cruiser', ['defender', 'wrangler', 'gwagen', 'landcruiser'], 2500],
  ['q_overland', 'Overlanders', '🧭', 'Log a Hilux, Land Cruiser and a Land Rover Series', ['hilux', 'landcruiser', 'serieslr'], 2500],
  ['q_rotary', 'Rotary Club', '🔄', 'Log an RX-7 and an RX-8', ['rx7', 'rx8'], 2500],
  ['q_vtec', 'VTEC Just Kicked In', '🏁', 'Log a Civic Type R, S2000 and NSX', ['civictyper', 's2000', 'nsx'], 2500],
  ['q_driftmiss', 'Drift Missiles', '💨', 'Log a Silvia, 86/BRZ and an E46', ['silvia', 'ae86', 'e46'], 2500],
  ['q_roadster', 'Roof Down', '🌤️', 'Log an MX-5, Elise and Boxster-era Cayman', ['mx5', 'elise', 'cayman'], 1800],
  ['q_microcar', 'Tiny Terrors', '🤏', 'Log a Smart, Ami or Twizy — any two', ['smart', 'ami', 'twizy'], 1500, 2],
  ['q_trackday', 'Trackday Toys', '🏁', 'Log a Caterham, Atom or X-Bow — any two', ['caterham', 'ariel', 'xbow'], 3000, 2],
  ['q_evhalo', 'Electric Halo', '⚡', 'Log a Nevera, Battista, Evija or Taycan — any two', ['nevera', 'battista', 'evija', 'taycan'], 4000, 2],
  ['q_modernhyper', 'New Gods', '👽', 'Log an AMG ONE, Speedtail, Jesko or Tourbillon — any two', ['amgone', 'speedtail', 'jesko', 'tourbillon'], 7000, 2],
  ['q_rollers', 'Spirit of Ecstasy', '👑', 'Log a Phantom and a Cullinan', ['phantom', 'cullinan'], 3000],
  ['q_suvexotic', 'Exotic SUVs', '🏔️', 'Log an Urus, Bentayga, Cullinan and Purosangue', ['urus', 'bentayga', 'cullinan', 'purosangue'], 5000],
  ['q_camper', 'Van Life', '🏕️', 'Log a camper or Transporter', ['campervan'], 800],
  ['q_oddballs', 'Proper Oddballs', '🎲', 'Log a Reliant, Trabant or Lada — any two', ['reliant', 'trabant', 'lada'], 3000, 2],
  ['q_teslafull', 'Full Tesla House', '⚡', 'Log a Model S, Cybertruck and Roadster', ['modelS', 'cybertruck', 'roadster'], 4000],
  ['q_gtrs', 'GT-R Badge Hunt', '🌀', 'Log a GT-R-badged car', ['gtr'], 2000, 1],
  ['q_newuk', 'Modern Britain', '🇬🇧', 'Log an Emeya, Cyberster or Ioniq 5 N — any two', ['emeya', 'cyberster', 'ioniq5n'], 2500, 2]
];
for (const [id, name, icon, desc, keys, xp, need] of MODEL_SETS) {
  const goal = need || keys.length;
  add({ id, name, icon, cat: 'quests', desc, goal, xp, value: s => s.hasModels(keys) });
}

/* individual grail cars — one achievement each */
const GRAILS = [
  ['f40', 'Ferrari F40', '🐎', 3000], ['f50', 'Ferrari F50', '🐎', 3500],
  ['enzo', 'Ferrari Enzo', '🐎', 4000], ['laferrari', 'LaFerrari', '🐎', 4500],
  ['testarossa', 'Testarossa', '🕶️', 1500], ['p1', 'McLaren P1', '🧡', 4500],
  ['f1road', 'McLaren F1', '🧡', 9000], ['senna', 'McLaren Senna', '🧡', 4000],
  ['n918', 'Porsche 918', '🐎', 4500], ['carreragt', 'Carrera GT', '🐎', 5000],
  ['veyron', 'Bugatti Veyron', '🐘', 5000], ['chiron', 'Bugatti Chiron', '🐘', 5500],
  ['zonda', 'Pagani Zonda', '🌬️', 6000], ['huayra', 'Pagani Huayra', '🌬️', 6000],
  ['jesko', 'Koenigsegg Jesko', '👻', 7000], ['regera', 'Koenigsegg Regera', '👻', 7000],
  ['valkyrie', 'Aston Valkyrie', '🕴️', 7500], ['countach', 'Lamborghini Countach', '🐂', 4000],
  ['miura', 'Lamborghini Miura', '🐂', 6500], ['xj220', 'Jaguar XJ220', '🐆', 5000],
  ['etype', 'Jaguar E-Type', '🐆', 2000], ['gt40', 'Ford GT40', '🔵', 6000],
  ['delorean', 'DeLorean DMC-12', '🚀', 3000], ['stratos', 'Lancia Stratos', '🌲', 6000],
  ['r34', 'Skyline R34', '🌀', 3000], ['nsx', 'Honda NSX', '🏁', 2000],
  ['n959', 'Porsche 959', '🐎', 7000], ['gt2rs', 'Porsche GT2 RS', '🐎', 2500],
  ['nevera', 'Rimac Nevera', '⚡', 6000], ['amgone', 'Mercedes-AMG ONE', '⭐', 7500],
  ['speedtail', 'McLaren Speedtail', '🧡', 6500], ['hummerh1', 'Hummer H1', '🎖️', 2500],
  ['morrisminor', 'Morris Minor', '☕', 1200], ['n2cv', 'Citroën 2CV', '🥖', 1500],
  ['trabant', 'Trabant', '☭', 4000], ['ariel', 'Ariel Atom', '🔩', 3000],
  ['xbow', 'KTM X-Bow', '🔩', 3000], ['maybachs', 'A Maybach', '🥂', 2000],
  ['purosangue', 'Ferrari Purosangue', '🐎', 3000], ['revuelto', 'Lamborghini Revuelto', '🐂', 3500],
  ['tourbillon', 'Bugatti Tourbillon', '🐘', 8000], ['utopia', 'Pagani Utopia', '🌬️', 7000]
];
for (const [key, label, icon, xp] of GRAILS) {
  add({
    id: `g_${key}`, name: `Grail: ${label}`, icon, cat: 'quests',
    desc: `Photograph a ${label}`, goal: 1, xp, grail: true,
    value: s => s.model[key] || 0
  });
}

/* ── 7. Colours ─────────────────────────── */
const COL_NAMES = {
  black: ['Into the Black', '⚫'], white: ['Whiteout', '⚪'], silver: ['Silver Service', '🥈'],
  grey: ['Fifty Shades', '🌫️'], blue: ['Feeling Blue', '🔵'], red: ['Seeing Red', '🔴'],
  green: ['Racing Green', '🟢'], yellow: ['Mellow Yellow', '🟡'], orange: ['Agent Orange', '🟠'],
  brown: ['Brown Sauce', '🟤'], beige: ['Beige Brigade', '🧻'], purple: ['Purple Reign', '🟣'],
  pink: ['Pretty in Pink', '💗'], gold: ['Goldfinger', '🥇'], bronze: ['Bronze Age', '🥉'],
  multi: ['Full Wrap', '🌈']
};
const COL_LADDER = { black: [1, 25, 100], white: [1, 25, 100], silver: [1, 25, 100], grey: [1, 25, 100], blue: [1, 25, 100], red: [1, 25, 100], green: [1, 10, 50], yellow: [1, 10, 40], orange: [1, 10, 40], brown: [1, 5, 20], beige: [1, 5, 20], purple: [1, 5, 20], pink: [1, 5, 15], gold: [1, 5, 15], bronze: [1, 5, 15], multi: [1, 5, 15] };
for (const c of COLOURS) {
  const [nm, icon] = COL_NAMES[c.id] || [c.label, '🎨'];
  (COL_LADDER[c.id] || [1, 5, 20]).forEach((goal, i) => add({
    id: `col_${c.id}_${goal}`,
    name: i === 0 ? nm : `${nm} ${['I', 'II', 'III'][i]}`,
    icon, cat: 'colours', colour: c.hex.startsWith('#') ? c.hex : null,
    desc: goal === 1 ? `Log a ${c.label.toLowerCase()} car` : `Log ${goal} ${c.label.toLowerCase()} cars`,
    goal, xp: xpFor(goal), value: s => s.colours[c.id] || 0
  }));
}
[[4, 'Primary Colours', '🎨'], [8, 'Full Spectrum', '🌈'], [12, 'Colour Theory', '🖌️'], [16, 'Every Shade', '🎨']
].forEach(([goal, name, icon]) => add({
  id: `colc_${goal}`, name, icon, cat: 'colours',
  desc: `Log ${goal} different colours`, goal, xp: xpFor(goal) * 2, value: s => s.colourCount
}));

/* ── 8. Eras ────────────────────────────── */
const DECADES = [
  [1900, 'Brass Era', '🕯️', 8000], [1910, 'Edwardian', '🎩', 7000], [1920, 'Roaring Twenties', '🍸', 6000],
  [1930, 'Art Deco', '🏛️', 5000], [1940, 'Post-War', '📻', 4000], [1950, 'Fabulous Fifties', '🎸', 3000],
  [1960, 'Swinging Sixties', '☮️', 2200], [1970, 'Seventies Steel', '🕺', 1600],
  [1980, 'Eighties Wedge', '📼', 1100], [1990, 'Nineties Nostalgia', '💾', 700],
  [2000, 'Y2K Era', '💿', 400], [2010, 'The Twenty-Tens', '📱', 250],
  [2020, 'Modern Metal', '🔋', 200]
];
for (const [dec, name, icon, xp] of DECADES) {
  add({ id: `dec_${dec}`, name, icon, cat: 'era', desc: `Log a car from the ${dec}s`, goal: 1, xp, value: s => s.decades[dec] || 0 });
  if (dec >= 1960) add({ id: `dec_${dec}_10`, name: `${name} ×10`, icon, cat: 'era', desc: `Log 10 cars from the ${dec}s`, goal: 10, xp: xp * 2, value: s => s.decades[dec] || 0 });
  if (dec >= 1980) add({ id: `dec_${dec}_50`, name: `${name} ×50`, icon, cat: 'era', desc: `Log 50 cars from the ${dec}s`, goal: 50, xp: xp * 4, value: s => s.decades[dec] || 0 });
}
[[3, 'Three Decades', '📅'], [5, 'Five Decades', '🗓️'], [8, 'Eight Decades', '⌛'], [11, 'A Century of Cars', '🏛️']
].forEach(([goal, name, icon]) => add({
  id: `decc_${goal}`, name, icon, cat: 'era',
  desc: `Log cars from ${goal} different decades`, goal, xp: xpFor(goal) * 3, value: s => s.decadeCount
}));
add({ id: 'era_pre1980', name: 'Time Traveller', icon: '🕰️', cat: 'era', desc: 'Log something built before 1980', goal: 1, xp: 900, value: s => (s.oldest && s.oldest < 1980) ? 1 : 0 });
add({ id: 'era_pre1960', name: 'Living History', icon: '📜', cat: 'era', desc: 'Log something built before 1960', goal: 1, xp: 2500, value: s => (s.oldest && s.oldest < 1960) ? 1 : 0 });
add({ id: 'era_pre1940', name: 'Museum Piece', icon: '🏺', cat: 'era', desc: 'Log something built before 1940', goal: 1, xp: 5000, value: s => (s.oldest && s.oldest < 1940) ? 1 : 0 });
add({ id: 'era_spread50', name: 'Fifty-Year Span', icon: '↔️', cat: 'era', desc: 'Have 50 years between your oldest and newest car', goal: 50, xp: 2000, value: s => (s.oldest && s.newest) ? s.newest - s.oldest : 0 });
add({ id: 'era_spread80', name: 'Eighty-Year Span', icon: '⏳', cat: 'era', desc: 'Have 80 years between your oldest and newest car', goal: 80, xp: 4500, value: s => (s.oldest && s.newest) ? s.newest - s.oldest : 0 });
[[10, 'Ten Model Years', '📆'], [25, 'Twenty-Five Years', '📊'], [50, 'Fifty Model Years', '📈'], [80, 'Eighty Model Years', '🧾']
].forEach(([goal, name, icon]) => add({
  id: `yr_${goal}`, name, icon, cat: 'era',
  desc: `Log cars from ${goal} different model years`, goal, xp: xpFor(goal) * 2, value: s => s.years.size
}));

/* ── 9. Fieldwork ───────────────────────── */
[[5, 'Repeat Offender', '🔁', 'Spot the same car 5 times'],
 [10, 'Old Friend', '🤝', 'Spot the same car 10 times'],
 [25, 'Practically Family', '👪', 'Spot the same car 25 times'],
 [50, 'Stalker', '🔍', 'Spot the same car 50 times']
].forEach(([goal, name, icon, desc]) => add({
  id: `rep_${goal}`, name, icon, cat: 'field', desc, goal, xp: xpFor(goal) * 2, value: s => s.maxSightings
}));

[[5, 'Five Locations', '📍'], [25, 'Regional Scout', '🗺️'], [100, 'Well Travelled', '✈️'], [250, 'Cartographer', '🧭']
].forEach(([goal, name, icon]) => add({
  id: `plc_${goal}`, name, icon, cat: 'field',
  desc: `Log spots in ${goal} different places`, goal, xp: xpFor(goal) * 2, value: s => s.placeCount
}));

[[7, 'A Week of Spotting', '📅'], [30, 'A Month of Spotting', '🗓️'], [100, 'Hundred Days', '💯'],
 [365, 'A Year of Spotting', '🎂'], [1000, 'Thousand Days', '🏔️']
].forEach(([goal, name, icon]) => add({
  id: `day_${goal}`, name, icon, cat: 'field',
  desc: `Spot cars on ${goal} different days`, goal, xp: xpFor(goal) * 2, value: s => s.dayCount
}));

[[3, 'On a Roll', '🔥'], [7, 'Week Streak', '📆'], [30, 'Month Streak', '🏅'], [100, 'Unstoppable', '🚀']
].forEach(([goal, name, icon]) => add({
  id: `str_${goal}`, name, icon, cat: 'field',
  desc: `Spot on ${goal} consecutive days`, goal, xp: xpFor(goal) * 3, value: s => s.streak
}));

[[5, 'Good Haul', '🎣'], [10, 'Big Day Out', '🎪'], [25, 'Car Meet', '🏟️'], [50, 'Show Day', '🎡']
].forEach(([goal, name, icon]) => add({
  id: `bd_${goal}`, name, icon, cat: 'field',
  desc: `Log ${goal} spots in a single day`, goal, xp: xpFor(goal) * 2, value: s => s.bestDay
}));

[[3, 'Three Months In', '🌱'], [6, 'Half a Year', '🌿'], [12, 'One Year In', '🌳'], [24, 'Two Years In', '🌳'], [60, 'Five Years In', '🏔️']
].forEach(([goal, name, icon]) => add({
  id: `mon_${goal}`, name, icon, cat: 'field',
  desc: `Spot across ${goal} different months`, goal, xp: xpFor(goal) * 3, value: s => s.monthCount
}));

add({ id: 'fld_night10', name: 'Night Shift', icon: '🌙', cat: 'field', desc: 'Log 10 spots after 10pm', goal: 10, xp: 700, value: s => s.night });
add({ id: 'fld_night50', name: 'Creature of the Night', icon: '🦇', cat: 'field', desc: 'Log 50 spots after 10pm', goal: 50, xp: 1800, value: s => s.night });
add({ id: 'fld_dawn10', name: 'Early Bird', icon: '🌅', cat: 'field', desc: 'Log 10 spots before 8am', goal: 10, xp: 700, value: s => s.dawn });
add({ id: 'fld_weekend50', name: 'Weekend Warrior', icon: '🎉', cat: 'field', desc: 'Log 50 weekend spots', goal: 50, xp: 900, value: s => s.weekend });
add({ id: 'fld_weekend200', name: 'Every Single Saturday', icon: '🗓️', cat: 'field', desc: 'Log 200 weekend spots', goal: 200, xp: 2400, value: s => s.weekend });
add({ id: 'fld_geo25', name: 'Pinned Down', icon: '📌', cat: 'field', desc: 'Attach GPS to 25 sightings', goal: 25, xp: 800, value: s => s.withGeo });
add({ id: 'fld_geo100', name: 'Surveyor', icon: '🛰️', cat: 'field', desc: 'Attach GPS to 100 sightings', goal: 100, xp: 1800, value: s => s.withGeo });

/* ── 10. Oddball ────────────────────────── */
add({ id: 'odd_plate10', name: 'Plate Spotter', icon: '🔢', cat: 'oddball', desc: 'Record 10 number plates', goal: 10, xp: 400, value: s => s.withPlate });
add({ id: 'odd_plate100', name: 'DVLA Enthusiast', icon: '🗃️', cat: 'oddball', desc: 'Record 100 number plates', goal: 100, xp: 1500, value: s => s.withPlate });
add({ id: 'odd_notes25', name: 'Note Taker', icon: '📝', cat: 'oddball', desc: 'Write notes on 25 entries', goal: 25, xp: 600, value: s => s.withNotes });
add({ id: 'odd_notes100', name: 'Diarist', icon: '📔', cat: 'oddball', desc: 'Write notes on 100 entries', goal: 100, xp: 1800, value: s => s.withNotes });
add({ id: 'odd_essay', name: 'The Essay', icon: '✍️', cat: 'oddball', desc: 'Write a note over 500 characters', goal: 500, xp: 900, value: s => s.longestNote });
add({ id: 'odd_perfect1', name: 'Perfect Ten', icon: '🔟', cat: 'oddball', desc: 'Rate a car 10 across all four stats', goal: 1, xp: 800, value: s => s.perfect });
add({ id: 'odd_perfect10', name: 'Impeccable Taste', icon: '💎', cat: 'oddball', desc: 'Rate 10 cars a perfect 10 across the board', goal: 10, xp: 2200, value: s => s.perfect });
add({ id: 'odd_zero', name: 'Harsh Critic', icon: '👎', cat: 'oddball', desc: 'Give something a zero', goal: 1, xp: 300, value: s => s.zeroStat });
add({ id: 'odd_loud25', name: 'Ear Defenders', icon: '🔊', cat: 'oddball', desc: 'Rate 25 cars 10/10 for sound', goal: 25, xp: 1200, value: s => s.loudest });
add({ id: 'odd_mint25', name: 'Concours Judge', icon: '🧼', cat: 'oddball', desc: 'Rate 25 cars 10/10 for condition', goal: 25, xp: 1200, value: s => s.mint });
add({ id: 'odd_gallery5', name: 'Full Gallery', icon: '🖼️', cat: 'oddball', desc: 'Put 5 photos on one entry', goal: 5, xp: 500, value: s => s.maxPhotos });
add({ id: 'odd_gallery8', name: 'Photo Shoot', icon: '📷', cat: 'oddball', desc: 'Put 8 photos on one entry', goal: 8, xp: 900, value: s => s.maxPhotos });
add({ id: 'odd_documented', name: 'Fully Documented', icon: '🗂️', cat: 'oddball', desc: 'Photograph 100 entries', goal: 100, xp: 1200, value: s => s.withPhoto });
add({ id: 'odd_loyal', name: 'Brand Loyalty', icon: '🧲', cat: 'oddball', desc: 'Log 50 of a single manufacturer', goal: 50, xp: 1500, value: s => s.topMake ? s.topMake[1] : 0 });
add({ id: 'odd_loyal100', name: 'Utterly Obsessed', icon: '🎯', cat: 'oddball', desc: 'Log 100 of a single manufacturer', goal: 100, xp: 3000, value: s => s.topMake ? s.topMake[1] : 0 });

export const ACHIEVEMENTS = A;
export const TOTAL = A.length;

/* ═══════════════════════════════════════════
   EVALUATE
   ═══════════════════════════════════════════ */

export function evaluate(summary) {
  const out = [];
  let unlocked = 0, xp = 0;
  for (const a of ACHIEVEMENTS) {
    let v = 0;
    try { v = a.value(summary) || 0; } catch { v = 0; }
    const done = v >= a.goal;
    if (done) { unlocked++; xp += a.xp; }
    out.push({ a, v: Math.min(v, a.goal), raw: v, done, pct: Math.max(0, Math.min(1, v / a.goal)) });
  }
  return { rows: out, unlocked, xp, total: ACHIEVEMENTS.length };
}

export function unlockedIds(summary) {
  const set = new Set();
  for (const a of ACHIEVEMENTS) {
    let v = 0;
    try { v = a.value(summary) || 0; } catch { v = 0; }
    if (v >= a.goal) set.add(a.id);
  }
  return set;
}
