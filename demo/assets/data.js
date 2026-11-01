// Product catalogue for the Kwality Printer demo.
// real: true  -> price taken from Kwality Printer's current website.
// real: false -> sample price for the demo; confirm with the owner before going live.

var KP = (window.KP = window.KP || {});

KP.business = {
  name: "Kwality Printer",
  tagline: "Warrington's best-value printer",
  phone: "01925 637955",
  phoneIntl: "+441925637955",
  mobile: "07913 654662",
  whatsapp: "447913654662",
  email: "kwalityprinter@gmail.com",
  address: "26 Padgate Lane, Warrington WA1 3RX",
  mapQuery: "26 Padgate Lane Warrington WA1 3RX",
  hours: [
    ["Mon – Fri", "9:00 – 18:00"],
    ["Saturday", "10:00 – 15:00"],
    ["Sunday", "Closed"]
  ],
  hoursAreSample: true
};

KP.categories = [
  { id: "stationery", name: "Business Stationery" },
  { id: "marketing", name: "Leaflets & Marketing" },
  { id: "hospitality", name: "Takeaway & Hospitality" },
  { id: "large", name: "Posters & Large Format" },
  { id: "promo", name: "Promotional & Other" }
];

// Paper/finish options add a multiplier to the base tier price.
const PAPER_CARD = [
  { id: "350silk", label: "350gsm Silk", mult: 1 },
  { id: "350gloss", label: "350gsm Gloss", mult: 1 },
  { id: "350matt", label: "350gsm Matt", mult: 1 },
  { id: "450lam", label: "450gsm Soft-touch laminated (premium)", mult: 1.6, sample: true }
];
const PAPER_BOND = [
  { id: "120bond", label: "120gsm Bond", mult: 1 },
  { id: "150bond", label: "150gsm Premium Bond", mult: 1.2, sample: true }
];
const PAPER_LEAFLET = [
  { id: "100bond", label: "100gsm Bond", mult: 1 },
  { id: "130gloss", label: "130gsm Gloss", mult: 1.15, sample: true },
  { id: "170silk", label: "170gsm Silk", mult: 1.35, sample: true }
];

KP.products = [
  {
    id: "business-cards", name: "Business Cards", cat: "stationery", real: true, popular: true,
    icon: "card", desc: "Full colour cards on 350gsm board. Glossy, silk or matt.",
    sizes: [{ id: "85x55", label: "Standard 85 × 55mm", mult: 1 }],
    papers: PAPER_CARD,
    sides: [{ id: "2", label: "Double sided", add: 0 }],
    tiers: [[250, 29], [500, 39], [1000, 49]]
  },
  {
    id: "takeaway-menus", name: "Takeaway Menus", cat: "hospitality", real: true, popular: true,
    icon: "menu", desc: "A4 full colour on 130gsm gloss, double sided and folded.",
    sizes: [{ id: "a4fold", label: "A4 folded to A5 / DL", mult: 1 }],
    papers: [{ id: "130gloss", label: "130gsm Gloss", mult: 1 }, { id: "170gloss", label: "170gsm Gloss (thicker)", mult: 1.18, sample: true }],
    sides: [{ id: "2", label: "Double sided", add: 0 }],
    tiers: [[5000, 249], [10000, 349], [20000, 599], [50000, 850]]
  },
  {
    id: "leaflets", name: "Leaflets & Flyers", cat: "marketing", real: true, popular: true,
    icon: "leaflet", desc: "Full colour leaflets. 10,000 A6 for just £99.",
    note: "The 10,000 × A6 100gsm price is their current offer. The other sizes and quantities are sample prices.",
    sizes: [
      { id: "a6", label: "A6 (105 × 148mm)", mult: 1 },
      { id: "a5", label: "A5 (148 × 210mm)", mult: 1.7, sample: true },
      { id: "dl", label: "DL (99 × 210mm)", mult: 1.5, sample: true },
      { id: "a4", label: "A4 (210 × 297mm)", mult: 2.9, sample: true }
    ],
    papers: PAPER_LEAFLET,
    sides: [{ id: "1", label: "Single sided", add: 0 }, { id: "2", label: "Double sided", addPct: 0.2, sample: true }],
    tiers: [[1000, 35, true], [2500, 49, true], [5000, 69, true], [10000, 99], [25000, 199, true]]
  },
  {
    id: "letterheads", name: "Letterheads", cat: "stationery", real: true,
    icon: "doc", desc: "A4, 120gsm bond, full colour. Laser and inkjet safe.",
    sizes: [{ id: "a4", label: "A4", mult: 1 }],
    papers: PAPER_BOND,
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    tiers: [[250, 39], [500, 65], [1000, 99]]
  },
  {
    id: "compliment-slips", name: "Compliment Slips", cat: "stationery", real: true,
    icon: "slip", desc: "DL, 120gsm bond, full colour.",
    sizes: [{ id: "dl", label: "DL (99 × 210mm)", mult: 1 }],
    papers: PAPER_BOND,
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    tiers: [[250, 35], [500, 59], [1000, 89]]
  },
  {
    id: "envelopes", name: "Printed Envelopes", cat: "stationery", real: true,
    icon: "envelope", desc: "Printed one side, full colour, 120gsm.",
    sizes: [{ id: "dl", label: "DL", mult: 1 }, { id: "c5", label: "C5", mult: 1.15, sample: true }],
    papers: [{ id: "120", label: "120gsm White", mult: 1 }],
    sides: [{ id: "1", label: "One side", add: 0 }],
    tiers: [[250, 49], [500, 89], [1000, 149]]
  },
  {
    id: "posters", name: "Posters", cat: "large", real: true,
    icon: "poster", desc: "Special glossy poster paper. A4 50p, A3 75p, A2 £2 each.",
    note: "Price per poster. Minimum order of 20.",
    perUnit: true, minQty: 20,
    sizes: [
      { id: "a4", label: "A4", unit: 0.5 },
      { id: "a3", label: "A3", unit: 0.75 },
      { id: "a2", label: "A2", unit: 2 },
      { id: "a1", label: "A1", unit: 6, sample: true },
      { id: "a0", label: "A0", unit: 12, sample: true }
    ],
    papers: [{ id: "gloss", label: "Glossy poster paper", mult: 1 }, { id: "satin", label: "Satin photo paper", mult: 1.4, sample: true }],
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    qtyChoices: [20, 50, 100, 250, 500]
  },
  {
    id: "postcards", name: "Postcards", cat: "marketing", real: true,
    icon: "card", desc: "Full colour postcards from £49 for 250.",
    sizes: [{ id: "a6", label: "A6", mult: 1 }],
    papers: PAPER_CARD.slice(0, 3),
    sides: [{ id: "2", label: "Double sided", add: 0 }],
    tiers: [[250, 49], [500, 65, true], [1000, 85, true]]
  },
  {
    id: "brochures", name: "Brochures", cat: "marketing", real: false,
    icon: "booklet", desc: "Folded brochures with tri-fold or half-fold.",
    sizes: [{ id: "a4tri", label: "A4 tri-fold", mult: 1 }, { id: "a4half", label: "A4 half-fold", mult: 1 }, { id: "a3half", label: "A3 half-fold", mult: 1.8 }],
    papers: [{ id: "150silk", label: "150gsm Silk", mult: 1 }, { id: "170gloss", label: "170gsm Gloss", mult: 1.1 }],
    sides: [{ id: "2", label: "Double sided", add: 0 }],
    tiers: [[250, 79], [500, 109], [1000, 159], [2500, 289]]
  },
  {
    id: "booklets", name: "Booklets", cat: "marketing", real: false,
    icon: "booklet", desc: "Stapled booklets for catalogues, programmes and price lists.",
    sizes: [{ id: "a5-8", label: "A5, 8 pages", mult: 1 }, { id: "a5-12", label: "A5, 12 pages", mult: 1.4 }, { id: "a5-16", label: "A5, 16 pages", mult: 1.8 }, { id: "a4-8", label: "A4, 8 pages", mult: 1.7 }],
    papers: [{ id: "130silk", label: "130gsm Silk", mult: 1 }, { id: "170silk", label: "170gsm Silk", mult: 1.15 }],
    sides: [{ id: "2", label: "Full colour throughout", add: 0 }],
    tiers: [[100, 99], [250, 169], [500, 259], [1000, 399]]
  },
  {
    id: "notepads", name: "Notepads", cat: "stationery", real: false,
    icon: "notepad", desc: "Branded notepads, 50 sheets, glued top with backing board.",
    sizes: [{ id: "a6", label: "A6", mult: 0.7 }, { id: "a5", label: "A5", mult: 1 }, { id: "a4", label: "A4", mult: 1.6 }],
    papers: [{ id: "100bond", label: "100gsm Bond", mult: 1 }],
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    tiers: [[10, 45], [25, 85], [50, 149], [100, 259]]
  },
  {
    id: "stickers", name: "Stickers & Labels", cat: "promo", real: false,
    icon: "sticker", desc: "Kiss-cut vinyl or paper stickers in any shape.",
    sizes: [{ id: "50", label: "50mm circle / square", mult: 1 }, { id: "75", label: "75mm", mult: 1.4 }, { id: "100", label: "100mm", mult: 1.9 }],
    papers: [{ id: "paper", label: "Gloss paper", mult: 1 }, { id: "vinyl", label: "Waterproof vinyl", mult: 1.5 }],
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    tiers: [[250, 39], [500, 59], [1000, 89], [5000, 299]]
  },
  {
    id: "scratch-cards", name: "Scratch Cards", cat: "promo", real: false,
    icon: "card", desc: "Promotional scratch cards for offers and competitions.",
    sizes: [{ id: "85x55", label: "85 × 55mm", mult: 1 }, { id: "a6", label: "A6", mult: 1.5 }],
    papers: [{ id: "350", label: "350gsm board", mult: 1 }],
    sides: [{ id: "2", label: "Double sided with scratch panel", add: 0 }],
    tiers: [[500, 99], [1000, 159], [5000, 549]]
  },
  {
    id: "bookmarks", name: "Bookmarks", cat: "promo", real: false,
    icon: "bookmark", desc: "Great for schools, libraries, churches and authors.",
    sizes: [{ id: "50x210", label: "50 × 210mm", mult: 1 }],
    papers: PAPER_CARD.slice(0, 3),
    sides: [{ id: "2", label: "Double sided", add: 0 }],
    tiers: [[250, 35], [500, 49], [1000, 69]]
  },
  {
    id: "carry-bags", name: "Printed Carry Bags", cat: "promo", real: false,
    icon: "bag", desc: "Paper carrier bags with your logo, one colour print.",
    sizes: [{ id: "small", label: "Small (18 × 22cm)", mult: 1 }, { id: "medium", label: "Medium (26 × 32cm)", mult: 1.25 }, { id: "large", label: "Large (32 × 41cm)", mult: 1.5 }],
    papers: [{ id: "kraft", label: "Brown kraft", mult: 1 }, { id: "white", label: "White kraft", mult: 1.1 }],
    sides: [{ id: "1", label: "One side", add: 0 }, { id: "2", label: "Both sides", addPct: 0.25 }],
    tiers: [[250, 179], [500, 279], [1000, 449]]
  },
  {
    id: "calendars", name: "Calendars", cat: "promo", real: false,
    icon: "calendar", desc: "Wall or desk calendars. Ideal year-end gifts for clients.",
    sizes: [{ id: "a4wall", label: "A4 wall, wire bound", mult: 1 }, { id: "a3wall", label: "A3 wall, wire bound", mult: 1.6 }, { id: "desk", label: "Desk easel", mult: 1.2 }],
    papers: [{ id: "170silk", label: "170gsm Silk", mult: 1 }],
    sides: [{ id: "13", label: "13 pages", add: 0 }],
    tiers: [[25, 149], [50, 239], [100, 399], [250, 849]]
  },
  {
    id: "pvc-banners", name: "PVC Banners", cat: "large", real: false,
    icon: "banner", desc: "Outdoor PVC banners with hems and eyelets.",
    perUnit: true, minQty: 1,
    sizes: [
      { id: "6x2", label: "6ft × 2ft", unit: 29 },
      { id: "8x3", label: "8ft × 3ft", unit: 45 },
      { id: "10x3", label: "10ft × 3ft", unit: 55 },
      { id: "12x4", label: "12ft × 4ft", unit: 79 }
    ],
    papers: [{ id: "440pvc", label: "440gsm PVC, hemmed & eyeletted", mult: 1 }],
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    qtyChoices: [1, 2, 3, 5, 10]
  },
  {
    id: "roller-banners", name: "Roller Banners", cat: "large", real: false,
    icon: "roller", desc: "Pull-up banner with stand and carry case.",
    perUnit: true, minQty: 1,
    sizes: [{ id: "850", label: "850 × 2000mm Economy", unit: 59 }, { id: "850p", label: "850 × 2000mm Premium", unit: 89 }, { id: "1000", label: "1000 × 2000mm Premium", unit: 109 }],
    papers: [{ id: "pp", label: "Anti-curl PP film", mult: 1 }],
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    qtyChoices: [1, 2, 3, 5, 10]
  },
  {
    id: "exhibition-stands", name: "Exhibition Stands", cat: "large", real: false,
    icon: "stand", desc: "Pop-up stands and backdrops for shows and events.",
    perUnit: true, minQty: 1,
    sizes: [{ id: "3x3", label: "3×3 curved pop-up", unit: 449 }, { id: "3x4", label: "3×4 curved pop-up", unit: 549 }, { id: "fabric", label: "Fabric backdrop 3m", unit: 399 }],
    papers: [{ id: "std", label: "Graphics + frame + case", mult: 1 }],
    sides: [{ id: "1", label: "Single sided", add: 0 }],
    qtyChoices: [1, 2, 3]
  }
];

KP.turnaround = [
  { id: "standard", label: "Standard", detail: "3–5 working days", pct: 0 },
  { id: "express", label: "Express", detail: "Next working day", pct: 0.25 },
  { id: "24h", label: "24-hour rush", detail: "Ready within 24 hours", pct: 0.45 }
];

KP.delivery = [
  { id: "collect", label: "Collect from shop", detail: "Padgate Lane, Warrington", price: 0 },
  { id: "uk", label: "Free UK delivery", detail: "2–3 days after printing", price: 0 },
  { id: "local", label: "Same-day local courier", detail: "Within 10 miles of WA1", price: 9.95, sample: true },
  { id: "nextday", label: "Next-day tracked (UK)", detail: "Order by 2pm", price: 12.5, sample: true }
];

KP.artwork = [
  { id: "upload", label: "I'll upload print-ready artwork", price: 0 },
  { id: "free", label: "Free artwork help (we tidy up your design)", price: 0 },
  { id: "design", label: "Full design from scratch by our designer", price: 35, sample: true }
];

// Bundles: priced lower than buying items separately.
KP.bundles = [
  {
    id: "starter", name: "New Business Starter Pack", price: 149, sample: true,
    items: ["500 Business Cards", "500 Letterheads", "250 Compliment Slips", "5,000 A6 Leaflets", "Free logo tidy-up"],
    was: 39 + 65 + 35 + 69 + 25, tag: "Most popular"
  },
  {
    id: "takeaway", name: "Takeaway Launch Pack", price: 399, sample: true,
    items: ["10,000 A4 folded menus", "1,000 Business / loyalty cards", "250 Window stickers", "Free menu design"],
    was: 349 + 49 + 39 + 35, tag: "For restaurants"
  },
  {
    id: "event", name: "Event & Exhibition Pack", price: 229, sample: true,
    items: ["1 Premium roller banner", "2,500 A5 flyers", "500 Business cards", "Delivered to your venue"],
    was: 89 + 83 + 39 + 30, tag: "For shows"
  }
];

KP.industries = [
  { name: "Takeaways & Restaurants", items: "Menus, loyalty cards, door-drop leaflets, window stickers" },
  { name: "Trades & Builders", items: "Business cards, van stickers, site banners, invoice pads" },
  { name: "Estate Agents", items: "For-sale brochures, door-drop leaflets, valuation packs" },
  { name: "Schools & Churches", items: "Newsletters, programmes, bookmarks, event posters" },
  { name: "Salons & Beauty", items: "Price lists, appointment cards, gift vouchers" },
  { name: "Events & Weddings", items: "Invitations, order of service, banners, signage" }
];

KP.areas = ["Warrington", "Padgate", "Birchwood", "Woolston", "Great Sankey", "Stockton Heath", "Lymm", "Widnes", "Runcorn", "St Helens", "Leigh", "Newton-le-Willows", "Wigan", "Manchester", "Liverpool", "Cheshire"];

KP.reviews = [
  { name: "Raj, Spice Garden takeaway", stars: 5, text: "10,000 menus folded and delivered in two days, at a price nobody else in Warrington came close to." },
  { name: "Claire, CB Hair Studio", stars: 5, text: "They sorted my logo for free and the business cards came out great. I've already reordered twice." },
  { name: "Mark, MJ Plumbing & Heating", stars: 5, text: "Quick, friendly and cheap. I ordered the van stickers and business cards together." },
  { name: "St Oswald's PTA", stars: 4, text: "We needed posters for the summer fair at short notice. They printed them the same day." }
];

KP.faqs = [
  ["What file types can I upload?", "PDF is best. We also accept JPG, PNG, AI, PSD and Word or Publisher files. If your file isn't print-ready, our free artwork check fixes common problems like bleed and low resolution."],
  ["Do I get a proof before printing?", "Yes. Every order gets a free digital proof by email or WhatsApp, and nothing is printed until you approve it."],
  ["How fast can you print?", "Most jobs take 3–5 working days. Express (next day) and 24-hour rush printing are available on most products."],
  ["Do you deliver?", "UK delivery is free. You can also collect from our shop on Padgate Lane, Warrington, or choose a same-day local courier."],
  ["Can you design my artwork?", "Yes. Small tweaks are free, and a full design from scratch is available as an add-on."],
  ["Do you offer trade or account prices?", "Yes. Regular business customers can open an account with monthly invoicing and one-click reorders."]
];
