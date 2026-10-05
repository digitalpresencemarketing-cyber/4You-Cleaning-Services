/* =========================================================
   4You Cleaning Services LLC - site scripts
   ========================================================= */

/* ---------------------------------------------------------
   CONFIG - edit prices and lead destinations here
   --------------------------------------------------------- */
const CONFIG = {
  // Every lead is emailed here (FormSubmit). The first submission sends an
  // activation email to this inbox - click "Activate" once and you're live.
  leadEmail: "contact@4YouCleaning.com",

  // Optional: also send each lead as JSON to a webhook (Google Sheets Apps Script,
  // Zapier, Make, Supabase edge function...). Leave empty to disable.
  leadWebhook: "",

  pricing: {
    // Residential base: base + per bedroom + per bathroom + per sq ft
    base: 60,
    perBedroom: 18,
    perBathroom: 28,
    perSqft: 0.04,
    minimum: 120,
    // Multiplier per service type
    service: { regular: 1, deep: 1.65, move: 1.85, construction: 2.3, airbnb: 0.85 },
    // Commercial: priced mostly by size
    commercial: { perSqft: 0.11, perRoom: 10, perRestroom: 20, minimum: 160 },
    condition: { light: 0.92, average: 1, heavy: 1.25 },
    pets: 20,
    extras: { oven: 40, fridge: 40, cabinets: 50, windows: 50, laundry: 30, walls: 40 },
    frequency: { once: 0, weekly: 0.15, biweekly: 0.10, monthly: 0.05 },
    // Range shown to the customer around the calculated price
    rangeLow: 0.9,
    rangeHigh: 1.12
  }
};

const TOWNS = {
  south: {
    Quincy: [42.2529, -71.0023], Braintree: [42.2079, -71.0040], Weymouth: [42.2207, -70.9395],
    Hingham: [42.2418, -70.8898], Hull: [42.3020, -70.9078], Cohasset: [42.2418, -70.8037],
    Scituate: [42.1959, -70.7259], Norwell: [42.1615, -70.7937], Rockland: [42.1307, -70.9162],
    Abington: [42.1048, -70.9453], Hanover: [42.1132, -70.8120], Whitman: [42.0807, -70.9356],
    Hanson: [42.0751, -70.8798], Pembroke: [42.0715, -70.8092], Marshfield: [42.0918, -70.7056],
    Duxbury: [42.0418, -70.6723], Kingston: [41.9946, -70.7245], Plymouth: [41.9584, -70.6673]
  },
  cape: {
    Bourne: [41.7412, -70.5989], Sandwich: [41.7590, -70.4939], Falmouth: [41.5515, -70.6148],
    Mashpee: [41.6484, -70.4811], Barnstable: [41.7003, -70.3002], Hyannis: [41.6529, -70.2885],
    Yarmouth: [41.7057, -70.2286], Dennis: [41.7354, -70.1939], Harwich: [41.6862, -70.0758],
    Brewster: [41.7601, -70.0828], Chatham: [41.6821, -69.9597], Orleans: [41.7898, -69.9897],
    Eastham: [41.8301, -69.9739], Wellfleet: [41.9371, -70.0312], Truro: [41.9935, -70.0497],
    Provincetown: [42.0584, -70.1786]
  }
};

const SERVICE_NAMES = {
  regular: "Regular Cleaning", deep: "Deep Cleaning", move: "Move In / Move Out",
  construction: "Post Construction", commercial: "Commercial / Office", airbnb: "Airbnb & Vacation Rental"
};
const FREQ_NAMES = { once: "One-time", weekly: "Weekly", biweekly: "Every 2 weeks", monthly: "Monthly" };
const EXTRA_NAMES = { oven: "Inside oven", fridge: "Inside fridge", cabinets: "Inside cabinets", windows: "Interior windows", laundry: "Laundry & folding", walls: "Wall spot cleaning" };

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Loader & entrance ---------- */
(() => {
  $$("[data-hero]").forEach((el, i) => el.style.setProperty("--i", i));
  const ready = () => document.body.classList.add("is-ready");
  const skip = document.documentElement.classList.contains("no-loader");
  if (skip) { document.body.classList.add("is-loaded"); requestAnimationFrame(ready); return; }
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    document.body.classList.add("is-loaded");
    document.body.classList.remove("is-loading");
    setTimeout(ready, 350);
    try { sessionStorage.setItem("4y-intro", "1"); } catch (e) {}
  };
  const minTime = reduceMotion ? 0 : 1500;
  const start = performance.now();
  const onLoad = () => setTimeout(finish, Math.max(0, minTime - (performance.now() - start)));
  if (document.readyState === "complete") onLoad(); else window.addEventListener("load", onLoad);
  setTimeout(finish, 3200); // safety net
})();

/* ---------- Year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Header, mobile bar, current nav ---------- */
(() => {
  const header = $(".header");
  const bar = $(".mobile-bar");
  const hero = $(".hero");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    bar.classList.toggle("is-visible", y > hero.offsetHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = $$(".nav > a[href^='#']");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const t = $(a.getAttribute("href")); if (t) io.observe(t); });
})();

/* ---------- Mobile menu ---------- */
(() => {
  const burger = $("#burger");
  const toggle = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => toggle(!document.body.classList.contains("menu-open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
})();

/* ---------- Reveal on scroll + counters ---------- */
(() => {
  const countUp = (el) => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  $$("[data-reveal], .steps").forEach((el) => io.observe(el));
})();

/* ---------- Hero sparkles ---------- */
(() => {
  const canvas = $("#sparkles");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, stars = [], running = true, raf;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, (w * h) / 16000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.2 + 0.6,
      vy: -(Math.random() * 0.18 + 0.04), vx: (Math.random() - 0.5) * 0.08,
      phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.02 + 0.008,
      big: Math.random() < 0.12, hue: Math.random() < 0.6 ? "255,255,255" : "169,156,255"
    }));
  };
  const drawStar = (x, y, r) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r * 3);
    ctx.quadraticCurveTo(x, y, x + r * 3, y);
    ctx.quadraticCurveTo(x, y, x, y + r * 3);
    ctx.quadraticCurveTo(x, y, x - r * 3, y);
    ctx.quadraticCurveTo(x, y, x, y - r * 3);
    ctx.fill();
  };
  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.phase += s.speed; s.x += s.vx; s.y += s.vy;
      if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; }
      const a = (Math.sin(s.phase) + 1) / 2;
      ctx.fillStyle = `rgba(${s.hue},${0.15 + a * 0.75})`;
      if (s.big) drawStar(s.x, s.y, s.r * (0.6 + a * 0.6));
      else { ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.6, 0, Math.PI * 2); ctx.fill(); }
    }
    if (running) raf = requestAnimationFrame(frame);
  };
  resize(); frame();
  window.addEventListener("resize", resize);
  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) { cancelAnimationFrame(raf); frame(); }
  }).observe(canvas);
})();

/* ---------- Magnetic buttons & spotlight cards ---------- */
if (finePointer && !reduceMotion) {
  $$(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.18) + "px");
      btn.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.28) + "px");
    });
    btn.addEventListener("pointerleave", () => { btn.style.setProperty("--bx", "0px"); btn.style.setProperty("--by", "0px"); });
  });
  $$(".spot").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
}

/* ---------- Standard tabs ---------- */
(() => {
  const tabs = $$(".tab");
  const ink = $(".tabs__ink");
  const moveInk = (t) => { ink.style.width = t.offsetWidth + "px"; ink.style.transform = `translateX(${t.offsetLeft}px)`; ink.style.top = t.offsetTop + "px"; ink.style.height = t.offsetHeight + "px"; };
  const select = (t) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.classList.toggle("is-active", on);
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      const p = $("#" + x.getAttribute("aria-controls"));
      p.hidden = !on; p.classList.toggle("is-active", on);
    });
    moveInk(t);
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      n.focus(); select(n);
    });
  });
  const init = () => moveInk($(".tab.is-active"));
  window.addEventListener("resize", init);
  document.fonts ? document.fonts.ready.then(init) : init();
  init();
})();

/* ---------- Lead source tracking (UTM) ---------- */
const TRACKING = (() => {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  let data = {};
  try { data = JSON.parse(sessionStorage.getItem("4y-utm") || "{}"); } catch (e) {}
  const params = new URLSearchParams(location.search);
  keys.forEach((k) => { if (params.get(k)) data[k] = params.get(k); });
  if (!data.landing_page) data.landing_page = location.href;
  if (!data.referrer) data.referrer = document.referrer || "direct";
  try { sessionStorage.setItem("4y-utm", JSON.stringify(data)); } catch (e) {}
  return data;
})();

/* ---------- Instant estimate wizard ---------- */
const Wizard = (() => {
  const form = $("#estimate-form");
  const card = $(".wizard__card");
  const steps = $$(".step", form);
  const labels = $$(".wizard__steps span");
  const bar = $(".wizard__bar span");
  const prevBtn = $("[data-prev]", form);
  const nextBtn = $("[data-next]", form);
  const submitBtn = $("[data-submit]", form);
  const errorEl = $(".form__error", form);
  const result = $(".result", card);
  let current = 1;

  // Min date = today
  const dateInput = form.elements.date;
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  // Counters
  $$("[data-inc],[data-dec]", form).forEach((b) => {
    b.addEventListener("click", () => {
      const name = b.dataset.inc || b.dataset.dec;
      const input = form.elements[name];
      const step = +input.step || 1;
      let v = +input.value + (b.dataset.inc ? step : -step);
      v = Math.min(+input.max, Math.max(+input.min, v));
      input.value = v;
      input.classList.remove("bump"); void input.offsetWidth; input.classList.add("bump");
    });
  });

  const val = (name) => {
    const el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value;
    return el.type === "checkbox" ? (el.checked ? el.value : "") : el.value.trim();
  };
  const extras = () => $$("input[name=extras]:checked", form).map((i) => i.value);

  const applyServiceUI = () => {
    const s = val("service");
    const commercial = s === "commercial";
    $("[data-label-bed]", form).textContent = commercial ? "Offices / rooms" : "Bedrooms";
    $("[data-label-bath]", form).textContent = commercial ? "Restrooms" : "Bathrooms";
    const oneTimeOnly = s === "move" || s === "construction";
    const freqField = $(".chips--freq", form).closest(".field");
    freqField.hidden = oneTimeOnly;
    if (oneTimeOnly) form.querySelector("input[name=frequency][value=once]").checked = true;
  };
  $$("input[name=service]", form).forEach((r) => r.addEventListener("change", applyServiceUI));

  const show = (n, back = false) => {
    current = n;
    steps.forEach((s) => {
      const on = +s.dataset.step === n;
      s.hidden = !on;
      s.classList.toggle("is-active", on);
      s.classList.toggle("is-back", on && back);
    });
    labels.forEach((l, i) => { l.classList.toggle("is-active", i === n - 1); l.classList.toggle("is-done", i < n - 1); });
    bar.style.width = (n / steps.length) * 100 + "%";
    prevBtn.hidden = n === 1;
    nextBtn.hidden = n === steps.length;
    submitBtn.hidden = n !== steps.length;
    errorEl.hidden = true;
  };

  const validateContact = () => {
    const checks = [
      ["name", (v) => v.length >= 2, "Please enter your name."],
      ["phone", (v) => v.replace(/\D/g, "").length >= 10, "Please enter a valid phone number."],
      ["email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Please enter a valid email."],
      ["town", (v) => v.length >= 2, "Please tell us your town."]
    ];
    for (const [name, ok, msg] of checks) {
      const el = form.elements[name];
      const good = ok(el.value.trim());
      el.classList.toggle("is-invalid", !good);
      if (!good) { errorEl.textContent = msg; errorEl.hidden = false; el.focus(); return false; }
    }
    return true;
  };
  $$("input", form).forEach((i) => i.addEventListener("input", () => i.classList.remove("is-invalid")));

  nextBtn.addEventListener("click", () => { if (current < steps.length) show(current + 1); scrollIntoCard(); });
  prevBtn.addEventListener("click", () => { if (current > 1) show(current - 1, true); scrollIntoCard(); });

  const scrollIntoCard = () => {
    const r = card.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + r.top - 100, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const round5 = (n) => Math.round(n / 5) * 5;
  const calculate = () => {
    const P = CONFIG.pricing;
    const s = val("service");
    const beds = +val("bedrooms"), baths = +val("bathrooms"), sqft = +val("sqft");
    let price;
    if (s === "commercial") {
      const C = P.commercial;
      price = Math.max(C.minimum, sqft * C.perSqft + beds * C.perRoom + baths * C.perRestroom);
    } else {
      price = (P.base + beds * P.perBedroom + baths * P.perBathroom + sqft * P.perSqft) * (P.service[s] || 1);
    }
    price *= P.condition[val("condition")] || 1;
    if (val("pets")) price += P.pets;
    extras().forEach((x) => { price += P.extras[x] || 0; });
    price *= 1 - (P.frequency[val("frequency")] || 0);
    price = Math.max(price, s === "commercial" ? P.commercial.minimum : P.minimum);
    return { low: round5(price * P.rangeLow), high: round5(price * P.rangeHigh) };
  };

  const animateNumber = (el, to) => {
    if (reduceMotion) { el.textContent = "$" + to; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = "$" + Math.round(to * e).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const sendLead = async (payload) => {
    const jobs = [];
    if (CONFIG.leadEmail) {
      jobs.push(fetch("https://formsubmit.co/ajax/" + encodeURIComponent(CONFIG.leadEmail), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New estimate: ${payload.service} - ${payload.name} (${payload.town})`,
          _template: "table",
          _captcha: "false",
          ...payload
        })
      }));
    }
    if (CONFIG.leadWebhook) {
      jobs.push(fetch(CONFIG.leadWebhook, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }));
    }
    const results = await Promise.allSettled(jobs);
    return results.some((r) => r.status === "fulfilled");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (current !== steps.length) { show(current + 1); return; }
    if (form.elements._honey.value) return;
    if (!validateContact()) return;

    const s = val("service");
    const { low, high } = calculate();
    const freq = val("frequency");
    const payload = {
      name: val("name"), phone: val("phone"), email: val("email"),
      town: val("town"), zip: val("zip"),
      service: SERVICE_NAMES[s],
      [s === "commercial" ? "offices_rooms" : "bedrooms"]: val("bedrooms"),
      [s === "commercial" ? "restrooms" : "bathrooms"]: val("bathrooms"),
      size_sqft: form.elements.sqft.selectedOptions[0].textContent,
      condition: val("condition"),
      pets: val("pets") ? "Yes" : "No",
      frequency: FREQ_NAMES[freq],
      extras: extras().map((x) => EXTRA_NAMES[x]).join(", ") || "None",
      preferred_date: val("date") || "Flexible",
      preferred_time: val("time"),
      how_found_us: val("source") || "-",
      notes: val("notes") || "-",
      marketing_opt_in: val("marketing") ? "Yes" : "No",
      estimate_range: `$${low} - $${high}`,
      estimate_low: low, estimate_high: high,
      submitted_at: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      ...TRACKING
    };

    submitBtn.classList.add("is-loading"); submitBtn.disabled = true;
    try { await Promise.race([sendLead(payload), new Promise((r) => setTimeout(r, 6000))]); } catch (err) {}
    submitBtn.classList.remove("is-loading"); submitBtn.disabled = false;

    // Show result
    const per = { once: "for a one-time visit", weekly: "per weekly visit", biweekly: "per bi-weekly visit", monthly: "per monthly visit" }[freq];
    $("[data-per]", result).textContent = per;
    const summary = [
      SERVICE_NAMES[s],
      s === "commercial" ? `${val("bedrooms")} rooms · ${val("bathrooms")} restrooms` : `${val("bedrooms")} bd · ${val("bathrooms")} ba`,
      form.elements.sqft.selectedOptions[0].textContent,
      FREQ_NAMES[freq]
    ].concat(extras().map((x) => EXTRA_NAMES[x]));
    $("[data-summary]", result).innerHTML = "";
    summary.forEach((t) => { const li = document.createElement("li"); li.textContent = t; $("[data-summary]", result).appendChild(li); });

    form.hidden = true;
    $(".wizard__progress", card).hidden = true;
    result.hidden = false;
    animateNumber($("[data-low]", result), low);
    animateNumber($("[data-high]", result), high);
    scrollIntoCard();
    if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { value: low, currency: "USD" });
    if (typeof window.fbq === "function") window.fbq("track", "Lead", { value: low, currency: "USD" });
  });

  $("[data-restart]", result).addEventListener("click", () => {
    form.reset();
    result.hidden = true;
    form.hidden = false;
    $(".wizard__progress", card).hidden = false;
    applyServiceUI();
    show(1);
  });

  const preset = (service, bedrooms) => {
    if (service) { const r = form.querySelector(`input[name=service][value="${service}"]`); if (r) r.checked = true; }
    if (bedrooms) form.elements.bedrooms.value = bedrooms;
    applyServiceUI();
    if (!result.hidden) $("[data-restart]", result).click();
  };

  show(1);
  return { preset, show };
})();

/* ---------- Quick bar & service links feed the wizard ---------- */
(() => {
  const go = () => {
    const target = $("#quote");
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: reduceMotion ? "auto" : "smooth" });
  };
  $("#quick").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    Wizard.preset(f.elements.service.value, f.elements.bedrooms.value);
    Wizard.show(2);
    go();
  });
  $$("[data-service]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    Wizard.preset(a.dataset.service);
    Wizard.show(2);
    go();
  }));
})();

/* ---------- Service area map ---------- */
(() => {
  const all = {};
  Object.entries(TOWNS).forEach(([region, towns]) => Object.entries(towns).forEach(([name, ll]) => { all[name] = { ll, region }; }));

  const list = $("#town-list");
  Object.keys(all).sort().forEach((n) => { const o = document.createElement("option"); o.value = n; list.appendChild(o); });

  const mapEl = $("#map");
  let map = null;
  const markers = {};

  const buttons = $$(".towns button");
  const setActive = (name) => {
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.town === name));
    Object.entries(markers).forEach(([n, m]) => {
      const el = m.getElement();
      if (el) el.querySelector(".pin").classList.toggle("is-active", n === name);
    });
  };
  const focusTown = (name) => {
    setActive(name);
    if (!map) return;
    map.flyTo(all[name].ll, 12, { duration: reduceMotion ? 0 : 1.2 });
    markers[name].openTooltip();
  };

  const initMap = () => {
    if (map || typeof L === "undefined") return;
    map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 18, subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    Object.entries(all).forEach(([name, { ll, region }]) => {
      L.circle(ll, { radius: 5200, stroke: false, fillColor: region === "cape" ? "#0d0b26" : "#3a28e1", fillOpacity: 0.08, interactive: false }).addTo(map);
      const icon = L.divIcon({ className: "", html: `<div class="pin pin--${region}"><span class="pin__pulse"></span><span class="pin__dot"></span></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
      const m = L.marker(ll, { icon, title: name, keyboard: false }).addTo(map);
      m.bindTooltip(name, { className: "town-tip", direction: "top", offset: [0, -10] });
      m.on("click", () => focusTown(name));
      markers[name] = m;
    });
    map.fitBounds(L.latLngBounds(Object.values(all).map((t) => t.ll)), { padding: [30, 30] });
    map.on("click", () => map.scrollWheelZoom.enable());
    mapEl.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
  };

  // Lazy-init when map gets near the viewport
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    const tryInit = (n = 0) => {
      if (typeof L !== "undefined") initMap();
      else if (n < 40) setTimeout(() => tryInit(n + 1), 150);
      else mapEl.innerHTML = '<div class="map__fallback">Map unavailable right now. We serve the South Shore &amp; Cape Cod, MA.</div>';
    };
    tryInit();
  }, { rootMargin: "300px" }).observe(mapEl);

  buttons.forEach((b) => b.addEventListener("click", () => focusTown(b.dataset.town)));

  // Region filter
  $$(".region-tabs button").forEach((btn) => btn.addEventListener("click", () => {
    const r = btn.dataset.region;
    $$(".region-tabs button").forEach((x) => x.classList.toggle("is-active", x === btn));
    $$(".town-group").forEach((g) => { g.hidden = r !== "all" && g.dataset.group !== r; });
    if (map) {
      const pts = Object.values(all).filter((t) => r === "all" || t.region === r).map((t) => t.ll);
      map.flyToBounds(L.latLngBounds(pts), { padding: [30, 30], duration: reduceMotion ? 0 : 1.1 });
    }
    setActive(null);
  }));

  // Town checker
  const out = $(".town-check__result");
  $("#town-check").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = e.currentTarget.elements.town.value.trim().toLowerCase().replace(/,?\s*ma$/, "");
    if (!q) return;
    const match = Object.keys(all).find((n) => n.toLowerCase() === q) || Object.keys(all).find((n) => n.toLowerCase().startsWith(q));
    if (match) {
      out.className = "town-check__result is-yes";
      out.textContent = `Yes! We clean in ${match}. `;
      const a = document.createElement("a"); a.href = "#quote"; a.textContent = "Get your instant estimate";
      a.addEventListener("click", (ev) => { ev.preventDefault(); $("#estimate-form").elements.town.value = match; $("#quote").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); });
      out.appendChild(a);
      focusTown(match);
    } else {
      out.className = "town-check__result is-no";
      out.innerHTML = 'We may still cover you! <a href="tel:+17747441308">Call (774) 744-1308</a> to confirm.';
    }
  });
})();
