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

  const B = { ...defaults, ...store.get(KEY, {}) };

  const $ = id => document.getElementById(id);

  const val = (id, fallback) => {
    const el = $(id);
    if (!el) return fallback;
    const n = num(el.value);
    return Number.isFinite(n) ? n : fallback;
  };

  const safe = n => Number.isFinite(n) ? fmt(n, 2) : "—";

  const TXT = {
    en: {
      title: "Battery PRO",
      intro: "Advanced Battery Pack Designer",
      intro2: "Design your battery pack and explore its connections.",
      chem: "Cell Chemistry",
      liion: "Li-ion (NMC/NCA)",
      lfp: "LiFePO₄",
      lead: "Lead-acid",
      custom: "Custom cell",
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
      parallel: "Parallel cells / group",
      cells: "Total cells",
      capacity: "Pack capacity",
      energy: "Energy",
      safety: "Safety: use a compatible BMS, matched cells, insulation, correctly rated fuse and chemistry-matched charger. This is an illustrative diagram, not a certified wiring design.",
      save: "Save calculation",
      saved: "Saved",
      need: "Enter valid values first.",
      voltageOK: "Calculated voltage is near your target. Confirm device compatibility.",
      voltageWarn: "Calculated voltage differs from target. Check the device voltage limits.",
      view: "Interactive 3D Pack View",
      front: "Front",
      side: "Side",
      top: "Top",
      rotate: "Auto Rotate",
      wiring: "Connection Diagram",
      seriesWire: "Series connection",
      parallelWire: "Parallel connection",
      current: "Current-flow illustration",
      voltageSteps: "Cumulative series voltage",
      group: "Group",
      nickel: "Nickel strips",
      wire: "Output wires",
      shown: "Cells shown",
      of: "of",
      chemistryHint: "Choose chemistry to set typical cell voltages.",
      seriesHelp: "Series adds voltage.",
      parallelHelp: "Parallel increases capacity; voltage stays the same.",
      terminal: "Pack terminals",
      nominalNote: "Nominal voltage differs from full-charge voltage.",
      viewHint: "Use the buttons to inspect the pack from different sides.",
      badInput: "Check your values. Voltages and capacities must be positive, and full-charge voltage cannot be below nominal voltage.",
      layout: "Illustrative layout",
      actual: "Calculated pack",
      requested: "Target voltage",
      perGroup: "Cells in each group",
      warning: "Important: the drawing is illustrative. Real cell arrangement and nickel-strip routing depend on the pack design."
    },

    mr: {
      title: "बॅटरी PRO",
      intro: "Advanced Battery Pack Designer",
      intro2: "Battery pack डिझाइन करा आणि जोडणी समजून घ्या.",
      chem: "सेलचा प्रकार",
      liion: "Li-ion (NMC/NCA)",
      lfp: "LiFePO₄",
      lead: "Lead-acid",
      custom: "Custom सेल",
      design: "पॅक डिझाइन",
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
      safety: "सुरक्षा: compatible BMS, जुळणारे सेल, योग्य insulation, योग्य rating चा fuse आणि battery chemistry शी compatible charger वापरा. हे प्रातिनिधिक चित्र आहे; प्रमाणित wiring design नाही.",
      save: "गणना Save करा",
      saved: "Save झाले",
      need: "आधी योग्य values भरा.",
      voltageOK: "Calculated voltage लक्ष्याजवळ आहे. उपकरणाची compatibility तपासा.",
      voltageWarn: "Calculated voltage आणि target मध्ये फरक आहे. उपकरणाची voltage मर्यादा तपासा.",
      view: "Interactive 3D Pack View",
      front: "समोरून",
      side: "बाजूने",
      top: "वरून",
      rotate: "Auto Rotate",
      wiring: "Connection Diagram",
      seriesWire: "Series जोडणी",
      parallelWire: "Parallel जोडणी",
      current: "Current flow चे प्रातिनिधिक animation",
      voltageSteps: "Series नुसार वाढणारे Voltage",
      group: "Group",
      nickel: "Nickel पट्ट्या",
      wire: "Output Wires",
      shown: "दाखवलेले सेल",
      of: "पैकी",
      chemistryHint: "Battery प्रकार निवडल्यावर सामान्य cell voltage सेट होईल.",
      seriesHelp: "Series जोडल्याने Voltage वाढते.",
      parallelHelp: "Parallel जोडल्याने Capacity वाढते; Voltage तेवढेच राहते.",
      terminal: "Pack Terminals",
      nominalNote: "Nominal Voltage आणि Full-Charge Voltage वेगळे असतात.",
      viewHint: "वेगवेगळ्या बाजूंनी पाहण्यासाठी बटणे वापरा.",
      badInput: "Values तपासा. Voltage आणि Capacity शून्यापेक्षा जास्त हव्यात. Full-charge voltage हा nominal voltage पेक्षा कमी नसावा.",
      layout: "प्रातिनिधिक मांडणी",
      actual: "Calculated Pack",
      requested: "Target Voltage",
      perGroup: "प्रत्येक Group मधील सेल",
      warning: "महत्त्वाचे: हे समजावण्यासाठी केलेले चित्र आहे. प्रत्यक्ष cell arrangement आणि nickel-strip जोडणी pack design वर अवलंबून असते."
    },

    hi: {
      title: "बैटरी PRO",
      intro: "Advanced Battery Pack Designer",
      intro2: "बैटरी पैक डिज़ाइन करें और connections समझें।",
      chem: "सेल का प्रकार",
      liion: "Li-ion (NMC/NCA)",
      lfp: "LiFePO₄",
      lead: "Lead-acid",
      custom: "Custom सेल",
      design: "पैक डिज़ाइन",
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
      safety: "सुरक्षा: compatible BMS, matched cells, insulation, सही rating का fuse और chemistry-matched charger इस्तेमाल करें। यह illustrative diagram है, प्रमाणित wiring design नहीं।",
      save: "गणना Save करें",
      saved: "Save हो गया",
      need: "पहले सही values दर्ज करें।",
      voltageOK: "Voltage लक्ष्य के करीब है। डिवाइस compatibility जांचें।",
      voltageWarn: "Calculated voltage लक्ष्य से अलग है। डिवाइस की voltage सीमा जांचें।",
      view: "Interactive 3D Pack View",
      front: "Front",
      side: "Side",
      top: "Top",
      rotate: "Auto Rotate",
      wiring: "Connection Diagram",
      seriesWire: "Series connection",
      parallelWire: "Parallel connection",
      current: "Current-flow illustration",
      voltageSteps: "Series के अनुसार Voltage",
      group: "Group",
      nickel: "Nickel strips",
      wire: "Output wires",
      shown: "दिखाए गए सेल",
      of: "में से",
      chemistryHint: "Chemistry चुनने पर सामान्य cell voltage सेट होगा।",
      seriesHelp: "Series से Voltage बढ़ता है।",
      parallelHelp: "Parallel से Capacity बढ़ती है; Voltage समान रहता है।",
      terminal: "Pack Terminals",
      nominalNote: "Nominal Voltage और Full-Charge Voltage अलग हैं।",
      viewHint: "अलग-अलग sides देखने के लिए buttons इस्तेमाल करें।",
      badInput: "Values जांचें। Voltage और Capacity शून्य से अधिक हों और full-charge voltage nominal voltage से कम न हो।",
      layout: "Illustrative layout",
      actual: "Calculated pack",
      requested: "Target voltage",
      perGroup: "हर Group में सेल",
      warning: "यह समझाने वाला चित्र है। वास्तविक cell arrangement और nickel-strip routing pack design पर निर्भर है।"
    }
  };

  const L = key => {
    const lang = TXT[App.lang] ? App.lang : "en";
    return TXT[lang][key] || TXT.en[key] || key;
  };

  const field = (id, label, value) => `
    <div class="f">
      <label for="${id}">${label}</label>
      <input id="${id}" type="number" min="0.01" step="any" value="${esc(value)}">
    </div>`;

  function styles() {
    return `<style>
      .bp-card {
        margin: 12px 0;
        padding: 16px;
        border-radius: 20px;
        background: var(--card, rgba(255,255,255,.88));
        border: 1px solid rgba(100,140,200,.22);
        box-shadow: 0 8px 24px rgba(25,55,100,.07);
        overflow: hidden;
      }
      .bp-card h2 { font-size: 21px; margin: 8px 0; }
      .bp-card h3 { font-size: 16px; margin: 0 0 12px; }
      .bp-card p { font-size: 13px; line-height: 1.5; }
      .bp-kicker, .bp-label {
        font-size: 11px;
        font-weight: 800;
        color: #3478e5;
      }
      .bp-muted { opacity: .72; font-size: 12px; }
      .bp-chips, .bp-views {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin: 10px 0;
      }
      .bp-chips button, .bp-views button {
        border: 1px solid rgba(80,120,180,.3);
        border-radius: 999px;
        padding: 9px 12px;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 12px;
      }
      .bp-chips button.active, .bp-views button.active {
        background: #2563eb;
        color: #fff;
        border-color: #2563eb;
      }
      .bp-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
        margin-top: 12px;
      }
      .bp-stat {
        padding: 12px;
        border-radius: 14px;
        background: rgba(90,130,190,.09);
        min-width: 0;
      }
      .bp-stat b {
        display: block;
        font-size: 18px;
        overflow-wrap: anywhere;
      }
      .bp-stat span { font-size: 11px; opacity: .75; }
      .bp-warning {
        padding: 12px;
        border-radius: 12px;
        background: rgba(245,158,11,.13);
        font-size: 12px;
        line-height: 1.5;
        margin-top: 12px;
      }
      .bp-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 11px;
        margin: 12px 0;
      }
      .bp-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 5px;
      }
      .bp-blue { background: #2697ff; }
      .bp-orange { background: #ff9b35; }
      .bp-green { background: #22c55e; }
      .bp-diagram {
        padding: 10px 4px;
        border-radius: 16px;
        background: linear-gradient(145deg, #f8fbff, #eaf1fc);
        color: #152b4a;
        overflow-x: auto;
      }
      .bp-pack-scene {
        perspective: 850px;
        width: 100%;
        min-height: 235px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 20px 0;
      }
      .bp-pack {
        position: relative;
        display: flex;
        gap: 9px;
        align-items: center;
        transform-style: preserve-3d;
        transition: transform .65s cubic-bezier(.2,.75,.25,1);
      }
      .bp-pack.mode-front { transform: rotateX(0) rotateY(0); }
      .bp-pack.mode-side { transform: rotateX(0) rotateY(60deg); }
      .bp-pack.mode-top { transform: rotateX(65deg) rotateY(0); }
      .bp-pack.mode-rotate { animation: bpOrbit 8s linear infinite; }
      @keyframes bpOrbit {
        0% { transform: rotateX(-12deg) rotateY(0); }
        50% { transform: rotateX(12deg) rotateY(180deg); }
        100% { transform: rotateX(-12deg) rotateY(360deg); }
      }
      .bp-group {
        position: relative;
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 8px 6px;
        border-radius: 10px;
        border: 2px solid #ff9b35;
        background: rgba(255,155,53,.10);
        transform-style: preserve-3d;
        box-shadow: 0 8px 12px rgba(20,40,80,.13);
      }
      .bp-group-label {
        position: absolute;
        top: -23px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 10px;
        font-weight: 800;
        color: #b96a0c;
        white-space: nowrap;
      }
      .bp-cell {
        position: relative;
        width: 25px;
        height: 55px;
        flex: none;
        border-radius: 7px;
        border: 1px solid #7ab6ff;
        background: linear-gradient(110deg, #8bc6ff 0%, #3478d5 43%, #17418a 100%);
        box-shadow: inset -4px 0 5px rgba(0,0,0,.15), 0 3px 4px #b6c8e4;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 9px;
        font-weight: 800;
      }
      .bp-cell:before {
        content: "";
        position: absolute;
        top: -4px;
        left: 8px;
        width: 9px;
        height: 5px;
        border-radius: 2px 2px 0 0;
        background: #d1dbe8;
        border: 1px solid #9aacc3;
      }
      .bp-bus {
        position: absolute;
        height: 5px;
        border-radius: 5px;
        left: 3px;
        right: 3px;
        background: #2697ff;
        box-shadow: 0 0 5px rgba(38,151,255,.55);
      }
      .bp-bus.top { top: 1px; }
      .bp-bus.bottom { bottom: 1px; }
      .bp-wire {
        height: 5px;
        width: 18px;
        flex: none;
        border-radius: 5px;
        background: #ff9b35;
        box-shadow: 0 0 7px #ffb05c;
        position: relative;
      }
      .bp-wire:after {
        content: "";
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          90deg, transparent 0 5px, rgba(255,255,255,.9) 5px 8px
        );
        animation: bpFlow .7s linear infinite;
      }
      @keyframes bpFlow {
        to { background-position: 16px 0; }
      }
      .bp-terminal {
        font-size: 11px;
        font-weight: 900;
        padding: 6px;
        border-radius: 8px;
        color: white;
      }
      .bp-terminal.pos { background: #e5484d; }
      .bp-terminal.neg { background: #2563eb; }
      .bp-step {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(100,130,170,.16);
        align-items: center;
      }
      .bp-step:last-child { border-bottom: 0; }
      .bp-step strong { font-size: 13px; }
      .bp-step small {
        display: block;
        font-size: 11px;
        opacity: .7;
        margin-top: 3px;
      }
      .bp-voltage {
        padding: 7px 9px;
        border-radius: 9px;
        background: rgba(255,155,53,.14);
        color: #a95c08;
        font-weight: 900;
        font-size: 13px;
        white-space: nowrap;
      }
      .bp-connection-note {
        border-radius: 12px;
        padding: 11px;
        margin-top: 10px;
        background: rgba(38,151,255,.08);
        font-size: 12px;
        line-height: 1.5;
      }
      @media (max-width: 380px) {
        .bp-cell { width: 21px; height: 49px; }
        .bp-group { gap: 3px; padding: 7px 5px; }
        .bp-pack { gap: 6px; }
        .bp-wire { width: 10px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .bp-wire:after { animation: none; }
        .bp-pack.mode-rotate { animation: none; }
      }
    </style>`;
  }

  function packDrawing(series, parallel, cellV, cellAh) {
    const total = series * parallel;
    const vs = Math.min(series, 8);
    const vp = Math.min(parallel, 5);
    const visible = vs * vp;

    let groups = "";

    for (let s = 0; s < vs; s++) {
      let cells = "";

      for (let p = 0; p < vp; p++) {
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
        ${s < vs - 1 ? '<div class="bp-wire"></div>' : ""}`;
    }

    const mode = B.viewMode || "front";
    let steps = "";

    for (let s = 1; s <= series; s++) {
      steps += `
        <div class="bp-step">
          <div>
            <strong>${L("group")} ${s}</strong>
            <small>${s}S · ${parallel}P · ${safe(parallel * cellAh)} Ah</small>
          </div>
          <div class="bp-voltage">${safe(cellV * s)} V</div>
        </div>`;
    }

    return `
      <div class="bp-card">
        <h3>3. ${L("view")}</h3>
        <p class="bp-muted">${L("viewHint")}</p>

        <div class="bp-views">
          <button type="button" data-act="view-front"
            class="${mode === "front" ? "active" : ""}">${L("front")}</button>
          <button type="button" data-act="view-side"
            class="${mode === "side" ? "active" : ""}">${L("side")}</button>
          <button type="button" data-act="view-top"
            class="${mode === "top" ? "active" : ""}">${L("top")}</button>
          <button type="button" data-act="view-rotate"
            class="${mode === "rotate" ? "active" : ""}">${L("rotate")}</button>
        </div>

        <div class="bp-diagram">
          <div class="bp-legend">
            <span><i class="bp-dot bp-orange"></i>${L("seriesWire")}</span>
            <span><i class="bp-dot bp-blue"></i>${L("parallelWire")}</span>
            <span><i class="bp-dot bp-green"></i>${L("current")}</span>
          </div>

          <div class="bp-pack-scene">
            <div class="bp-pack mode-${mode}">
              <div class="bp-terminal neg">−</div>
              ${groups}
              <div class="bp-terminal pos">+</div>
            </div>
          </div>

          <div class="bp-legend">
            <span><i class="bp-dot bp-orange"></i>${L("nickel")}</span>
            <span><i class="bp-dot bp-blue"></i>${L("wire")}</span>
          </div>

          <p class="bp-muted">${L("shown")}: ${visible} ${L("of")} ${total}</p>
        </div>

        <h3 style="margin-top:18px">${L("voltageSteps")}</h3>
        ${steps}

        <div class="bp-connection-note">
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
      const chem = [
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
            ${chem.map(([id, k]) => `
              <button type="button" data-chem="${id}"
                class="${B.chemistry === id ? "active" : ""}">
                ${L(k)}
              </button>`).join("")}
          </div>

          <p class="bp-muted">${L("chemistryHint")}</p>
        </div>

        <div class="bp-card">
          <h3>1. ${L("design")}</h3>

          <div class="fields two">
            ${field("bpCellV", L("cellV"), B.cellV)}
            ${field("bpCellAh", L("cellAh"), B.cellAh)}
            ${field("bpFullV", L("fullV"), B.fullCellV)}
            ${field("bpTargetV", L("targetV"), B.targetV)}
            ${field("bpTargetAh", L("targetAh"), B.targetAh)}
          </div>
        </div>

        <div id="bpResults"></div>
        <div id="bpView"></div>

        <div class="actions">
          <button class="save" id="
