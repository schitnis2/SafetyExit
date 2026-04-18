[README (2).md](https://github.com/user-attachments/files/26862194/README.2.md)
# SafeExit v2 🛡️

A discreet PWA for domestic violence survivors — disguised as a homework planner.

## What's new in v2

| Feature | Detail |
|---|---|
| **Local shelter database** | 30+ US metro areas with real shelter names, addresses, and phone numbers — no hotline needed to find a shelter |
| **GPS location** | "Use my location" button finds shelters using device GPS |
| **Custom checklist items** | Users can add their own items to the packing checklist |
| **Editable StudyTrack** | The homework disguise lets you add, check off, and delete assignments |
| **Rotating affirmations** | A new message every time the app is opened |
| **Full-screen layout** | App fills the entire screen on any device |
| **PIN-protected log** | Incident log locked behind a 4-digit PIN, stored only on device |
| **PWA / installable** | Add to home screen on iPhone or Android — works offline |

## Files

| File | Purpose |
|---|---|
| `index.html` | Full app HTML structure |
| `style.css` | All visual styling |
| `app.js` | All logic — shelter DB, checklist, log, disguise |
| `manifest.json` | Makes it installable as a PWA |
| `sw.js` | Service worker for offline support |

## How to publish on GitHub Pages (free, no coding)

### Step 1 — Create a GitHub account
Go to **github.com** → Sign up (free)

### Step 2 — Create a new repository
1. Click the green **New** button
2. Name it `safeexit` (lowercase)
3. Set to **Public**
4. Click **Create repository**

### Step 3 — Upload all 5 files
1. On your repo page, click **"uploading an existing file"**
2. Drag in all 5 files: `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`
3. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Click **Settings** tab
2. Click **Pages** in the left sidebar
3. Under **Source** → choose **Deploy from a branch**
4. Branch: **main**, folder: **/ (root)**
5. Click **Save**

### Step 5 — Get your live link
Wait 1–2 minutes, then refresh the Pages settings page.

Your app is live at:
```
https://YOUR-USERNAME.github.io/safeexit
```

### Step 6 — Install it like a real app

**iPhone (Safari only):**
1. Open the link in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open in Chrome
2. Tap the 3-dot menu
3. Tap "Add to Home screen"

## Extending the shelter database

Edit `SHELTER_DB` in `app.js`. Keys are the first 3 digits of a zip code:

```js
"123": [
  {
    name: "Shelter Name",
    city: "City, ST",
    addr: "123 Main St",
    phone: "(555) 000-0000",
    tags: ["Open 24/7", "Walk-ins welcome"]
  }
]
```

## Resources

- [National DV Hotline](https://www.thehotline.org) — 1-800-799-7233
- [Crisis Text Line](https://www.crisistextline.org) — Text HOME to 741741
- [WomensLaw.org](https://www.womenslaw.org) — Legal resources by state
