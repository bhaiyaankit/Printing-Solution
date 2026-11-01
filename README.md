# Printing-Solution

A clickable concept demo of a modern online shop and staff dashboard for **Kwality Printer** (Warrington). It's built to pitch to the business. See [PITCH.md](PITCH.md) for the findings, the feature list and the revenue case.

## What's inside

```
demo/
  index.html      Shop: instant quotes, artwork upload, basket, checkout, track & reorder
  admin.html      Staff dashboard: orders, statuses, KPIs, quote follow-ups, leads
  assets/
    data.js       Products, prices, bundles, delivery options (edit prices here)
    store.js      Pricing logic + browser storage, shared by both pages
    app.js        Shop behaviour
    admin.js      Dashboard behaviour
    styles.css, admin.css
```

There is no build step and nothing to install: it's plain HTML, CSS and JavaScript.

## Run it

Open `demo/index.html` in a browser, or serve the folder:

```bash
cd demo && python3 -m http.server 8000
# then open http://localhost:8000
```

## Put it online for free (to share in the pitch)

- **Netlify Drop:** drag the `demo` folder onto https://app.netlify.com/drop
- **GitHub Pages:** in the repo settings → Pages, choose this branch and the `/demo` folder (or move `demo` to `/docs`)
- **Vercel:** import the repo and set the root directory to `demo`

## Demo tips

1. Click the **10,000 A4 Folded Menus £349** offer. The quote builder opens with that price already set.
2. Switch to **Express** and upload any PDF to see the artwork check.
3. Add it to the basket, try the code `MENU20`, and check out. You'll get an order number.
4. Click **Track this order**, then **Reorder all**.
5. Open the **Staff dashboard**, click **Load sample orders**, then open an order to see the WhatsApp proof button.

## Notes

- Prices marked **Current price** come from Kwality Printer's existing website. Prices marked **Sample** are placeholders to confirm with the owner.
- Orders, quotes and leads are saved only in the visitor's browser. No payments are taken. Payments and a database are phase 2 (see PITCH.md).
