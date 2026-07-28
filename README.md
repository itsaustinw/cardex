# CARDEX 🚗

A Pokédex, but for cars. Photograph what you spot, and your dex grows.

Runs as an installable web app (PWA) — works on iPhone and Android, offline,
with no account, no API keys and no running costs. Everything is stored on
your phone.

---

## Getting it onto your phone

The app is just static files, so any web host works. Two easy options:

### Option A — Netlify Drop (fastest, ~60 seconds, free)
1. Zip the `cardex` folder, or keep it as-is.
2. Go to **https://app.netlify.com/drop**
3. Drag the `cardex` folder onto the page.
4. You get a URL like `https://random-name-123.netlify.app` — open it on your phone.

### Option B — GitHub Pages (free, permanent, your own repo)
1. Create a new GitHub repo.
2. Upload the contents of the `cardex` folder to it.
3. Settings → Pages → Source: `main` branch, root folder → Save.
4. Your app is at `https://yourname.github.io/reponame/`

> **HTTPS is required.** The camera, offline mode and "add to home screen" all
> need a secure origin. Both options above give you HTTPS automatically.
> `file://` will not work.

### Then install it
- **iPhone (Safari):** open the URL → Share button → **Add to Home Screen**.
- **Android (Chrome):** open the URL → menu ⋮ → **Install app** (or tap the
  *Add to home screen* button inside Settings in the app).

Once installed it opens fullscreen with no browser chrome, and works with no signal.

---

## Using it

**Snap a car** — hit the big red button. Your camera opens, you take the shot,
then fill in as much or as little as you like. Only a make *or* a model is
required; everything else is optional.

**It guesses for you.** Type "Ferrari F40" and it pre-selects Supercar +
Hypercar + Classic and sets the rarity to Legendary. Type "Fiesta ST" and you
get Hot Hatch / Uncommon. Override anything you disagree with — once you tap a
type or rarity yourself, it stops guessing for that entry.

**Rarity drives XP** — Common 10 XP up to Legendary 400 XP. XP feeds your rank,
from *Kerb Crawler* all the way to *Living Encyclopaedia*.

**Seen it again?** Open the entry → **Spotted it again**. It logs a new dated
sighting rather than creating a duplicate, and you earn the XP again.

**Search and filter** — search covers make, model, year, plate, notes and
places. The chips filter by rarity, type and favourites, and show live counts.

**Stats tab** (bar-chart icon) — rank progress, rarity breakdown, most-spotted
makes, types collected, and your achievement progress.

---

## The catalogue — 3,006 real cars

CARDEX ships with a hand-built catalogue of **3,006 production cars across 232
makes**, split by *generation* — so a BMW 3 Series is seven separate entries
(E21, E30, E36, E46, E90, F30, G20), not one.

When you type a make and model the app recognises, it fills in the body type and
rarity for you from hand-checked data. Type "Porsche 911 (993)" and it knows
that's an Epic sports car from 1994–98. Type "MG EX181" and it knows it's a
one-off land-speed-record car.

**There is deliberately no browsable list.** You don't get to scroll a catalogue
of everything you're missing — the achievements tell you what's out there, and
you have to find the cars in the wild. Your stats screen shows how much of the
catalogue you've covered, and nothing more.

### The Mythic tier
Above Legendary sits **Mythic** (hot pink, 200 XP) — reserved for roughly 390
genuine one-offs, works race cars, prototypes and museum pieces. The
**MG EX181**, the **Le Mans-winning GT40**, the **Ferrari 250 GTO**, the
**McLaren F1**, the **Bugatti Type 41 Royale**. If you ever photograph one of
these in person, it should feel like an event.

Rarity across the catalogue is set by *how hard the car is to actually spot*,
not how exotic the name sounds:

| Tier | Share | What it means |
|---|---|---|
| Common | 20% | Still on every road |
| Uncommon | 13% | Older mainstream, premium dailies |
| Rare | 16% | Performance trims, 25+ year old ordinary cars |
| Epic | 16% | Supercars, desirable classics |
| Legendary | 22% | Homologation specials, halo cars |
| Mythic | 13% | One-offs, race winners, prototypes |

---

## Achievements — 1,141 of them

This is the long game. Every achievement tracks **live progress**, not just
locked/unlocked, so you always know how close you are.

| Category | Count | Examples |
|---|---|---|
| **Collection** | 42 | *Centurion* (100 cars), *Four Figures* (1,000), *Ten Thousand* |
| **Types** | 191 | Ladders per body type — *Van Novice* (1) all the way to *Van Immortal* (250) |
| **Makes** | 202 | *Ford Fanatic* (100 Fords), *Ferrari Spotter*, *50 different marques* |
| **Quests** | 105 | *The Big Three*, *The Holy Trinity*, *Group B Survivors*, 42 individual grails |
| **Rarity** | 29 | *First Legendary*, *Legendary Immortal* (25), *Full House* |
| **Colours** | 52 | *Brown Sauce*, *Goldfinger*, *Full Spectrum* |
| **Eras** | 38 | *Roaring Twenties*, *Eighty-Year Span*, *A Century of Cars* |
| **Fieldwork** | 33 | *Month Streak*, *Night Shift*, *Car Meet* (50 spots in one day) |
| **Brand Hunts** | 425 | *Every Lamborghini*, *Ferrari Curator*, *MG Completionist* |
| **Oddball** | 15 | *Perfect Ten*, *Harsh Critic*, *The Essay*, *Utterly Obsessed* |

### Brand hunts
Every make with 3+ catalogue entries gets a completion ladder, measured against
the real catalogue. *Every Lamborghini* means finding all 40 Lamborghini models.
*Every Bugatti* is 14. Partial milestones (25%, 50%, 75%) keep the big marques
approachable — Ford has 171 entries, so nobody is completing that quickly.

There are also overall catalogue milestones, from *Catalogued* (10 models) up to
*Every Car Known* (all 3,006).

Some highlights worth hunting:

- **Every Lamborghini** — all 40 of them. 375+ XP and a very long hunt.
- **The Big Three** — photograph a Koenigsegg, a Bugatti *and* a Pagani. 390 XP.
- **The Holy Trinity** — McLaren P1 + LaFerrari + Porsche 918. 490 XP.
- **Grails** — 42 single-car quests, from *Grail: Morris Minor* (190 XP) up to
  *Grail: McLaren F1* (520 XP).
- **Group B Survivors** — a Delta Integrale, Quattro, RS200 or 205 T16.
- **JDM Holy Grail** — Skyline, Supra, RX-7, NSX and an Evo.
- **Unstoppable** — spot on 100 consecutive days.

### How XP works

Two sources, deliberately kept in balance:

- **Spotting** — 10 XP for a Common up to 120 for a Legendary. A Legendary is
  worth about 12 ordinary cars, so a good day of normal spotting still competes
  with one lucky supercar.
- **Achievements** — 20 XP for a small step, up to a hard ceiling of **600**.
  Even *Grail: McLaren F1*, the rarest thing in the app, pays 520 — roughly 50
  common cars. Achievements are a bonus on top of going out and finding things,
  never a substitute for it.

The whole achievement pool is about **92,000 XP**, and it feeds a 14-step rank
ladder. Thresholds were set by simulating realistic dexes, so each rank lands on
a real milestone rather than a round number:

| Rank | Roughly |
|---|---|
| Kerb Crawler | your first car |
| Spotter | ~5 cars |
| Trainspotter of Tarmac | ~25 cars |
| Car Nerd | ~60 cars |
| Lay-by Legend | ~120 cars |
| Bonnet Botherer | ~200 cars |
| Concours Judge | ~350 cars |
| Marque Specialist | ~600 cars |
| Dex Master | ~800 cars |
| Grand Archivist | ~1,300 cars |
| Living Encyclopaedia | ~2,200 cars |
| Tarmac Historian | ~3,500 cars |
| The Completionist | ~5,500 cars |
| Immortal of the Hard Shoulder | ~9,000 cars |

Early ranks come quickly to build momentum; the top few are a long haul but
genuinely reachable.

When you save a car, any achievement it completes fires a gold unlock card
straight after the dex entry animation. The stats sheet also shows the six
you're **closest to unlocking**, which is dangerously moreish.

Browse everything via **View all achievements** — filter by category, search by
name, and toggle locked/unlocked.

### Adding cars to the catalogue
`js/catalogue.js` is generated. Each row is
`[model, yearFrom, yearTo, type, rarity]` under its make, and generation codes
live in the model string (`"911 (993)"`). You can hand-edit it safely — just keep
the shape — and new entries automatically feed the brand-hunt achievements.

### Adding your own achievements
`js/achievements.js`. Each one is a small object:

```js
add({
  id: 'q_myquest', name: 'Local Legend', icon: '🏆', cat: 'quests',
  desc: 'Log 3 cars in your own street', goal: 3, xp: 500,
  value: s => s.placeCount            // any number from the summary
});
```

`value(s)` receives the pre-computed summary (`s.types`, `s.makes`, `s.model`,
`s.streak`, `s.decades`, and plenty more — see `buildSummary`). Return a number;
the engine handles progress bars, sorting and unlock detection. To add a new
grail car, drop a regex into `MODEL_QUESTS` and reference it with
`s.model.yourkey`.

---

## Your data

Everything is stored in **IndexedDB on your phone**. Nothing is uploaded
anywhere — there's no server, no account and no tracking. Photos are resized
and re-compressed on-device before saving (roughly 150–400 KB each instead of
3–8 MB), so thousands of cars fit comfortably.

### Back up regularly
Settings → **Export full backup** gives you a single `.json` containing every
entry *and* every photo. **Restore from backup** brings it all back — on the
same phone, or a new one. That's also how you move your dex between devices.

There's also **Export spreadsheet** (`.csv`) for a photo-free table you can
open in Excel, Google Sheets or Numbers.

> ⚠️ Clearing your browser's site data, or deleting the app on iOS, wipes the
> dex. Export a backup now and then — especially before switching phones.
> The app asks the browser for persistent storage on first run, which greatly
> reduces the chance of iOS evicting your data automatically.

---

## Updating an installed app

**You never reinstall, and you never lose your dex.**

The home screen icon is just a pointer to your GitHub Pages URL. Push new files
to the repo and the same icon loads the new version. Your entries and photos
live in IndexedDB, which is completely separate from the app code — replacing
`app.js` or `app.css` cannot touch them, and the app never wipes storage on
upgrade.

What you'll see after a deploy:

1. Open the app as normal.
2. It checks for a new version on launch, on refocus, and hourly.
3. If there's one, it installs and reloads itself — usually within a second or
   two of opening. No prompt, no buttons, nothing to tap.

Settings shows the running build (e.g. `CARDEX · offline · v4`) so you can
confirm it landed.

### If you change the files yourself

Bump `VERSION` in `sw.js` whenever you deploy:

```js
const VERSION = 'v3';   // was 'v2'
```

That string names the cache bucket. Changing it is what tells every installed
phone "there's something new" — old buckets are deleted automatically, so no
storage is wasted. If you forget to bump it, phones may keep serving the old
cached copy.

**If a phone ever seems stuck on an old version**, the fix is to force the
service worker to re-register:

- **iPhone:** Settings → Safari → Advanced → Website Data → find your site →
  swipe to delete. (This clears the *cache*, not your dex — your entries live in
  IndexedDB. Export a backup first anyway, belt and braces.)
- **Android Chrome:** ⋮ → Settings → Site settings → your site → Clear & reset.
- **Either:** open the URL in a normal browser tab (not the installed app) and
  hard-refresh a couple of times.

This shouldn't be necessary from v4 onward — updates now activate themselves
rather than waiting for the page to grant permission.

GitHub Pages usually publishes within a minute of a push, though it can
occasionally take a few. If an update seems slow to appear, close the app fully
and reopen it.

> **The one thing that *does* destroy your dex** is deleting the app from your
> phone (iOS clears its storage), or clearing browser site data. Neither happens
> during an update — but it's the reason to export a backup before switching
> phones.

---

## Files

```
cardex/
├─ index.html              app shell
├─ manifest.webmanifest    PWA metadata (name, icons, standalone display)
├─ sw.js                   service worker — offline caching
├─ css/app.css             all styling
├─ js/
│  ├─ app.js               UI, rendering, interactions
│  ├─ store.js             IndexedDB, image compression, backup/restore
│  ├─ data.js              types, rarities, ranks, make list, guesser
│  ├─ catalogue.js         3,006 catalogued cars (generated — see below)
│  └─ achievements.js      1,141 achievements + the scoring engine
└─ icons/                  generated app icons, all sizes
```

No build step, no dependencies, no npm. Edit a file and reload.

---

## Tweaking it

- **Add makes/models:** `js/data.js` → `MAKES` and `MODELS`. You can always type
  a car that isn't listed; the lists are only autocomplete suggestions.
- **Change rarity XP or rank names:** `js/data.js` → `RARITIES` and `RANKS`.
- **Add types:** `js/data.js` → `TYPES` (id, label, colour).
- **Add achievements:** `js/app.js` → `ACHIEVEMENTS`, each with a `test(s)`.
- **Adjust the guesser:** `js/data.js` → `MODEL_HINTS`, `SHAPE_HINTS`,
  `EXOTIC_MAKES`, `JDM_HERO_RE`.

After changing files, bump `CACHE` in `sw.js` (e.g. `cardex-v2`) so phones pick
up the new version instead of the cached one.
