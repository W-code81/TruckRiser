# 🚚 TruckRiser — Logistics Web App

TruckRiser is a small-scale logistics web application for managing bookings, basic dispatch, and viewing delivery status. This repo contains the server, simple views, and static assets used to run a development instance locally.

**Audience:** developers and contributors who want to extend a lightweight Express + EJS web app for freight/haulage workflows.

**Status:** Prototype / MVP — UI and server routes present; integrations (real-time tracking, DB persistence) are optional next steps.


## Key Features
- User-facing pages and booking flow (EJS views)
- Simple authentication stubs (views for signup/login)
- Admin/pricing pages and basic UI for dispatch
- Static assets: CSS, JS, images and jQuery utilities


## Tech Stack
- Node.js + Express
- EJS templating (views)
- Bootstrap + custom CSS
- jQuery for small client-side behaviors


## Project Structure

TruckRiser/
- `app.js` — Express application entry
- `package.json` — npm scripts & dependencies
- `public/` — static assets (css, js, Image, jQuery)
- `views/` — EJS templates (index.ejs, login.ejs, signup.ejs, pricing.ejs)
- `README.md` — original file
- `README_new.md` — this updated README copy


## Getting Started (local)
1. Install dependencies:

```bash
npm install
```

2. Start the app (development):

```bash
npm start
# or
node app.js
```

3. Open http://localhost:3000 (or the port shown in console).

Notes:
- If the project expects a database, set environment variables like `PORT` and `MONGODB_URI` (or update `app.js` to use a local file DB).
- Check `package.json` for the `start` script; if missing, use `node app.js`.


## Development notes
- Routes live in `app.js` (or `routes/` if added). Add new pages under `views/` and corresponding static assets under `public/`.
- Keep UI work in `public/css` and `public/js` to avoid changing templates.


## Contributing
- Fork the repo, create a feature branch, and open a pull request describing your change.
- For larger features (real-time tracking, DB persistence, API), open an issue first to discuss design.


## License & Author
- Minimal MIT-style permission granted — feel free to reuse and adapt.
- Author: Oluwa (see project workspace)


---

Edited to focus the README on TruckRiser as a small web application (server + views + static assets).