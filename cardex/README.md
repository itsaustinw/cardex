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
makes, types collected, and 16 achievements to chase.

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
│  └─ data.js              types, rarities, ~100 makes, ~1,500 models, guesser
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
