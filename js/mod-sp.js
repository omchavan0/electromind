"use strict";

(function () {
  const KEY = "em_battery_pack";

  const defaults = {
    chemistry: "liion",
    cellV: 3.7,
    cellAh: 2.2,
    fullCellV: 4.2,
    targetV: 11.1,
    targetAh: 6,
    viewMode: "front"
  };

  const B = Object.assign({}, defaults, store.get(KEY, {}));

  const byId = id => document.getElementById(id);
  const number = v => {
    const n = parseFloat(String(v ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };
  const show = n => Number.isFinite(n) ? fmt(n, 2) : "—";

  const TXT = {
    en: {
      title: "Battery PRO",
      intro: "Advanced Battery Pack Designer",
      intro2: "Design your battery pack and explore its layout.",
      chem: "Cell Chemistry",
      liion: "Li-ion",
      lfp: "LiFePO4",
      lead: "Lead-acid",
      custom: "Custom",
      design: "Pack Design",
      cellV: "Cell nominal voltage (V)",
      cellAh: "Cell capacity (Ah)",
      fullV: "Cell full-charge voltage (V)",
      targetV: "Target pack voltage (V)",
      targetAh: "Required pack capacity (Ah)",
      results: "Calculated Results",
      nominal: "Nominal voltage",
      full: "Full-charge voltage",
      series: "Series groups",
      parallel: "Parallel cells per group",
      cells: "Total cells",
      capacity: "Pack capacity",
      energy: "Energy",
      view: "3D Pack View",
      front: "Front",
      side: "Side",
      top: "Top",
      rotate: "Auto Rotate",
      voltageSteps: "Cumulative series voltage",
      group: "Group",
      seriesWire: "Series",
      parallelWire: "Parallel",
      shown: "Cells shown",
      of: "of",
      save: "Save calculation",
      ok: "Calculated voltage is near the target. Check device compatibility.",
      mismatch: "Calculated voltage differs from target. Check the device voltage limits.",
      invalid: "Enter positive voltage and capacity values. Full-charge voltage must not be below nominal voltage.",
      chemistryHint: "Choose the cell chemistry. Confirm actual cell specifications before building.",
      seriesHelp: "Series increases voltage.",
      parallelHelp: "Parallel increases capacity, not voltage.",
      safety: "SAFETY: Use compatible cells, a suitable BMS, cell balancing, insulation, a correctly rated fuse and a chemistry-matched charger. This illustration is not a certified wiring plan.",
      warning: "Illustrative layout only. Actual cell arrangement and connections must be designed and checked for your specific pack."
    },
    mr: {
      title: "बॅटरी PRO",
      intro: "Advanced Battery Pack Designer",
      intro2: "तुमचा Battery Pack डिझाइन करा.",
      chem: "सेलचा प्रकार",
      liion: "Li-ion",
      lfp: "LiFePO4",
      lead: "Lead-acid",
      custom: "Custom",
      design: "Pack Design",
      cellV: "एका सेलचा Nominal Voltage (V)",
      cellAh: "एका सेलची Capacity (Ah)",
      fullV: "एका सेलचा Full-Charge Voltage (V)",
      targetV: "हवे असलेले Pack Voltage (V)",
      targetAh: "हवी असलेली Pack Capacity (Ah)",
      results: "गणनेचा निकाल",
      nominal: "Nominal Voltage",
      full: "Full-Charge Voltage",
      series: "Series Groups",
      parallel: "प्रत्येक Group मधील Parallel Cells",
      cells: "एकूण सेल",
      capacity: "Pack Capacity",
      energy: "Energy",
      view: "3D Battery Pack View",
      front: "समोरून",
      side: "बाजूने",
      top: "वरून",
      rotate: "Auto Rotate",
      voltageSteps: "Series नुसार वाढणारे Voltage",
      group: "Group",
      seriesWire: "Series",
      parallelWire: "Parallel",
      shown: "दाखवलेले सेल",
      of: "पैकी",
      save: "गणना Save करा",
      ok: "Calculated Voltage लक्ष्याजवळ आहे. उपकरणाची compatibility तपासा.",
      mismatch: "Calculated Voltage आणि Target मध्ये फरक आहे. उपकरणाची voltage मर्यादा तपासा.",
      invalid: "Voltage आणि Capacity शून्यापेक्षा जास्त असावेत. Full-Charge Voltage हा Nominal Voltage पेक्षा कमी नसावा.",
      chemistryHint: "सेलचा प्रकार निवडा. वापरण्यापूर्वी प्रत्यक्ष सेलचे specifications तपासा.",
      seriesHelp: "Series जोडल्याने Voltage वाढते.",
      parallelHelp: "Parallel जोडल्याने Capacity वाढते; Voltage तेवढेच राहते.",
      safety: "सुरक्षा: योग्य सेल, compatible BMS, cell balancing, insulation, योग्य rating चा fuse आणि battery chemistry शी जुळणारा charger वापरा. हे प्रमाणित wiring diagram नाही.",
      warning: "हे फक्त समजावण्यासाठीचे चित्र आहे. प्रत्यक्ष सेलची मांडणी आणि जोडणी योग्य pack design नुसार तपासूनच करा."
    },
    hi: {
      title: "बैटरी PRO",
      intro: "Advanced Battery Pack Designer",
      intro2: "अपना Battery Pack डिज़ाइन करें।",
      chem: "सेल का प्रकार",
      liion: "Li-ion",
      lfp: "LiFePO4",
      lead: "Lead-acid",
      custom: "Custom",
      design: "Pack Design",
      cellV: "एक सेल का Nominal Voltage (V)",
      cellAh: "एक सेल की Capacity (Ah)",
      fullV: "एक सेल का Full-Charge Voltage (V)",
      targetV: "Target Pack Voltage (V)",
      targetAh: "ज़रूरी Pack Capacity (Ah)",
      results: "गणना का परिणाम",
      nominal: "Nominal Voltage",
      full: "Full-Charge Voltage",
      series: "Series Groups",
      parallel: "हर Group में Parallel Cells",
      cells: "कुल सेल",
      capacity: "Pack Capacity",
      energy: "Energy",
      view: "3D Battery Pack View",
      front: "Front",
      side: "Side",
      top: "Top",
      rotate: "Auto Rotate",
      voltageSteps: "Series के अनुसार Voltage",
      group: "Group",
      seriesWire: "Series",
      parallelWire: "Parallel",
      shown: "दिखाए गए सेल",
      of: "में से",
      save: "गणना Save करें",
      ok: "Voltage लक्ष्य के करीब है। डिवाइस compatibility जांचें।",
      mismatch: "Calculated Voltage लक्ष्य से अलग है। डिवाइस की voltage सीमा जांचें।",
      invalid: "Voltage और Capacity शून्य से अधिक हों। Full-Charge Voltage, Nominal Voltage से कम नहीं होना चाहिए।",
      chemistryHint: "Cell chemistry चुनें और वास्तविक सेल के specifications जांचें।",
      seriesHelp: "Series से Voltage बढ़ता है।",
      parallelHelp: "Parallel से Capacity बढ़ती है, Voltage नहीं।",
      safety: "सुरक्षा: compatible cells, BMS, cell balancing, insulation, सही rating का fuse और chemistry-matched charger इस्तेमाल करें। यह प्रमाणित wiring plan नहीं है।",
      warning: "यह केवल illustrative layout है। वास्तविक cell arrangement और connections की जांच आवश्यक है।"
    }
  };

  const L = key => {
    const lang = TXT[App.lang] ? App.lang : "en";
    return TXT[lang][key] || TXT.en[key] || key;
  };

  function field(id, key, value) {
    return `
      <div class="f">
        <label for="${id}">${L(key)}</label>
        <input id="${id}" type="number" min="0.01"
          step="any" value="${esc(value)}">
      </div>`;
  }

  function css() {
    return `<style>
      .bp-card {
        margin: 12px 0;
        padding: 16px;
        border-radius: 20px;
        background: var(--card,rgba(255,255,255,.9));
        border: 1px solid rgba(100,140,200,.24);
        box-shadow: 0 8px 24px rgba(25,55,100,.07);
        overflow: hidden;
      }
      .bp-card h2 {font-size:21px;margin:8px 0}
      .bp-card h3 {font-size:16px;margin:0 0 12px}
      .bp-card p {font-size:13px;line-height:1.5}
      .bp-kicker,.bp-label {font-size:11px;font-weight:800;color:#3478e5}
      .bp-muted {opacity:.72;font-size:12px}
      .bp-chips,.bp-views {display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}
      .bp-chips button,.bp-views button {
        border:1px solid rgba(80,120,180,.3);
        border-radius:999px;padding:9px 12px;
        background:transparent;color:inherit;cursor:pointer;font-size:12px
      }
      .bp-chips button.active,.bp-views button.active {
        background:#2563eb;color:#fff;border-color:#2563eb
      }
      .bp-stats {
        display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
        gap:9px;margin-top:12px
      }
      .bp-stat {padding:12px;border-radius:14px;background:rgba(90,130,190,.09);min-width:0}
      .bp-stat b {display:block;font-size:18px;overflow-wrap:anywhere}
      .bp-stat span {font-size:11px;opacity:.75}
      .bp-warning {
        padding:12px;border-radius:12px;background:rgba(245,158,11,.13);
        font-size:12px;line-height:1.5;margin-top:12px
      }
      .bp-legend {display:flex;flex-wrap:wrap;gap:12px;font-size:11px;margin:12px 0}
      .bp-dot {display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px}
      .bp-blue {background:#2697ff}
      .bp-orange {background:#ff9b35}
      .bp-green {background:#22c55e}
      .bp-diagram {
        padding:10px 4px;border-radius:16px;
        background:linear-gradient(145deg,#f8fbff,#eaf1fc);
        color:#152b4a;overflow-x:auto
      }
      .bp-pack-scene {
        perspective:850px;width:100%;min-height:235px;
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;padding:20px 0
      }
      .bp-pack {
        position:relative;display:flex;gap:9px;align-items:center;
        transform-style:preserve-3d;transition:transform .65s
      }
      .bp-pack.mode-front {transform:rotateX(0) rotateY(0)}
      .bp-pack.mode-side {transform:rotateX(0) rotateY(60deg)}
      .bp-pack.mode-top {transform:rotateX(65deg) rotateY(0)}
      .bp-pack.mode-rotate {animation:bpOrbit 8s linear infinite}
      @keyframes bpOrbit {
        0% {transform:rotateX(-12deg) rotateY(0)}
        50% {transform:rotateX(12deg) rotateY(180deg)}
        100% {transform:rotateX(-12deg) rotateY(360deg)}
      }
      .bp-group {
        position:relative;display:flex;gap:4px;align-items:center;
        padding:8px 6px;border-radius:10px;border:2px solid #ff9b35;
        background:rgba(255,155,53,.1);transform-style:preserve-3d;
        box-shadow:0 8px 12px rgba(20,40,80,.13)
      }
      .bp-group-label {
        position:absolute;top:-23px;left:0;right:0;text-align:center;
        font-size:10px;font-weight:800;color:#b96a0c;white-space:nowrap
      }
      .bp-cell {
        position:relative;width:25px;height:55px;flex:none;border-radius:7px;
        border:1px solid #7ab6ff;
        background:linear-gradient(110deg,#8bc6ff 0%,#3478d5 43%,#17418a 100%);
        box-shadow:inset -4px 0 5px rgba(0,0,0,.15),0 3px 4px #b6c8e4;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:9px;font-weight:800
      }
      .bp-cell:before {
        content:"";position:absolute;top:-4px;left:8px;width:9px;height:5px;
        border-radius:2px 2px 0 0;background:#d1dbe8;border:1px solid #9aacc3
      }
      .bp-bus {
        position:absolute;height:5px;border-radius:5px;left:3px;right:3px;
        background:#2697ff;box-shadow:0 0 5px rgba(38,151,255,.55)
      }
      .bp-bus.top {top:1px}
      .bp-bus.bottom {bottom:1px}
      .bp-wire {
        height:5px;width:18px;flex:none;border-radius:5px;
        background:#ff9b35;box-shadow:0 0 7px #ffb05c;position:relative
      }
      .bp-wire:after {
        content:"";position:absolute;inset:0;
        background:repeating-linear-gradient(90deg,transparent 0 5px,rgba(255,255,255,.9) 5px 8px);
        animation:bpFlow .7s linear infinite
      }
      @keyframes bpFlow {to {background-position:16px 0}}
      .bp-terminal {font-size:11px;font-weight:900;padding:6px;border-radius:8px;color:white}
      .bp-terminal.pos {background:#e5484d}
      .bp-terminal.neg {background:#2563eb}
      .bp-step {
        display:grid;grid-template-columns:1fr auto;gap:8px;
        padding:10px 0;border-bottom:1px solid rgba(100,130,170,.16);align-items:center
      }
      .bp-step:last-child {border-bottom:0}
      .bp-step strong {font-size:13px}
      .bp-step small {display:block;font-size:11px;opacity:.7;margin-top:3px}
      .bp-voltage {
        padding:7px 9px;border-radius:9px;background:rgba(255,155,53,.14);
        color:#a95c08;font-weight:900;font-size:13px;white-space:nowrap
      }
      .bp-note {
        border-radius:12px;padding:11px;margin-top:10px;
        background:rgba(38,151,255,.08);font-size:12px;line-height:1.5
      }
      @media(max-width:380px) {
        .bp-cell {width:21px;height:49px}
        .bp-group {gap:3px;padding:7px 5px}
        .bp-pack {gap:6px}
        .bp-wire {width:10px}
      }
      @media(prefers-reduced-motion:reduce) {
        .bp-wire:after,.bp-pack.mode-rotate {animation:none}
      }
    </style>`;
  }

  function drawing(series, parallel) {
    const maxS = Math.min(series, 8);
    const maxP = Math.min(parallel, 5);
    let groups = "";
    let steps = "";

    for (let s = 0; s < maxS; s++) {
      let cells = "";

      for (let p = 0; p < maxP; p++) {
        const index = s * parallel + p + 1;
        cells += `<div class="bp-cell" title="Cell ${index}">${index}</div>`;
      }

      groups += `
        <div class="bp-group">
          <div class="bp-group-label">S${s + 1}</div>
          <div class="bp-bus top"></div>
          ${cells}
          <div class="bp-bus bottom"></div>
        </div>
        ${s < maxS - 1 ? '<div class="bp-wire"></div>' : ""}`;
    }

    for (let s = 1; s <= series; s++) {
      steps += `
        <div class="bp-step">
          <div>
            <strong>${L("group")} ${s}</strong>
            <small>${s}S · ${parallel}P · ${show(parallel * B.cellAh)} Ah</small>
          </div>
          <div class="bp-voltage">${show(s * B.cellV)} V</div>
        </div>`;
    }

    const mode = ["front", "side", "top", "rotate"].includes(B.viewMode)
      ? B.viewMode : "front";

    return `
      <div class="bp-card">
        <h3>3. ${L("view")}</h3>
        <div class="bp-views">
          ${["front", "side", "top", "rotate"].map(v => `
            <button type="button" data-act="view-${v}"
              class="${mode === v ? "active" : ""}">${L(v)}</button>
          `).join("")}
        </div>

        <div class="bp-diagram">
          <div class="bp-legend">
            <span><i class="bp-dot bp-orange"></i>${L("seriesWire")}</span>
            <span><i class="bp-dot bp-blue"></i>${L("parallelWire")}</span>
            <span><i class="bp-dot bp-green"></i>Current flow</span>
          </div>
          <div class="bp-pack-scene">
            <div class="bp-pack mode-${mode}">
              <div class="bp-terminal neg">−</div>
              ${groups}
              <div class="bp-terminal pos">+</div>
            </div>
          </div>
          <p class="bp-muted">${L("shown")}: ${maxS * maxP} ${L("of")} ${series * parallel}</p>
        </div>

        <h3 style="margin-top:18px">${L("voltageSteps")}</h3>
        ${steps}

        <div class="bp-note">
          <b>${L("seriesWire")}:</b> ${L("seriesHelp")}<br>
          <b>${L("parallelWire")}:</b> ${L("parallelHelp")}
        </div>
        <div class="bp-warning">${L("warning")}</div>
      </div>`;
  }

  registerModule({
    id: "battery",
    big: "battery",
    titleKey: "batteryPro",
    subKey: "batteryProS",

    render() {
      const chemistry = [
        ["liion", "liion"],
        ["lfp", "lfp"],
        ["lead", "lead"],
        ["custom", "custom"]
      ];

      return `
        ${topBar(L("title"))}

        <div class="bp-card">
          <div class="bp-kicker">ELECTROMIND · BATTERY LAB</div>
          <h2>${L("intro")}</h2>
          <p>${L("intro2")}</p>
          <div class="bp-label">${L("chem")}</div>

          <div class="bp-chips">
            ${chemistry.map(([id, key]) => `
              <button type="button" data-chem="${id}"
                class="${B.chemistry === id ? "active" : ""}">
                ${L(key)}
              </button>
            `).join("")}
          </div>
          <p class="bp-muted">${L("chemistryHint")}</p>
        </div>

        <div class="bp-card">
          <h3>1. ${L("design")}</h3>
          <div class="fields two">
            ${field("bpCellV", "cellV", B.cellV)}
            ${field("bpCellAh", "cellAh", B.cellAh)}
            ${field("bpFullV", "fullV", B.fullCellV)}
            ${field("bpTargetV", "targetV", B.targetV)}
            ${field("bpTargetAh", "targetAh", B.targetAh)}
          </div>
        </div>

        <div id="bpResults"></div>
        <div id="bpView"></div>

        <div class="actions">
          <button class="save" id="save">${L("save")}</button>
        </div>

        <div class="note">${L("safety")}</div>
        ${css()}`;
    },

    update() {
      const inputs = {
        cellV: "bpCellV",
        cellAh: "bpCellAh",
        fullCellV: "bpFullV",
        targetV: "bpTargetV",
        targetAh: "bpTargetAh"
      };

      for (const [key, id] of Object.entries(inputs)) {
        const el = byId(id);
        if (el) B[key] = number(el.value);
      }

      store.set(KEY, B);

      const out = byId("bpResults");
      const view = byId("bpView");
      if (!out || !view) return;

      const valid = [
        B.cellV, B.cellAh, B.fullCellV, B.targetV, B.targetAh
      ].every(Number.isFinite) &&
        B.cellV > 0 &&
        B.cellAh > 0 &&
        B.fullCellV >= B.cellV &&
        B.targetV > 0 &&
        B.targetAh > 0;

      if (!valid) {
        App.last = null;
        out.innerHTML = `<div class="bp-card">${L("invalid")}</div>`;
        view.innerHTML = "";
        return;
      }

      const series = Math.max(1, Math.round(B.targetV / B.cellV));
      const parallel = Math.max(1, Math.ceil(B.targetAh / B.cellAh));

      const nominalV = series * B.cellV;
      const fullV = series * B.fullCellV;
      const capacity = parallel * B.cellAh;
      const totalCells = series * parallel;
      const wh = nominalV * capacity;
      const kwh = wh / 1000;
      const close = Math.abs(nominalV - B.targetV) <=
        Math.max(0.5, B.targetV * 0.05);

      out.innerHTML = `
        <div class="bp-card">
          <h3>2. ${L("results")}</h3>
          <div class="bp-stats">
            <div class="bp-stat"><b>${show(nominalV)} V</b><span>${L("nominal")}</span></div>
            <div class="bp-stat"><b>${show(fullV)} V</b><span>${L("full")}</span></div>
            <div class="bp-stat"><b>${series}S</b><span>${L("series")}</span></div>
            <div class="bp-stat"><b>${parallel}P</b><span>${L("parallel")}</span></div>
            <div class="bp-stat"><b>${totalCells}</b><span>${L("cells")}</span></div>
            <div class="bp-stat"><b>${show(capacity)} Ah</b><span>${L("capacity")}</span></div>
            <div class="bp-stat"><b>${show(wh)} Wh</b><span>Wh</span></div>
            <div class="bp-stat"><b>${show(kwh)} kWh</b><span>kWh</span></div>
          </div>
          <div class="bp-warning">${close ? L("ok") : L("mismatch")}</div>
        </div>`;

      view.innerHTML = drawing(series, parallel);

      App.last = {
        title: `Battery PRO · ${show(nominalV)}V · ${show(capacity)}Ah`,
        result: `${series}S${parallel}P · ${totalCells} cells · ${show(wh)}Wh`
      };
    },

    click(el) {
      if (el.dataset.chem) {
        B.chemistry = el.dataset.chem;

        const preset = {
          liion: { cellV: 3.7, fullCellV: 4.2 },
          lfp: { cellV: 3.2, fullCellV: 3.65 },
          lead: { cellV: 2, fullCellV: 2.4 }
        }[B.chemistry];

        if (preset) {
          B.cellV = preset.cellV;
          B.fullCellV = preset.fullCellV;
        }

        store.set(KEY, B);
        App.view = "battery";
        render();
        return true;
      }

      if (el.dataset.act && el.dataset.act.startsWith("view-")) {
        const mode = el.dataset.act.slice(5);

        if (["front", "side", "top", "rotate"].includes(mode)) {
          B.viewMode = mode;
          store.set(KEY, B);
          App.view = "battery";
          render();
          return true;
        }
      }

      return false;
    }
  });
})();
