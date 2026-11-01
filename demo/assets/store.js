// Pricing + storage shared by the shop (app.js) and the staff dashboard (admin.js).
// Everything is stored in the browser's localStorage, which is enough for a demo.

(function () {
  const LS = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
    }
  };

  const money = n => "£" + (Math.round(n * 100) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function product(id) { return KP.products.find(p => p.id === id); }
  function findOpt(list, id) { return (list || []).find(o => o.id === id) || (list || [])[0]; }

  function qtyChoices(p) {
    return p.perUnit ? p.qtyChoices : p.tiers.map(t => t[0]);
  }

  // Returns { print, turnaround, artwork, total, each, sample, lines[] }
  function priceItem(cfg) {
    const p = product(cfg.productId);
    const size = findOpt(p.sizes, cfg.size);
    const paper = findOpt(p.papers, cfg.paper);
    const sides = findOpt(p.sides, cfg.sides);
    const turn = findOpt(KP.turnaround, cfg.turnaround);
    const art = findOpt(KP.artwork, cfg.artwork);
    let qty = cfg.qty;
    let sample = !p.real || !!size.sample || !!paper.sample || !!sides.sample || !!art.sample;

    let print;
    if (p.perUnit) {
      qty = Math.max(qty, p.minQty || 1);
      print = size.unit * qty * paper.mult;
    } else {
      const tier = p.tiers.find(t => t[0] === qty) || p.tiers[0];
      qty = tier[0];
      if (tier[2]) sample = true;
      print = tier[1] * (size.mult || 1) * paper.mult;
    }
    if (sides.addPct) print *= 1 + sides.addPct;
    print = Math.round(print * 100) / 100;

    const turnaround = Math.round(print * turn.pct * 100) / 100;
    const artwork = art.price;
    const total = print + turnaround + artwork;
    return {
      qty, print, turnaround, artwork, total, each: total / qty, sample,
      spec: [size.label, paper.label, sides.label].join(" · "),
      turnLabel: turn.label, artLabel: art.label
    };
  }

  // Adds working days (skips weekends) to today.
  function readyDate(turnId) {
    const days = { standard: 4, express: 1, "24h": 1 }[turnId] || 4;
    const d = new Date();
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }

  const PROMOS = { WELCOME10: { pct: 0.10, label: "10% off your first order" }, MENU20: { pct: 0.20, label: "20% off takeaway menus", only: "takeaway-menus" } };
  const FREE_CARDS_THRESHOLD = 250;

  function basketTotals(items, promoCode, deliveryId) {
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    let discount = 0;
    const promo = PROMOS[promoCode];
    if (promo) {
      const base = promo.only ? items.filter(i => i.productId === promo.only).reduce((s, i) => s + i.total, 0) : subtotal;
      discount = Math.round(base * promo.pct * 100) / 100;
    }
    const del = findOpt(KP.delivery, deliveryId || "collect");
    const delivery = del.price;
    const total = Math.max(0, subtotal - discount + delivery);
    return { subtotal, discount, delivery, total, promo, freeCards: subtotal - discount >= FREE_CARDS_THRESHOLD };
  }

  const STATUSES = ["New", "Proof sent", "Approved", "Printing", "Ready", "Dispatched", "Completed"];

  function newOrderId() {
    return "KP-" + Math.floor(10000 + Math.random() * 89999);
  }

  window.KPStore = {
    LS, money, product, findOpt, qtyChoices, priceItem, readyDate, basketTotals, PROMOS,
    FREE_CARDS_THRESHOLD, STATUSES, newOrderId,
    orders: () => LS.get("kp_orders", []),
    saveOrders: o => LS.set("kp_orders", o),
    quotes: () => LS.get("kp_quotes", []),
    saveQuotes: q => LS.set("kp_quotes", q),
    leads: () => LS.get("kp_leads", []),
    saveLeads: l => LS.set("kp_leads", l)
  };
})();
