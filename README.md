# 4You Cleaning Services LLC — website

Static site (HTML/CSS/JS, no build step). Open `index.html` or deploy the folder to any static host (Vercel, Netlify, GitHub Pages).

- **Prices & lead destinations:** edit `CONFIG` at the top of `assets/js/main.js`.
- **Leads:** sent by email via FormSubmit to `contact@4YouCleaning.com`. The first submission triggers an activation email — click "Activate" once. Optionally set `leadWebhook` (Google Sheets / Zapier / Make) to also store every lead for campaigns. UTM / gclid / fbclid are captured automatically.
- **Map towns:** `TOWNS` in `assets/js/main.js` + the town buttons in the `#areas` section of `index.html`.
