#  TruckRiser  Logistics Web App

TruckRiser is a small-scale logistics web application for managing bookings and basic dispatch. This repository contains the Express server, EJS views and static assets so you can run a development instance locally.

**Audience:** developers and contributors extending a lightweight Express + EJS web app.

**Status:** Prototype / MVP  basic UI and routes available.

## Key Features
- User-facing pages and booking flow (EJS views)
- Simple authentication stubs (signup/login views)
- Pricing and admin UI pages
- Static assets: CSS, JS, images, and jQuery utilities

## Tech Stack
- Node.js + Express
- EJS templating
- Bootstrap + custom CSS
- jQuery for small client-side behaviors

## Project Structure

TruckRiser/
- `app.js`  Express application entry
- `package.json`  npm scripts & dependencies
- `public/`  static assets (css, js, Image, jQuery)
- `views/`  EJS templates (index.ejs, login.ejs, signup.ejs, pricing.ejs)
- `views/partials/`  `header.ejs` and `footer.ejs`

## Getting Started (local)
1. Install dependencies:

```bash
npm install
```

2. Start the app (development):

```bash
# If you have a `start` script in package.json:
npm start

# Otherwise run directly:
node app.js
```

3. Open http://localhost:3000 (or the port shown in console).

Notes:
- If the project expects a database, set `PORT`, `MONGODB_URI` or other env vars as needed.

## Icons (Font Awesome)
This project uses Font Awesome 6 for UI icons. The current `views/partials/header.ejs` is configured to load Font Awesome via CDN to ensure icons render even if local webfonts are missing.

- CDN used (recommended):
  - cdnjs: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css
  - alternative (jsDelivr): https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css

Verification steps if icons do not show:
1. Open the site and check an icon (e.g. a hamburger menu). If a square/empty box appears, open DevTools  Network and filter `font` to see whether `fa-solid-900.woff2` is loading.
2. If using the CDN, confirm the `all.min.css` request succeeds and fonts are served from the CDN.

Restore local hosting (optional):
1. Download the Font Awesome free package and place the `webfonts/` folder into `public/webfonts`.
2. Keep (or revert) `public/css/all.min.css` so its `@font-face` `src` paths point to `../webfonts/*.woff2` (the provided `all.min.css` expects `../webfonts`).
3. In `views/partials/header.ejs` replace the CDN link with `/css/all.min.css` to use the local copy.

## Development notes
- Add new pages under `views/` and put static assets under `public/`.
- To change UI styles, edit files in `public/css` (e.g. `style.css`).

## Troubleshooting
- If icons still fail after switching CDN/local, check browser console for CORS or mixed-content errors (HTTP vs HTTPS).
- If you change the Font Awesome version, update both the CSS link and the local `webfonts` files to matching versions.

## Contributing
- Fork the repo, create a branch, and open a pull request with a clear description.

## License & Author
- MIT-style permission  reuse and adapt freely.
- Author: W-code81
