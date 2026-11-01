// Shop front: product grid, instant quote, basket, checkout, track & reorder.
(function () {
  const S = KPStore;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Icons ----------
  const ICONS = {
    card: '<rect x="6" y="14" width="36" height="22" rx="2"/><path d="M11 21h14M11 26h10M11 31h8"/>',
    menu: '<path d="M10 8h28v32H10z"/><path d="M24 8v32M14 15h6M14 20h6M28 15h6M28 20h6M14 27h6M28 27h6"/>',
    leaflet: '<path d="M12 6h18l8 8v28H12z"/><path d="M30 6v8h8M17 22h16M17 28h16M17 34h10"/>',
    doc: '<path d="M12 6h24v36H12z"/><circle cx="18" cy="12" r="2"/><path d="M17 20h14M17 25h14M17 30h10"/>',
    slip: '<rect x="6" y="16" width="36" height="16" rx="1"/><path d="M11 22h12M11 27h20"/>',
    envelope: '<rect x="6" y="12" width="36" height="24" rx="2"/><path d="M6 14l18 12 18-12"/>',
    poster: '<rect x="11" y="6" width="26" height="36" rx="1"/><path d="M15 30l6-8 5 6 3-3 4 5z"/><circle cx="29" cy="14" r="3"/>',
    booklet: '<path d="M24 12c-4-3-10-4-16-3v29c6-1 12 0 16 3 4-3 10-4 16-3V9c-6-1-12 0-16 3z"/><path d="M24 12v29"/>',
    notepad: '<rect x="11" y="9" width="26" height="33" rx="1"/><path d="M11 14h26M16 21h16M16 26h16M16 31h12M16 6v6M22 6v6M28 6v6M34 6v6"/>',
    sticker: '<path d="M24 6a18 18 0 1 0 18 18H30a6 6 0 0 1-6-6z"/><path d="M30 6l12 12"/>',
    bookmark: '<path d="M17 6h14v36l-7-6-7 6z"/>',
    bag: '<path d="M10 16h28l-2 26H12z"/><path d="M18 20v-6a6 6 0 0 1 12 0v6"/>',
    calendar: '<rect x="8" y="10" width="32" height="30" rx="2"/><path d="M8 18h32M16 6v8M32 6v8M15 25h4M22 25h4M29 25h4M15 32h4M22 32h4"/>',
    banner: '<path d="M6 14h36v16H6z"/><circle cx="9" cy="17" r="1"/><circle cx="39" cy="17" r="1"/><circle cx="9" cy="27" r="1"/><circle cx="39" cy="27" r="1"/><path d="M13 22h22"/>',
    roller: '<path d="M15 6h18v32H15z"/><path d="M12 38h24v3H12zM24 41v3M19 14h10M19 20h10"/>',
    stand: '<path d="M8 10c10-3 22-3 32 0v28c-10-3-22-3-32 0z"/><path d="M24 8v32"/>'
  };
  const icon = name => `<svg viewBox="0 0 48 48" class="p-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${ICONS[name] || ICONS.leaflet}</svg>`;

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  // ---------- Product grid ----------
  let activeCat = "all";
  function fromPrice(p) {
    if (p.perUnit) {
      const min = Math.min(...p.sizes.map(s => s.unit));
      return { text: `from ${S.money(min)}`, sub: "each" };
    }
    const t = p.tiers[0];
    return { text: `from ${S.money(t[1])}`, sub: `for ${t[0].toLocaleString()}` };
  }
  function renderFilters() {
    const cats = [{ id: "all", name: "All" }, ...KP.categories];
    $("#catFilters").innerHTML = cats.map(c =>
      `<button role="tab" aria-selected="${c.id === activeCat}" data-cat="${c.id}">${esc(c.name)}</button>`).join("");
  }
  function renderProducts() {
    const list = KP.products.filter(p => activeCat === "all" || p.cat === activeCat);
    $("#productGrid").innerHTML = list.map(p => {
      const f = fromPrice(p);
      return `<button class="product-card" data-quote="${p.id}">
        <span class="p-thumb t-${p.cat}">${icon(p.icon)}</span>
        <span class="p-body">
          <span class="p-name">${esc(p.name)} ${p.popular ? '<span class="badge hot">Popular</span>' : ""}</span>
          <span class="p-desc">${esc(p.desc)}</span>
          <span class="p-price"><b>${f.text}</b> <small>${f.sub}</small>
            ${p.real ? '<span class="badge real">Current price</span>' : '<span class="badge sample">Sample</span>'}</span>
        </span>
      </button>`;
    }).join("");
  }

  // ---------- Quote builder ----------
  const cfg = { productId: "business-cards", size: null, paper: null, sides: null, qty: null, turnaround: "standard", artwork: "upload", file: null };

  function setProduct(id, qty) {
    const p = S.product(id);
    if (!p) return;
    cfg.productId = id;
    cfg.size = p.sizes[0].id;
    cfg.paper = p.papers[0].id;
    cfg.sides = p.sides[0].id;
    const choices = S.qtyChoices(p);
    // Default to the advertised offer for leaflets, otherwise the second tier.
    const fallback = id === "leaflets" ? 10000 : choices[Math.min(1, choices.length - 1)];
    cfg.qty = qty && choices.includes(qty) ? qty : fallback;
    $("#qProduct").value = id;
    renderQuote();
  }

  function chips(container, list, current, key, fmt) {
    container.innerHTML = list.map(o => {
      const label = fmt ? fmt(o) : esc(o.label);
      const tag = o.sample ? ' <span class="badge sample sm">Sample</span>' : "";
      return `<button type="button" class="chip" aria-pressed="${o.id === current}" data-key="${key}" data-val="${o.id}">${label}${tag}</button>`;
    }).join("");
  }

  function renderQuote() {
    const p = S.product(cfg.productId);
    $("#qNote").textContent = p.note || p.desc;
    chips($("#qSize"), p.sizes, cfg.size, "size", o => esc(o.label) + (o.unit != null ? ` <small>${S.money(o.unit)} ea</small>` : ""));
    chips($("#qPaper"), p.papers, cfg.paper, "paper");
    chips($("#qSides"), p.sides, cfg.sides, "sides");
    const qtys = S.qtyChoices(p);
    $("#qQty").innerHTML = qtys.map(q => {
      const price = S.priceItem({ ...cfg, qty: q, turnaround: "standard", artwork: "upload" });
      return `<button type="button" class="chip qty" aria-pressed="${q === cfg.qty}" data-key="qty" data-val="${q}">
        <b>${q.toLocaleString()}</b><small>${S.money(price.print)}</small></button>`;
    }).join("");
    chips($("#qTurn"), KP.turnaround, cfg.turnaround, "turnaround", o => `${esc(o.label)} <small>${esc(o.detail)}${o.pct ? " · +" + Math.round(o.pct * 100) + "%" : ""}</small>`);
    chips($("#qArt"), KP.artwork, cfg.artwork, "artwork", o => `${esc(o.label)} <small>${o.price ? "+" + S.money(o.price) : "Free"}</small>`);
    $("#dropzone").hidden = cfg.artwork !== "upload" && cfg.artwork !== "free";
    renderSummary();
  }

  function renderSummary() {
    const p = S.product(cfg.productId);
    const r = S.priceItem(cfg);
    $("#sProduct").textContent = `${r.qty.toLocaleString()} × ${p.name}`;
    $("#sSpec").textContent = r.spec;
    $("#sPrice").textContent = S.money(r.total);
    $("#sEach").textContent = `${S.money(r.each)} each`;
    $("#sFlag").innerHTML = r.sample
      ? '<span class="badge sample">Sample price</span> Confirm with the shop before going live.'
      : '<span class="badge real">Current price</span> Matches Kwality Printer\'s advertised price.';
    const lines = [["Printing", r.print]];
    if (r.turnaround) lines.push([`${r.turnLabel} turnaround`, r.turnaround]);
    lines.push(["Artwork", r.artwork]);
    lines.push(["Free proof", 0]);
    $("#sBreakdown").innerHTML = lines.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v ? S.money(v) : "Free"}</dd>`).join("");
    $("#sEta").textContent = S.readyDate(cfg.turnaround);
    const wa = `Hi Kwality Printer, I'd like to order ${r.qty} × ${p.name} (${r.spec}), ${r.turnLabel}. Online quote: ${S.money(r.total)}.`;
    $("#waQuote").href = "https://wa.me/" + KP.business.whatsapp + "?text=" + encodeURIComponent(wa);
    renderUpsell(p, r);
  }

  // Suggest the next quantity tier when it is good value, plus a matching product.
  function renderUpsell(p, r) {
    const box = $("#upsell");
    const msgs = [];
    const qtys = S.qtyChoices(p);
    const idx = qtys.indexOf(r.qty);
    if (!p.perUnit && idx > -1 && idx < qtys.length - 1) {
      const next = S.priceItem({ ...cfg, qty: qtys[idx + 1] });
      const extra = next.total - r.total;
      const pct = Math.round((1 - next.each / r.each) * 100);
      if (pct >= 10) msgs.push(`<p><b>Better value:</b> get ${qtys[idx + 1].toLocaleString()} for just ${S.money(extra)} more. That's ${pct}% cheaper per item.
        <button class="link-btn" data-key="qty" data-val="${qtys[idx + 1]}">Switch</button></p>`);
    }
    const pair = { "business-cards": "letterheads", "takeaway-menus": "stickers", "leaflets": "posters", "letterheads": "compliment-slips", "roller-banners": "leaflets", "posters": "leaflets" }[p.id];
    if (pair) {
      const pp = S.product(pair);
      msgs.push(`<p><b>Customers also order:</b> ${esc(pp.name)} ${fromPrice(pp).text}. <button class="link-btn" data-quote="${pair}">Quote it</button></p>`);
    }
    box.hidden = !msgs.length;
    box.innerHTML = msgs.join("");
  }

  // Artwork upload with simple file checks (preflight).
  function handleFile(file) {
    if (!file) return;
    cfg.file = { name: file.name, size: file.size, type: file.type };
    const okTypes = /\.(pdf|jpe?g|png|ai|psd|eps|docx?|pub|svg)$/i;
    const checks = [];
    checks.push(okTypes.test(file.name) ? ["ok", "File type accepted"] : ["bad", "This file type may not print well. We'll check it for you."]);
    checks.push(file.size < 100 * 1024 * 1024 ? ["ok", `Size ${(file.size / 1024 / 1024).toFixed(1)}MB`] : ["bad", "File is over 100MB"]);
    if (/\.pdf$/i.test(file.name)) checks.push(["ok", "PDF is the best format for print"]);
    if (/\.(docx?|pub)$/i.test(file.name)) checks.push(["warn", "Word or Publisher file: we'll convert it to print-ready PDF for free"]);
    const pf = $("#preflight");
    pf.hidden = false;
    pf.innerHTML = `<p class="file-name">📎 ${esc(file.name)} <button class="link-btn" id="removeFile">Remove</button></p>` +
      checks.map(([c, m]) => `<p class="pf-${c}">${c === "ok" ? "✔" : c === "warn" ? "!" : "✕"} ${esc(m)}</p>`).join("");
    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
        const p = S.product(cfg.productId);
        const longEdgeMM = { "business-cards": 85, "postcards": 148, "leaflets": 148, "posters": 297 }[p.id] || 210;
        const dpi = Math.round(Math.max(img.width, img.height) / (longEdgeMM / 25.4));
        const row = document.createElement("p");
        row.className = dpi >= 250 ? "pf-ok" : "pf-warn";
        row.textContent = dpi >= 250 ? `✔ Resolution about ${dpi} dpi, good for print` : `! Resolution about ${dpi} dpi. Under 300 dpi may look blurry, so we'll check it on your proof.`;
        pf.appendChild(row);
        const thumb = document.createElement("img");
        thumb.src = img.src; thumb.alt = "Artwork preview"; thumb.className = "art-preview";
        pf.appendChild(thumb);
      };
      img.src = URL.createObjectURL(file);
    }
    $("#dropInner").innerHTML = "<strong>Artwork attached</strong> <u>change file</u>";
  }

  // ---------- Basket ----------
  let basket = S.LS.get("kp_basket", []);
  let promo = S.LS.get("kp_promo", "");
  const saveBasket = () => { S.LS.set("kp_basket", basket); S.LS.set("kp_promo", promo); updateCount(); };
  const updateCount = () => { $("#basketCount").textContent = basket.length; };

  function addToBasket() {
    const p = S.product(cfg.productId);
    const r = S.priceItem(cfg);
    basket.push({
      key: Date.now() + Math.random(), productId: p.id, name: p.name, qty: r.qty, spec: r.spec,
      turnaround: cfg.turnaround, turnLabel: r.turnLabel, artwork: cfg.artwork, artLabel: r.artLabel,
      file: cfg.file ? cfg.file.name : null, notes: $("#qNotes").value.trim(), total: r.total, sample: r.sample,
      cfg: { size: cfg.size, paper: cfg.paper, sides: cfg.sides }
    });
    saveBasket();
    renderBasket();
    toast(`Added ${r.qty.toLocaleString()} × ${p.name} to your basket`);
    open("basket");
  }

  function renderBasket() {
    const items = $("#basketItems");
    if (!basket.length) {
      items.innerHTML = '<p class="empty">Your basket is empty. <a href="#quote" data-close>Get a quote</a></p>';
    } else {
      items.innerHTML = basket.map(i => `<div class="b-item">
        <div><b>${i.qty.toLocaleString()} × ${esc(i.name)}</b>
          <small>${esc(i.spec)}<br>${esc(i.turnLabel)} · ${i.file ? "📎 " + esc(i.file) : esc(i.artLabel)}</small></div>
        <div class="b-right"><b>${S.money(i.total)}</b><button class="link-btn" data-remove="${i.key}">Remove</button></div>
      </div>`).join("");
    }
    const t = S.basketTotals(basket, promo, "collect");
    const gap = S.FREE_CARDS_THRESHOLD - (t.subtotal - t.discount);
    $("#reward").innerHTML = basket.length
      ? (t.freeCards ? "🎉 You've unlocked <b>250 FREE business cards</b> with this order!"
        : `Spend <b>${S.money(gap)}</b> more to get <b>250 FREE business cards</b>.<span class="bar"><i style="width:${Math.min(100, (t.subtotal / S.FREE_CARDS_THRESHOLD) * 100)}%"></i></span>`)
      : "";
    $("#basketTotals").innerHTML = totalsHTML(t, false);
    $("#checkoutBtn").disabled = !basket.length;
    $("#promoInput").value = promo;
  }

  function totalsHTML(t, withDelivery) {
    let h = `<dt>Subtotal</dt><dd>${S.money(t.subtotal)}</dd>`;
    if (t.discount) h += `<dt>${esc(t.promo.label)}</dt><dd>−${S.money(t.discount)}</dd>`;
    if (withDelivery) h += `<dt>Delivery</dt><dd>${t.delivery ? S.money(t.delivery) : "Free"}</dd>`;
    if (t.freeCards) h += `<dt>250 Business cards</dt><dd>FREE</dd>`;
    h += `<dt class="grand">Total</dt><dd class="grand">${S.money(t.total)}</dd>`;
    return h;
  }

  // ---------- Panels ----------
  function open(which) {
    closeAll();
    $("#overlay").hidden = false;
    if (which === "basket") { renderBasket(); $("#basketDrawer").classList.add("open"); $("#basketDrawer").setAttribute("aria-hidden", "false"); }
    if (which === "checkout") { renderCheckout(); $("#checkoutModal").hidden = false; }
    if (which === "confirm") $("#confirmModal").hidden = false;
    if (which === "track") { $("#trackModal").hidden = false; $("#trackResults").innerHTML = recentOrdersHTML(); setTimeout(() => $("#trackInput").focus(), 50); }
    document.body.classList.add("locked");
  }
  function closeAll() {
    $("#overlay").hidden = true;
    $("#basketDrawer").classList.remove("open");
    $("#basketDrawer").setAttribute("aria-hidden", "true");
    $$(".modal").forEach(m => (m.hidden = true));
    document.body.classList.remove("locked");
  }

  // ---------- Checkout ----------
  let coDelivery = "collect", coPay = "card";
  const PAY = [
    { id: "card", label: "Card / Apple Pay / Google Pay", detail: "Secure online payment (demo: not charged)" },
    { id: "paypal", label: "PayPal", detail: "" },
    { id: "bank", label: "Bank transfer", detail: "We'll email our bank details with your proof" },
    { id: "collection", label: "Pay on collection", detail: "Card or cash in the shop" }
  ];
  function renderCheckout() {
    chips($("#coDelivery"), KP.delivery, coDelivery, "co-delivery", o => `${esc(o.label)} <small>${esc(o.detail)} · ${o.price ? S.money(o.price) : "Free"}</small>`);
    chips($("#coPay"), PAY, coPay, "co-pay", o => `${esc(o.label)} ${o.detail ? "<small>" + esc(o.detail) + "</small>" : ""}`);
    $("#addressFields").hidden = coDelivery === "collect";
    $$("#addressFields input").forEach(i => (i.required = coDelivery !== "collect"));
    $("#coTotals").innerHTML = totalsHTML(S.basketTotals(basket, promo, coDelivery), true);
  }

  function placeOrder(form) {
    const fd = Object.fromEntries(new FormData(form));
    const t = S.basketTotals(basket, promo, coDelivery);
    const order = {
      id: S.newOrderId(), date: new Date().toISOString(), status: "New",
      customer: { name: fd.name, business: fd.business, email: fd.email.toLowerCase(), phone: fd.phone },
      delivery: { method: coDelivery, address: [fd.address1, fd.town, fd.postcode].filter(Boolean).join(", ") },
      proofBy: fd.proofBy, payment: coPay, promo: t.promo ? promo : null,
      items: basket.map(i => ({ ...i })), subtotal: t.subtotal, discount: t.discount, deliveryCost: t.delivery,
      total: t.total, freeCards: t.freeCards, source: "Website"
    };
    const orders = S.orders();
    orders.unshift(order);
    S.saveOrders(orders);
    S.LS.set("kp_last_email", order.customer.email);
    basket = []; promo = ""; saveBasket();
    $("#confirmBody").innerHTML = `
      <div class="confirm">
        <div class="tick">✔</div>
        <h2>Thanks ${esc(fd.name.split(" ")[0])}! Your order is in.</h2>
        <p>Order number <b class="order-no">${order.id}</b></p>
        <p>We'll send your free proof by <b>${esc(fd.proofBy)}</b>, usually within 2 working hours. Nothing is printed until you approve it.</p>
        ${timelineHTML(order.status)}
        <p class="muted">Total ${S.money(order.total)} · ${esc(S.findOpt(KP.delivery, coDelivery).label)}${order.freeCards ? " · includes 250 free business cards" : ""}</p>
        <div class="row-btns">
          <button class="btn btn-ghost" data-open="track">Track this order</button>
          <button class="btn btn-primary" data-close>Continue shopping</button>
        </div>
      </div>`;
    open("confirm");
  }

  function timelineHTML(status) {
    const idx = S.STATUSES.indexOf(status);
    return `<ol class="timeline">${S.STATUSES.map((s, i) => `<li class="${i < idx ? "done" : i === idx ? "now" : ""}">${s}</li>`).join("")}</ol>`;
  }

  // ---------- Track & reorder ----------
  function orderCard(o) {
    return `<div class="order-card">
      <div class="oc-head"><b>${o.id}</b><span class="status s-${o.status.toLowerCase().replace(/\s/g, "-")}">${esc(o.status)}</span></div>
      <small>${new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${S.money(o.total)}</small>
      <ul>${o.items.map(i => `<li>${i.qty.toLocaleString()} × ${esc(i.name)}</li>`).join("")}</ul>
      ${timelineHTML(o.status)}
      <button class="btn btn-primary btn-sm" data-reorder="${o.id}">Reorder all</button>
    </div>`;
  }
  function recentOrdersHTML() {
    const email = S.LS.get("kp_last_email", "");
    if (!email) return '<p class="muted">Enter your order number or the email you ordered with.</p>';
    const mine = S.orders().filter(o => o.customer.email === email).slice(0, 3);
    return mine.length ? `<p class="muted">Your recent orders</p>${mine.map(orderCard).join("")}` : "";
  }
  function track(q) {
    q = q.trim().toLowerCase();
    const found = S.orders().filter(o => o.id.toLowerCase() === q || o.customer.email === q);
    $("#trackResults").innerHTML = found.length ? found.map(orderCard).join("")
      : '<p class="muted">No orders found. Check the number, or call us on 01925 637955.</p>';
  }
  function reorder(id) {
    const o = S.orders().find(x => x.id === id);
    if (!o) return;
    o.items.forEach(i => {
      const fresh = S.priceItem({ productId: i.productId, qty: i.qty, turnaround: "standard", artwork: "upload", ...i.cfg });
      basket.push({ ...i, key: Date.now() + Math.random(), total: fresh.total, turnaround: "standard", turnLabel: "Standard", artwork: "upload", artLabel: "Same artwork as last time", file: i.file || "Previous artwork on file" });
    });
    saveBasket();
    toast(`${o.items.length} item(s) from ${o.id} added to your basket`);
    open("basket");
  }

  // ---------- Static sections ----------
  function renderStatic() {
    $("#bundleGrid").innerHTML = KP.bundles.map(b => `<div class="bundle">
      <span class="badge hot">${esc(b.tag)}</span>
      <h3>${esc(b.name)}</h3>
      <ul>${b.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
      <p class="bundle-price"><b>${S.money(b.price)}</b> <s>${S.money(b.was)}</s> <span class="save">Save ${S.money(b.was - b.price)}</span></p>
      ${b.sample ? '<span class="badge sample">Sample</span>' : ""}
      <button class="btn btn-primary btn-block" data-bundle="${b.id}">Add bundle</button>
    </div>`).join("");
    $("#industryGrid").innerHTML = KP.industries.map(i => `<div class="industry"><h3>${esc(i.name)}</h3><p>${esc(i.items)}</p></div>`).join("");
    $("#reviewGrid").innerHTML = KP.reviews.map(r => `<figure class="review"><div class="stars" aria-label="${r.stars} stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join("");
    $("#faqList").innerHTML = KP.faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
    $("#areaList").innerHTML = KP.areas.map(a => `<li>${esc(a)}</li>`).join("");
    $("#hoursTable").innerHTML = KP.business.hours.map(([d, h]) => `<tr><th>${d}</th><td>${h}</td></tr>`).join("");
    $("#year").textContent = new Date().getFullYear();
    $("#qProduct").innerHTML = KP.categories.map(c => `<optgroup label="${esc(c.name)}">${KP.products.filter(p => p.cat === c.id).map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</optgroup>`).join("");
  }

  function addBundle(id) {
    const b = KP.bundles.find(x => x.id === id);
    basket.push({ key: Date.now(), productId: "bundle-" + b.id, name: b.name, qty: 1, spec: b.items.join(" · "), turnaround: "standard", turnLabel: "Standard", artwork: "free", artLabel: "Free artwork help", file: null, notes: "", total: b.price, sample: true, cfg: {} });
    saveBasket();
    toast(`${b.name} added`);
    open("basket");
  }

  function saveLead(type, data) {
    const leads = S.leads();
    leads.unshift({ id: "L-" + Date.now().toString().slice(-6), type, date: new Date().toISOString(), ...data });
    S.saveLeads(leads);
  }

  // ---------- Events ----------
  document.addEventListener("click", e => {
    const t = e.target.closest("button, a");
    if (!t) return;
    if (t.dataset.cat) { activeCat = t.dataset.cat; renderFilters(); renderProducts(); return; }
    if (t.dataset.quote) {
      e.preventDefault();
      closeAll();
      setProduct(t.dataset.quote, t.dataset.qty ? Number(t.dataset.qty) : null);
      $("#quote").scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (t.dataset.key) {
      const k = t.dataset.key, v = t.dataset.val;
      if (k === "co-delivery") { coDelivery = v; renderCheckout(); return; }
      if (k === "co-pay") { coPay = v; renderCheckout(); return; }
      cfg[k] = k === "qty" ? Number(v) : v;
      renderQuote();
      return;
    }
    if (t.dataset.open) { e.preventDefault(); open(t.dataset.open); return; }
    if (t.hasAttribute("data-close")) { closeAll(); return; }
    if (t.dataset.remove) { basket = basket.filter(i => String(i.key) !== t.dataset.remove); saveBasket(); renderBasket(); return; }
    if (t.dataset.reorder) { reorder(t.dataset.reorder); return; }
    if (t.dataset.bundle) { addBundle(t.dataset.bundle); return; }
    if (t.id === "removeFile") { cfg.file = null; $("#preflight").hidden = true; $("#artFile").value = ""; $("#dropInner").innerHTML = "<strong>Drop your artwork here</strong> or <u>browse</u><small>PDF, JPG, PNG, AI, PSD, Word or Publisher, up to 100MB</small>"; return; }
    if (t.closest(".main-nav") && t.tagName === "A") toggleMenu(false);
  });

  $("#overlay").addEventListener("click", closeAll);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
  $("#qProduct").addEventListener("change", e => setProduct(e.target.value));
  $("#addToBasket").addEventListener("click", addToBasket);
  $("#saveQuote").addEventListener("click", () => {
    const email = prompt("Which email should we send this quote to?");
    if (!email) return;
    const p = S.product(cfg.productId), r = S.priceItem(cfg);
    const quotes = S.quotes();
    quotes.unshift({ id: "Q-" + Date.now().toString().slice(-6), date: new Date().toISOString(), email, product: p.name, qty: r.qty, spec: r.spec, total: r.total });
    S.saveQuotes(quotes);
    toast(`Quote saved. In the live site, it's emailed to ${email} with a follow-up reminder in 3 days.`);
  });
  $("#checkoutBtn").addEventListener("click", () => open("checkout"));
  $("#checkoutForm").addEventListener("submit", e => { e.preventDefault(); placeOrder(e.target); e.target.reset(); });
  $("#promoApply").addEventListener("click", () => {
    const code = $("#promoInput").value.trim().toUpperCase();
    if (S.PROMOS[code]) { promo = code; saveBasket(); renderBasket(); toast(S.PROMOS[code].label + " applied"); }
    else toast("That code isn't valid");
  });
  $("#trackForm").addEventListener("submit", e => { e.preventDefault(); track($("#trackInput").value); });
  $("#accountForm").addEventListener("submit", e => {
    e.preventDefault(); saveLead("Trade account", Object.fromEntries(new FormData(e.target))); e.target.reset();
    toast("Thanks! We'll set up your trade account within 1 working day.");
  });
  $("#contactForm").addEventListener("submit", e => {
    e.preventDefault(); saveLead("Enquiry", Object.fromEntries(new FormData(e.target))); e.target.reset();
    toast("Thanks! We'll reply within 2 working hours.");
  });

  // Upload
  const dz = $("#dropzone"), fileInput = $("#artFile");
  dz.addEventListener("click", e => { if (!e.target.closest("button")) fileInput.click(); });
  dz.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
  ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("over"); }));
  dz.addEventListener("drop", e => handleFile(e.dataTransfer.files[0]));

  // Mobile menu
  function toggleMenu(force) {
    const nav = $("#mainNav"), btn = $("#menuToggle");
    const openNow = force != null ? force : !nav.classList.contains("open");
    nav.classList.toggle("open", openNow);
    btn.setAttribute("aria-expanded", String(openNow));
  }
  $("#menuToggle").addEventListener("click", () => toggleMenu());

  // ---------- Init ----------
  renderStatic();
  renderFilters();
  renderProducts();
  setProduct("business-cards", 1000);
  updateCount();
})();
