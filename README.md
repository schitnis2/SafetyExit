# SafeExit web app

This is a static web app version of the SafeExit concept shown in the screenshot.

## What it does

- Quick hide / disguise mode
- Random affirmation every time the app opens
- Nearby resource search using browser location or ZIP code
- Checklist that saves on every change
- Incident log draft that auto-saves on every keystroke
- Saved log entries stored in browser storage on the device

## Files

- `index.html`
- `styles.css`
- `app.js`

## Important note about location

The location feature works as a web app when:

- the site is served over `https://`, or
- it is run locally on `http://localhost`

The browser also has to be given permission to access location.

## GitHub setup

1. Create a new repo.
2. Upload these 3 files.
3. Enable GitHub Pages if you want to host it.
4. Open the Pages URL over HTTPS so geolocation will work.

## Production note

This version stores checklist and log data in browser `localStorage`, which means it stays on the current device/browser only. If you want accounts, encrypted cloud sync, or admin access, that would be a second version with a backend.
