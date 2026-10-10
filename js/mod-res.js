
"use strict";

(function () {
  const COLORS = [
    { name: "Black",  mr: "काळा",   hi: "काला",    hex: "#202124", digit: 0, mult: 1, ppm: 250 },
    { name: "Brown",  mr: "तपकिरी", hi: "भूरा",    hex: "#795548", digit: 1, mult: 10, ppm: 100 },
    { name: "Red",    mr: "लाल",    hi: "लाल",     hex: "#E53935", digit: 2, mult: 100, ppm: 50 },
    { name: "Orange", mr: "नारंगी", hi: "नारंगी",  hex: "#FB8C00", digit: 3, mult: 1000, ppm: 15 },
    { name: "Yellow", mr: "पिवळा",  hi: "पीला",    hex: "#FDD835", digit: 4, mult: 10000, ppm: 25 },
    { name: "Green",  mr: "हिरवा",  hi: "हरा",     hex: "#43A047", digit: 5, mult: 100000, ppm: 20 },
    { name: "Blue",   mr: "निळा",   hi: "नीला",    hex: "#1E88E5", digit: 6, mult: 1e6, ppm: 10 },
    { name: "Violet", mr: "जांभळा", hi: "बैंगनी",  hex: "#8E24AA", digit: 7, mult: 1e7, ppm: 5 },
    { name: "Grey",   mr: "राखाडी", hi: "धूसर",    hex: "#9E9E9E", digit: 8, mult: 1e8, ppm: 1 },
    { name: "White",  mr: "पांढरा", hi: "सफेद",    hex: "#F5F5F5", digit: 9, mult: 1e9, ppm: null },
    { name: "Gold",   mr: "सोनेरी", hi: "सुनहरा",  hex: "#D4AF37", digit: null, mult: 0.1, tol: 5 },
    { name: "Silver", mr: "चंदेरी", hi: "चाँदी",   hex: "#B0BEC5", digit: null, mult: 0.01, tol: 10 },
    { name: "None",   mr: "नसलेला", hi: "नहीं",    hex: "#FFFFFF", digit: null, mult: null, tol: 20 }
  ];

  const BAND_COUNTS = [4, 5, 6];
  const KEY = "em_res";

  const DEFAULTS = {
    bands: 4,
    colors: ["Brown", "Black", "Green", "Gold", "Brown", "Brown"]
  };

  let S = store.get(KEY, null);

  if (!S || !BAND_COUNTS.includes(S.bands) || !Array.isArray(S.colors)) {
    S = { bands: DEFAULTS.bands, colors: [...DEFAULTS.colors] };
  }

  function color(name) {
    return COLORS.find(c => c.name === name) || COLORS[0];
  }

  function text(mr, hi, en) {
    return App.lang === "mr" ? mr : App.lang === "hi" ? hi : en;
  }

  function label(c) {
    return App.lang === "mr" ? c.mr : App.lang === "hi" ? c.hi : c.name;
  }

  function bandRole(i) {
    if (i < S.bands - 2) return "digit";
    if (i === S.bands - 2) return "mult";
    if (i === S.bands - 1) return "tol";
    return "ppm";
  }

  function tolerance(c) {
    if (c.tol !== undefined) return c.tol;

    const values = {
      Brown: 1,
      Red: 2,
      Green: 0.5,
      Blue: 0.25,
      Violet: 0.1,
      Grey: 0.05
    };

    return values[c.name] ?? null;
  }

  function allowed(i) {
    const role = bandRole(i);

    if (role === "digit") {
      return COLORS.filter(c => c.digit !== null && c.digit !== undefined);
    }

    if (role === "mult") {
      return COLORS.filter(c => c.mult !== null && c.mult !== undefined);
    }

    if (role === "tol") {
      return COLORS.filter(c => tolerance(c) !== null);
    }

    return COLORS.filter(c => c.ppm !== null && c.ppm !== undefined);
  }

  function fixColors() {
    if (!Array.isArray(S.colors)) S.colors = [];

    while (S.colors.length < 6) S.colors.push("Brown");
    S.colors = S.colors.slice(0, 6);

    for (let i = 0; i < S.bands; i++) {
      if (!allowed(i).some(c => c.name === S.colors[i])) {
        S.colors[i] = i === S.bands - 2
          ? "Red"
          : i === S.bands - 1
            ? "Gold"
            : "Brown";
      }
    }
  }

  function calculate() {
    const digitBands = S.bands - 2;
    const digits = S.colors
      .slice(0, digitBands)
      .map(name => color(name).digit);

    if (digits.some(v => v === null || v === undefined)) return null;

    const significant = Number(digits.join(""));
    const multiplier = color(S.colors[digitBands]).mult;
    const tol = tolerance(color(S.colors[S.bands - 1]));

    if (multiplier === null || !Number.isFinite(multiplier)) return null;

    return {
      ohms: significant * multiplier,
      tol,
      ppm: S.bands === 6 ? color(S.colors[5]).ppm : null
    };
  }

  function formatResistance(n) {
    if (!Number.isFinite(n)) return "—";

    if (Math.abs(n) >= 1e6) {
      return `${Number((n / 1e6).toPrecision(4))} MΩ`;
    }

    if (Math.abs(n) >= 1e3) {
      return `${Number((n / 1e3).toPrecision(4))} kΩ`;
    }

    return `${Number(n.toPrecision(4))} Ω`;
  }

  function saveState() {
    store.set(KEY, S);
  }

  function setBandCount(n) {
    if (!BAND_COUNTS.includes(n)) return;
    S.bands = n;
    fixColors();
    saveState();
  }

  function colorOptions(i) {
    return allowed(i).map(c =>
      `<option value="${c.name}" ${S.colors[i] === c.name ? "selected" : ""}>${label(c)}</option>`
    ).join("");
  }

  function renderBands() {
    return Array.from({ length: S.bands }, (_, i) => {
      const c = color(S.colors[i]);

      return `
        <div class="f">
          <label for="res${i}">${text("बँड", "बैंड", "Band")} ${i + 1}</label>

          <div style="display:flex;align-items:center;gap:8px">
            <span aria-hidden="true"
              style="display:inline-block;width:28px;height:36px;border-radius:7px;
              background:${c.hex};border:1px solid #aaa;flex-shrink:0"></span>

            <select id="res${i}" data-resband="${i}"
              style="flex:1;min-width:0;font:inherit;border:0;background:#E8ECF4;
              border-radius:10px;min-height:44px;padding:0 10px">
              ${colorOptions(i)}
            </select>
          </div>
        </div>`;
    }).join("");
  }

  function draw3DResistor() {
    const n = S.bands;

    const xPositions = n === 4
      ? [111, 137, 163, 189]
      : n === 5
        ? [101, 123, 145, 167, 189]
        : [95, 115, 135, 155, 175, 195];

    const bands = xPositions.map((x, i) => {
      const c = color(S.colors[i]);

      return `
        <g>
          <rect x="${x}" y="29" width="11" height="53" rx="2"
            fill="${c.hex}" stroke="#00000030" stroke-width="1"/>
          <rect x="${x + 2}" y="31" width="2" height="49" rx="1"
            fill="#FFFFFF55"/>
          <rect x="${x + 8}" y="31" width="1.5" height="49" rx="1"
            fill="#00000025"/>
        </g>`;
    }).join("");

    return `
      <div style="width:100%;padding:4px 0 10px;overflow:hidden">
        <svg viewBox="0 0 300 112"
          role="img"
          aria-label="3D resistor with selected colour bands"
          style="display:block;width:100%;max-width:360px;height:auto;margin:auto">

          <defs>
            <linearGradient id="resBodyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F9E4BE"/>
              <stop offset="22%" stop-color="#E9C38B"/>
              <stop offset="52%" stop-color="#D4A064"/>
              <stop offset="80%" stop-color="#B67B43"/>
              <stop offset="100%" stop-color="#8B562D"/>
            </linearGradient>

            <linearGradient id="resBodyShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#FFFFFF00"/>
              <stop offset="28%" stop-color="#FFFFFFA0"/>
              <stop offset="58%" stop-color="#FFFFFF25"/>
              <stop offset="100%" stop-color="#FFFFFF00"/>
            </linearGradient>

            <linearGradient id="resMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F8FAFC"/>
              <stop offset="35%" stop-color="#9BA3AD"/>
              <stop offset="58%" stop-color="#E8ECF1"/>
              <stop offset="100%" stop-color="#747D88"/>
            </linearGradient>

            <filter id="resShadow" x="-30%" y="-60%" width="160%" height="240%">
              <feGaussianBlur stdDeviation="3"/>
            </filter>

            <clipPath id="resBodyClip">
              <rect x="76" y="27" width="148" height="57" rx="20"/>
            </clipPath>
          </defs>

          <ellipse cx="150" cy="92" rx="88" ry="6"
            fill="#1B2C45" opacity=".18" filter="url(#resShadow)"/>

          <path d="M8 55 L84 55"
            stroke="#7D858F" stroke-width="6" stroke-linecap="round"/>
          <path d="M8 53 L84 53"
            stroke="url(#resMetal)" stroke-width="3.5" stroke-linecap="round"/>

          <path d="M216 55 L292 55"
            stroke="#7D858F" stroke-width="6" stroke-linecap="round"/>
          <path d="M216 53 L292 53"
            stroke="url(#resMetal)" stroke-width="3.5" stroke-linecap="round"/>

          <rect x="76" y="27" width="148" height="57" rx="20"
            fill="url(#resBodyGradient)" stroke="#A77745" stroke-width="1.3"/>

          <g clip-path="url(#resBodyClip)">
            ${bands}

            <rect x="76" y="27" width="148" height="57"
              fill="url(#resBodyShine)"/>

            <path d="M82 36 Q150 23 218 36"
              fill="none" stroke="#FFFFFF70" stroke-width="2"/>

            <path d="M82 77 Q150 89 218 77"
              fill="none" stroke="#77452255" stroke-width="2"/>
          </g>
        </svg>
      </div>`;
  }

  registerModule({
    id: "res",
    titleKey: "res",
    subKey: "resS",

    render() {
      fixColors();

      return `
        ${topBar(t("res"))}

        <div class="chips">
          ${BAND_COUNTS.map(n =>
            chip(
              "data-resbands",
              String(n),
              `${n} ${text("Band", "बैंड", "Band")}`,
              S.bands === n
            )
          ).join("")}
        </div>

        <div id="resout"></div>

        <div class="fields" style="grid-template-columns:1fr;gap:10px">
          ${renderBands()}
        </div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>

        <div class="note">
          ${text(
            "रंग निवडा; रेझिस्टन्स आणि टॉलरन्स खाली दिसेल.",
            "रंग चुनें; प्रतिरोध और टॉलरेंस नीचे दिखेगा।",
            "Choose the bands to calculate resistance and tolerance."
          )}
        </div>`;
    },

    update() {
      const out = $("#resout");
      if (!out) return;

      fixColors();
      const result = calculate();

      if (!result || !Number.isFinite(result.ohms)) {
        App.last = null;
        out.innerHTML = `
          <div class="res bad">
            <div class="d">${text("रंग तपासा", "रंग जाँचें", "Check the colours")}</div>
          </div>`;
        return;
      }

      const tolText = result.tol === null
        ? text("उपलब्ध नाही", "उपलब्ध नहीं", "Unavailable")
        : `±${result.tol}%`;

      const ppmText = result.ppm === null
        ? ""
        : `<div class="d">
            ${text("तापमान गुणांक", "तापमान गुणांक", "Temperature coefficient")}:
            ${result.ppm} ppm/°C
          </div>`;

      const title = text(
        "रेझिस्टर कलर कोड",
        "रेज़िस्टर कलर कोड",
        "Resistor colour code"
      );

      const resultText =
        `${formatResistance(result.ohms)} · ${tolText}` +
        (result.ppm === null ? "" : ` · ${result.ppm} ppm/°C`);

      App.last = { title, result: resultText };

      out.innerHTML = `
        <div class="res">
          ${draw3DResistor()}
          <div class="l">${text("रेझिस्टन्स", "प्रतिरोध", "Resistance")}</div>
          <div class="n">${formatResistance(result.ohms)}</div>
          <div class="d">${text("टॉलरन्स", "टॉलरेंस", "Tolerance")}: ${tolText}</div>
          ${ppmText}
        </div>`;
    },

    click(el) {
      if (el.dataset.resbands) {
        setBandCount(Number(el.dataset.resbands));
        render();
        return true;
      }

      return false;
    }
  });

  document.addEventListener("change", e => {
    if (App.view !== "res") return;

    if (e.target.matches('select[data-resband]')) {
      const i = Number(e.target.dataset.resband);

      S.colors[i] = e.target.value;
      saveState();

      const swatch = e.target.parentElement.querySelector("span");
      if (swatch) swatch.style.background = color(S.colors[i]).hex;

      MODULES.res.update();
    }
  });
})();
