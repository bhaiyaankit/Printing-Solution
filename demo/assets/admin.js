// Staff dashboard: orders, statuses, KPIs, quote follow-ups, leads.
(function () {
  const S = KPStore;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
  }

  $("#statusFilter").innerHTML += S.STATUSES.map(s => `<option>${s}</option>`).join("");

  function render() {
    const orders = S.orders();
    renderKPIs(orders);
    renderTable(orders);
    renderTodo(orders);
    renderByProduct(orders);
    renderQuotes(orders);
    renderLeads();
  }

  function renderKPIs(orders) {
    const cutoff = Date.now() - 30 * 864e5;
    const monthOrders = orders.filter(o => new Date(o.date).getTime() >= cutoff);
    const revenue = monthOrders.reduce((s, o) => s + o.total, 0);
    const aov = monthOrders.length ? revenue / monthOrders.length : 0;
    const open = orders.filter(o => !["Completed", "Dispatched"].includes(o.status)).length;
    const emails = orders.map(o => o.customer.email);
    const repeat = new Set(emails.filter((e, i) => emails.indexOf(e) !== i)).size;
    const customers = new Set(emails).size;
    const quotes = S.quotes();
    const conv = quotes.length + orders.length ? Math.round((orders.length / (quotes.length + orders.length)) * 100) : 0;
    $("#kpis").innerHTML = [
      ["Revenue, last 30 days", S.money(revenue), `${monthOrders.length} orders`, "accent"],
      ["Average order", S.money(aov), "per order"],
      ["Jobs in progress", open, "not yet dispatched"],
      ["Repeat customers", `${repeat}/${customers}`, "ordered more than once"],
      ["Quote → order", conv + "%", `${quotes.length} open quotes`]
    ].map(([l, v, sub, cls]) => `<div class="kpi ${cls || ""}"><span>${l}</span><b>${v}</b><small>${sub}</small></div>`).join("");
  }

  function renderTable(orders) {
    const q = $("#search").value.trim().toLowerCase();
    const st = $("#statusFilter").value;
    const rows = orders.filter(o => (!st || o.status === st) &&
      (!q || [o.id, o.customer.name, o.customer.business, o.customer.email, ...o.items.map(i => i.name)].join(" ").toLowerCase().includes(q)));
    const head = `<tr><th>Order</th><th>Customer</th><th>Items</th><th class="hide-sm">Due</th><th>Status</th><th style="text-align:right">Total</th></tr>`;
    if (!rows.length) {
      $("#ordersTable").innerHTML = head + `<tr><td colspan="6" class="empty-row">No orders yet. Place one on the <a href="index.html">shop</a>, or click <b>Load sample orders</b>.</td></tr>`;
      return;
    }
    $("#ordersTable").innerHTML = head + rows.map(o => `<tr>
      <td><button class="link-btn" data-view="${o.id}">${o.id}</button><br><small class="muted">${fmtDate(o.date)} · ${esc(o.source || "Website")}</small></td>
      <td class="who">${esc(o.customer.name)}<small>${esc(o.customer.business || o.customer.email)}</small></td>
      <td class="what">${o.items.map(i => `${i.qty.toLocaleString()} × ${esc(i.name)}`).join("<br>")}<small>${o.items.some(i => i.turnaround !== "standard") ? "⚡ Rush" : ""} ${o.items.some(i => i.file) ? "📎 Artwork" : "⚠ Needs artwork"}</small></td>
      <td class="hide-sm">${esc(dueLabel(o))}</td>
      <td><select data-status="${o.id}" aria-label="Status for ${o.id}">${S.STATUSES.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></td>
      <td class="num">${S.money(o.total)}</td>
    </tr>`).join("");
  }

  function dueLabel(o) {
    const rush = o.items.some(i => i.turnaround !== "standard");
    const d = new Date(o.date);
    let add = rush ? 1 : 4;
    while (add > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6 !== 0) add--; }
    return fmtDate(d) + (rush ? " ⚡" : "");
  }

  function renderTodo(orders) {
    const count = s => orders.filter(o => o.status === s).length;
    const noArt = orders.filter(o => o.status === "New" && !o.items.some(i => i.file)).length;
    const items = [
      ["Send proofs for new orders", count("New")],
      ["Chase artwork", noArt],
      ["Waiting for customer approval", count("Proof sent")],
      ["Ready to print", count("Approved")],
      ["Ready for collection: text customer", count("Ready")],
      ["Quotes to chase", S.quotes().length]
    ];
    $("#todo").innerHTML = items.map(([l, n]) => `<li>${l}<span class="count ${n ? "" : "zero"}">${n}</span></li>`).join("");
  }

  function renderByProduct(orders) {
    const map = {};
    orders.forEach(o => o.items.forEach(i => { map[i.name] = (map[i.name] || 0) + i.total; }));
    const arr = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const max = arr.length ? arr[0][1] : 1;
    $("#byProduct").innerHTML = arr.length ? arr.map(([n, v]) =>
      `<div class="bar-row"><span title="${esc(n)}">${esc(n)}</span><span class="track"><span class="fill" style="width:${(v / max) * 100}%;display:block"></span></span><b>${S.money(v)}</b></div>`).join("")
      : '<p class="muted small">No sales yet.</p>';
  }

  function renderQuotes() {
    const quotes = S.quotes().slice(0, 6);
    $("#quotes").innerHTML = quotes.length ? quotes.map(q => `<li><div>${esc(q.email)}<small>${q.qty.toLocaleString()} × ${esc(q.product)} · ${fmtDate(q.date)}</small></div>
      <div><b>${S.money(q.total)}</b><br><button class="link-btn small" data-chase="${q.id}">Chase</button></div></li>`).join("")
      : '<li class="muted small">No open quotes. Use "Email me this quote" on the shop.</li>';
  }

  function renderLeads() {
    const leads = S.leads().slice(0, 6);
    $("#leads").innerHTML = leads.length ? leads.map(l => `<li><div>${esc(l.biz || l.name)}<small>${esc(l.type)} · ${esc(l.email || l.contact || "")}${l.msg ? " · " + esc(l.msg) : ""}</small></div><small>${fmtDate(l.date)}</small></li>`).join("")
      : '<li class="muted small">No enquiries yet.</li>';
  }

  function showOrder(id) {
    const o = S.orders().find(x => x.id === id);
    if (!o) return;
    const del = S.findOpt(KP.delivery, o.delivery.method);
    const first = o.customer.name.split(" ")[0];
    const proofMsg = `Hi ${first}, this is Kwality Printer. Your proof for order ${o.id} is ready. Please reply YES to approve and we'll start printing.`;
    const readyMsg = `Hi ${first}, your order ${o.id} is ready for collection at 26 Padgate Lane. Thanks for choosing Kwality Printer!`;
    const wa = msg => "https://wa.me/" + o.customer.phone.replace(/\D/g, "").replace(/^0/, "44") + "?text=" + encodeURIComponent(msg);
    $("#orderDetail").innerHTML = `<div class="detail">
      <h2>${o.id} <span class="status s-${o.status.toLowerCase().replace(/\s/g, "-")}">${esc(o.status)}</span></h2>
      <dl>
        <dt>Customer</dt><dd>${esc(o.customer.name)}${o.customer.business ? ", " + esc(o.customer.business) : ""}</dd>
        <dt>Contact</dt><dd>${esc(o.customer.email)} · ${esc(o.customer.phone)}</dd>
        <dt>Placed</dt><dd>${new Date(o.date).toLocaleString("en-GB")}</dd>
        <dt>Delivery</dt><dd>${esc(del.label)}${o.delivery.address ? "<br>" + esc(o.delivery.address) : ""}</dd>
        <dt>Proof by</dt><dd>${esc(o.proofBy)}</dd>
        <dt>Payment</dt><dd>${esc(o.payment)}</dd>
        <dt>Total</dt><dd><b>${S.money(o.total)}</b>${o.discount ? ` (incl. −${S.money(o.discount)} ${esc(o.promo)})` : ""}${o.freeCards ? " + 250 free business cards" : ""}</dd>
      </dl>
      <ul class="items">${o.items.map(i => `<li><b>${i.qty.toLocaleString()} × ${esc(i.name)}</b> · ${S.money(i.total)}
        <small>${esc(i.spec)}</small><small>${esc(i.turnLabel)} · ${i.file ? "📎 " + esc(i.file) : esc(i.artLabel)}</small>${i.notes ? `<small>Note: ${esc(i.notes)}</small>` : ""}</li>`).join("")}</ul>
      <div class="acts">
        <a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${wa(proofMsg)}">WhatsApp proof</a>
        <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${wa(readyMsg)}">WhatsApp "ready"</a>
        <button class="btn btn-ghost btn-sm" data-advance="${o.id}">Move to next stage →</button>
        <button class="btn btn-ghost btn-sm" onclick="window.print()">Print job sheet</button>
      </div>
    </div>`;
    $("#overlay").hidden = false;
    $("#orderModal").hidden = false;
  }
  function closeModal() { $("#overlay").hidden = true; $("#orderModal").hidden = true; }

  function setStatus(id, status) {
    const orders = S.orders();
    const o = orders.find(x => x.id === id);
    if (!o) return;
    o.status = status;
    S.saveOrders(orders);
    render();
    toast(`${id} → ${status}. In the live system, the customer gets an automatic text.`);
  }

  // Sample data so the dashboard looks alive in a pitch.
  function seed() {
    const people = [
      ["Raj Patel", "Spice Garden Takeaway", "takeaway-menus", 10000],
      ["Claire Bennett", "CB Hair Studio", "business-cards", 1000],
      ["Mark Jones", "MJ Plumbing & Heating", "business-cards", 500],
      ["Sarah Ahmed", "Sankey Estates", "leaflets", 10000],
      ["Tom Rigby", "Birchwood Gym", "roller-banners", 2],
      ["Priya Shah", "Lotus Indian Kitchen", "takeaway-menus", 20000],
      ["Gary Holt", "Holt Builders Ltd", "letterheads", 500],
      ["St Oswald's PTA", "", "posters", 50],
      ["Claire Bennett", "CB Hair Studio", "leaflets", 5000],
      ["Dan Murphy", "Murphy's Bar", "pvc-banners", 3],
      ["Raj Patel", "Spice Garden Takeaway", "stickers", 500],
      ["Amy Clarke", "Clarke Weddings", "booklets", 100]
    ];
    const orders = S.orders();
    people.forEach(([name, biz, pid, qty], idx) => {
      const p = S.product(pid);
      const turnaround = idx % 4 === 0 ? "express" : "standard";
      const r = S.priceItem({ productId: pid, qty, turnaround, artwork: idx % 3 === 0 ? "free" : "upload" });
      const d = new Date(); d.setDate(d.getDate() - idx * 2); d.setHours(9 + (idx % 8));
      const email = name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.$/, "") + "@example.com";
      orders.push({
        id: S.newOrderId(), date: d.toISOString(), status: S.STATUSES[idx % S.STATUSES.length],
        customer: { name, business: biz, email, phone: "07700 900" + String(100 + idx).slice(-3) },
        delivery: { method: idx % 2 ? "collect" : "uk", address: idx % 2 ? "" : "Warrington" }, proofBy: "WhatsApp",
        payment: "card", items: [{ productId: pid, name: p.name, qty: r.qty, spec: r.spec, turnaround, turnLabel: r.turnLabel, artwork: "upload", artLabel: r.artLabel, file: idx % 5 === 2 ? null : "artwork.pdf", total: r.total, cfg: {} }],
        subtotal: r.total, discount: 0, deliveryCost: 0, total: r.total, source: ["Website", "Website", "Phone", "WhatsApp"][idx % 4]
      });
    });
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    S.saveOrders(orders);
    const quotes = S.quotes();
    quotes.push(
      { id: "Q-1001", date: new Date().toISOString(), email: "info@warringtonvets.example", product: "Leaflets & Flyers", qty: 5000, spec: "A5", total: 117.3 },
      { id: "Q-1002", date: new Date(Date.now() - 864e5).toISOString(), email: "hello@lymmbakery.example", product: "Printed Carry Bags", qty: 500, spec: "Medium", total: 348.75 }
    );
    S.saveQuotes(quotes);
    render();
    toast("Sample orders loaded");
  }

  function exportCSV() {
    const rows = [["Order", "Date", "Status", "Customer", "Business", "Email", "Phone", "Items", "Total"]];
    S.orders().forEach(o => rows.push([o.id, o.date.slice(0, 10), o.status, o.customer.name, o.customer.business || "", o.customer.email, o.customer.phone,
      o.items.map(i => `${i.qty} x ${i.name}`).join("; "), o.total.toFixed(2)]));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "kwality-orders.csv";
    a.click();
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("button, a");
    if (!t) return;
    if (t.dataset.view) showOrder(t.dataset.view);
    if (t.hasAttribute("data-close")) closeModal();
    if (t.dataset.advance) {
      const o = S.orders().find(x => x.id === t.dataset.advance);
      const next = S.STATUSES[Math.min(S.STATUSES.indexOf(o.status) + 1, S.STATUSES.length - 1)];
      setStatus(o.id, next); showOrder(o.id);
    }
    if (t.dataset.chase) toast("In the live system, this sends a follow-up email with a 5% discount code.");
  });
  document.addEventListener("change", e => { if (e.target.dataset.status) setStatus(e.target.dataset.status, e.target.value); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  $("#overlay").addEventListener("click", closeModal);
  $("#search").addEventListener("input", render);
  $("#statusFilter").addEventListener("change", render);
  $("#seedBtn").addEventListener("click", seed);
  $("#exportBtn").addEventListener("click", exportCSV);
  $("#clearBtn").addEventListener("click", () => {
    if (!confirm("Clear all demo orders, quotes and leads from this browser?")) return;
    ["kp_orders", "kp_quotes", "kp_leads"].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    render();
  });

  render();
})();
