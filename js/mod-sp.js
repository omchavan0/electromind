
"use strict";

(function () {
  const KEY = "em_battery_pack";

  const defaults = {
    chemistry: "liion",
    cellV: 3.7,
    cellAh: 3,
    fullCellV: 4.2,
    targetV: 12,
    targetAh: 60,
    whKm: 30,
    usable: 85,
    efficiency: 90,
    chargerA: 10,
    soc: 20,
    energyMode: "ah"
  };

  const B = { ...defaults, ...store.get(KEY, {}) };
  const get = id => document.getElementById(id);
  const val = (id, fallback) => {
    const el = get(id);
    if (!el) return fallback;
    const n = num(el.value);
    return Number.isFinite(n) ? n : fallback;
  };
  const safe = n => Number.isFinite(n) ? fmt(n, 2) : "—";

  const TXT = {
    en: {
      title:"Battery PRO", intro:"Advanced Battery Pack Designer",
      intro2:"Design a pack, convert energy units and estimate range.",
      chem:"Cell Chemistry", liion:"Li-ion (NMC/NCA)",
      lfp:"LiFePO₄", lead:"Lead-acid", custom:"Custom cell",
      cellV:"Cell nominal voltage (V)", cellAh:"Cell capacity (Ah)",
      fullV:"Cell full-charge voltage (V)", targetV:"Target pack voltage (V)",
      targetAh:"Required pack capacity (Ah)", design:"Pack Design",
      energy:"Energy Unit Converter", mode:"Convert from",
      ah:"Ah", wh:"Wh", kwh:"kWh", amount:"Enter value",
      range:"Range Estimator", consumption:"Vehicle consumption (Wh/km)",
      usable:"Usable energy (%)", efficiency:"System efficiency (%)",
      charging:"Charging Estimate", charger:"Charger current (A)",
      soc:"Current battery level (%)", results:"Calculated Results",
      nominal:"Nominal voltage", full:"Full-charge voltage",
      series:"Series", parallel:"Parallel", cells:"Total cells",
      capacity:"Pack capacity", energyWh:"Energy", rangeKm:"Estimated range",
      chargeTime:"Approx. charging time", inputError:"Check your inputs. Values must be positive; percentages must be 1–100.",
      voltageWarn:"The calculated nominal voltage differs from your target. Check device voltage limits before using this pack.",
      voltageOK:"Calculated voltage is near your target. Confirm compatibility with the device.",
      safety:"Safety: use a compatible BMS, balanced cells, a chemistry-matched charger, suitable wiring and correctly rated fuse. These calculations are estimates, not a certified pack design.",
      save:"Save calculation", saved:"Saved", need:"Enter valid values first.",
      rangeNote:"Range is estimated from usable energy and Wh/km; real-world range varies.",
      chargeNote:"Charging time is approximate and excludes charging taper, BMS limits and temperature effects.",
      view:"3D PACK VIEW", shown:"Shown", of:"of", total:"total cells",
      voltage:"Voltage", cap:"Capacity", energy:"Energy", unitHelp:"Ah × V = Wh; Wh ÷ 1000 = kWh.",
      preset:"Quick cell presets", customHint:"You can edit cell voltage and capacity manually.",
      choose:"Select chemistry", battery:"Battery", calc:"Results",
      lowSoc:"Current charge must be lower than 100% to estimate remaining charging time."
    },
    mr: {
      title:"बॅटरी PRO", intro:"Advanced Battery Pack Designer",
      intro2:"Battery pack तयार कर, energy units बदल आणि range चा अंदाज काढ.",
      chem:"सेलचा प्रकार", liion:"Li-ion (NMC/NCA)",
      lfp:"LiFePO₄", lead:"Lead-acid", custom:"Custom सेल",
      cellV:"एका सेलचा Nominal Voltage (V)", cellAh:"एका सेलची Capacity (Ah)",
      fullV:"एका सेलचा Full-Charge Voltage (V)", targetV:"हवे असलेले Pack Voltage (V)",
      targetAh:"हवी असलेली Pack Capacity (Ah)", design:"पॅक डिझाइन",
      energy:"Energy Unit Converter", mode:"कशातून रूपांतर करायचे",
      ah:"Ah", wh:"Wh", kwh:"kWh", amount:"Value भरा",
      range:"Range चा अंदाज", consumption:"वाहनाचा वापर (Wh/km)",
      usable:"वापरण्यायोग्य ऊर्जा (%)", efficiency:"System Efficiency (%)",
      charging:"Charging चा अंदाज", charger:"Charger Current (A)",
      soc:"सध्याची Battery Charge (%)", results:"गणनेचा निकाल",
      nominal:"Nominal Voltage", full:"Full-Charge Voltage",
      series:"Series", parallel:"Parallel", cells:"एकूण सेल",
      capacity:"Pack Capacity", energyWh:"Energy", rangeKm:"अंदाजे Range",
      chargeTime:"अंदाजे Charging Time", inputError:"Values तपास. सर्व values शून्यापेक्षा जास्त आणि टक्केवारी 1–100 असावी.",
      voltageWarn:"Calculated Nominal Voltage आणि Target Voltage मध्ये फरक आहे. वापरण्यापूर्वी उपकरणाची Voltage मर्यादा तपास.",
      voltageOK:"Calculated Voltage लक्ष्याजवळ आहे. उपकरणाशी compatibility तपास.",
      safety:"सुरक्षा: योग्य BMS, cell balancing, battery chemistry शी compatible charger, योग्य वायरिंग आणि योग्य rating चा fuse वापर. ही गणना अंदाजासाठी आहे; प्रमाणित battery design नाही.",
      save:"गणना Save कर", saved:"Save झाले", need:"आधी योग्य values भर.",
      rangeNote:"Range वापरण्यायोग्य energy आणि Wh/km वरून काढली आहे. प्रत्यक्ष range बदलू शकते.",
      chargeNote:"Charging time अंदाजे आहे. Charging taper, BMS limits आणि तापमानाचा पूर्ण हिशोब यात नाही.",
      view:"3D PACK VIEW", shown:"दाखवलेले", of:"पैकी", total:"एकूण सेल",
      voltage:"Voltage", cap:"Capacity", energy:"Energy", unitHelp:"Ah × V = Wh; Wh ÷ 1000 = kWh.",
      preset:"Cell चे पर्याय", customHint:"Cell Voltage आणि Capacity स्वतः बदलू शकतो.",
      choose:"Battery प्रकार निवड", battery:"बॅटरी", calc:"निकाल",
      lowSoc:"उरलेला charging time काढण्यासाठी सध्याची charge 100% पेक्षा कमी असावी."
    },
    hi: {
      title:"बैटरी PRO", intro:"Advanced Battery Pack Designer",
      intro2:"बैटरी पैक बनाएं, energy units बदलें और range का अनुमान लगाएं।",
      chem:"सेल का प्रकार", liion:"Li-ion (NMC/NCA)",
      lfp:"LiFePO₄", lead:"Lead-acid", custom:"Custom सेल",
      cellV:"एक सेल का Nominal Voltage (V)", cellAh:"एक सेल की Capacity (Ah)",
      fullV:"एक सेल का Full-Charge Voltage (V)", targetV:"Target Pack Voltage (V)",
      targetAh:"ज़रूरी Pack Capacity (Ah)", design:"पैक डिज़ाइन",
      energy:"Energy Unit Converter", mode:"किससे बदलना है",
      ah:"Ah", wh:"Wh", kwh:"kWh", amount:"Value दर्ज करें",
      range:"Range का अनुमान", consumption:"वाहन की खपत (Wh/km)",
      usable:"उपयोगी ऊर्जा (%)", efficiency:"System Efficiency (%)",
      charging:"Charging का अनुमान", charger:"Charger Current (A)",
      soc:"बैटरी का मौजूदा स्तर (%)", results:"गणना का परिणाम",
      nominal:"Nominal Voltage", full:"Full-Charge Voltage",
      series:"Series", parallel:"Parallel", cells:"कुल सेल",
      capacity:"Pack Capacity", energyWh:"Energy", rangeKm:"अनुमानित Range",
      chargeTime:"अनुमानित Charging Time", inputError:"Values जांचें। सभी values शून्य से अधिक और प्रतिशत 1–100 होना चाहिए।",
      voltageWarn:"Calculated Nominal Voltage और Target Voltage में अंतर है। इस्तेमाल से पहले डिवाइस की voltage सीमा जांचें।",
      voltageOK:"Calculated Voltage लक्ष्य के करीब है। डिवाइस compatibility जांचें।",
      safety:"सुरक्षा: compatible BMS, cell balancing, सही chemistry का charger, सही wiring और सही rating का fuse जरूरी है। यह अनुमान है, प्रमाणित battery design नहीं।",
      save:"गणना Save करें", saved:"Save हो गया", need:"पहले सही values दर्ज करें।",
      rangeNote:"Range उपयोगी energy और Wh/km से अनुमानित है। वास्तविक range अलग हो सकती है।",
      chargeNote:"Charging time अनुमानित है। Charging taper, BMS limits और temperature का पूरा हिसाब शामिल नहीं है।",
      view:"3D PACK VIEW", shown:"दिखाए गए", of:"में से", total:"कुल सेल",
      voltage:"Voltage", cap:"Capacity", energy:"Energy", unitHelp:"Ah × V = Wh; Wh ÷ 1000 = kWh.",
      preset:"Cell presets", customHint:"Cell Voltage और Capacity को manually बदल सकते हैं।",
      choose:"Battery प्रकार चुनें", battery:"बैटरी", calc:"परिणाम",
      lowSoc:"बाकी charging time निकालने के लिए मौजूदा charge 100% से कम होनी चाहिए।"
    }
  };

  const L = key => {
    const lang = TXT[App.lang] ? App.lang : "en";
    return TXT[lang][key] || TXT.en[key] || key;
  };

  const fieldLocal = (id, label, value, step="any") =>
    `<div class="f"><label for="${id}">${label}</label>
      <input id="${id}" type="number" step="${step}" value="${esc(value)}"></div>`;

  function packDrawing(series, parallel) {
    const total = series * parallel;
    const shown = Math.min(total, 48);
    const cols = Math.min(series, 8, shown);
    const rows = Math.max(1, Math.ceil(shown / Math.max(cols, 1)));
    const cw = 31, ch = 43, gx = 8, gy = 8, pad = 14;
    const width = pad * 2 + cols * cw + Math.max(0, cols - 1) * gx;
    const height = pad * 2 + rows * ch + Math.max(0, rows - 1) * gy + 20;
    let cells = "";

    for (let i = 0; i < shown; i++) {
      const x = pad + (i % cols) * (cw + gx);
      const y = pad + Math.floor(i / cols) * (ch + gy);
      cells += `<g>
        <rect x="${x+2}" y="${y+4}" width="${cw}" height="${ch-3}" rx="6" fill="#10254a" opacity=".2"/>
        <rect x="${x}" y="${y+4}" width="${cw}" height="${ch-4}" rx="6" fill="url(#bpCell)" stroke="#75aaff"/>
        <rect x="${x+10}" y="${y}" width="11" height="6" rx="2" fill="#cbd5e1"/>
        <text x="${x+cw/2}" y="${y+27}" text-anchor="middle" font-size="9" font-weight="700" fill="white">${i+1}</text>
      </g>`;
    }

    return `<div class="bp-card">
      <div class="bp-head"><b>${L("view")}</b><strong>${series}S × ${parallel}P</strong></div>
      <svg viewBox="0 0 ${width} ${height}" style="width:100%;max-height:330px" role="img" aria-label="Battery cell layout">
        <defs><linearGradient id="bpCell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#173a82"/>
        </linearGradient></defs>${cells}
      </svg>
      <p class="bp-muted">${L("shown")} ${shown} ${L("of")} ${total} ${L("total")}</p>
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
      <p>Design and calculate your battery pack.</p>

      <div class="bp-label">${L("chem")}</div>
      <div class="bp-chips">
        ${chem.map(([id,k]) =>
          `<button type="button"
            data-chem="${id}"
            class="${B.chemistry===id?'active':''}">
            ${L(k)}
          </button>`
        ).join("")}
      </div>

      <p class="bp-muted">${L("customHint")}</p>
    </div>

    <div class="bp-card">
      <h3>1. ${L("design")}</h3>
      <div class="fields two">
        ${fieldLocal("bpCellV",L("cellV"),B.cellV)}
        ${fieldLocal("bpCellAh",L("cellAh"),B.cellAh)}
        ${fieldLocal("bpFullV",L("fullV"),B.fullCellV)}
        ${fieldLocal("bpTargetV",L("targetV"),B.targetV)}
        ${fieldLocal("bpTargetAh",L("targetAh"),B.targetAh)}
      </div>
    </div>

    <div id="bpOut"></div>

    <div class="actions">
      <button class="save" id="save">${L("save")}</button>
    </div>

    <div class="note">${L("safety")}</div>

    <style>
      .bp-card {
        margin: 12px 0;
        padding: 16px;
        border-radius: 20px;
        background: var(--card, rgba(255,255,255,.75));
        border: 1px solid rgba(120,150,190,.23);
        box-shadow: 0 8px 24px rgba(30,60,100,.06);
      }

      .bp-card h2 {
        font-size: 21px;
        margin: 7px 0;
      }

      .bp-card h3 {
        font-size: 16px;
        margin: 0 0 12px;
      }

      .bp-card p {
        font-size: 13px;
        line-height: 1.55;
      }

      .bp-kicker, .bp-label {
        font-size: 12px;
        font-weight: 800;
        color: #3478e5;
      }

      .bp-muted { opacity: .72; }

      .bp-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 10px 0;
      }

      .bp-chips button {
        border: 1px solid rgba(80,120,180,.3);
        border-radius: 999px;
        padding: 9px 12px;
        background: transparent;
        color: inherit;
      }

      .bp-chips button.active {
        background: #2563eb;
        color: white;
        border-color: #2563eb;
      }

      .bp-head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 12px;
      }

      .bp-stats {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
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

      .bp-stat span {
        font-size: 12px;
        opacity: .75;
      }

      .bp-warning {
        padding: 12px;
        border-radius: 12px;
        background: rgba(245,158,11,.12);
        font-size: 13px;
        line-height: 1.5;
        margin-top: 12px;
      }
    </style>
  `;
},
,

    
update() {
  const map = {
    cellV: "bpCellV",
    cellAh: "bpCellAh",
    fullCellV: "bpFullV",
    targetV: "bpTargetV",
    targetAh: "bpTargetAh"
  };

  for (const [key, id] of Object.entries(map)) {
    B[key] = val(id, B[key]);
  }

  store.set(KEY, B);

  const out = get("bpOut");
  if (!out) return;

  const valid = [
    B.cellV,
    B.cellAh,
    B.fullCellV,
    B.targetV,
    B.targetAh
  ].every(Number.isFinite) &&
    B.cellV > 0 &&
    B.cellAh > 0 &&
    B.fullCellV >= B.cellV &&
    B.targetV > 0 &&
    B.targetAh > 0;

  if (!valid) {
    App.last = null;
    out.innerHTML =
      `<div class="bp-card">${L("inputError")}</div>`;
    return;
  }

  // Calculate series and parallel cell counts.
  const series = Math.max(
    1, Math.round(B.targetV / B.cellV)
  );

  const parallel = Math.max(
    1, Math.ceil(B.targetAh / B.cellAh)
  );

  const actualV = series * B.cellV;
  const fullV = series * B.fullCellV;
  const actualAh = parallel * B.cellAh;
  const cells = series * parallel;
  const wh = actualV * actualAh;
  const kwh = wh / 1000;

  const diff = Math.abs(actualV - B.targetV);
  const close = diff <= Math.max(0.5, B.targetV * 0.05);

  out.innerHTML = `
    <div class="bp-card">
      <h3>2. ${L("results")}</h3>

      <div class="bp-stats">
        <div class="bp-stat">
          <b>${safe(actualV)} V</b>
          <span>${L("nominal")}</span>
        </div>

        <div class="bp-stat">
          <b>${safe(fullV)} V</b>
          <span>${L("full")}</span>
        </div>

        <div class="bp-stat">
          <b>${series}S</b>
          <span>${L("series")}</span>
        </div>

        <div class="bp-stat">
          <b>${parallel}P</b>
          <span>${L("parallel")}</span>
        </div>

        <div class="bp-stat">
          <b>${cells}</b>
          <span>${L("cells")}</span>
        </div>

        <div class="bp-stat">
          <b>${safe(actualAh)} Ah</b>
          <span>${L("capacity")}</span>
        </div>

        <div class="bp-stat">
          <b>${safe(wh)} Wh</b>
          <span>Watt-hours</span>
        </div>

        <div class="bp-stat">
          <b>${safe(kwh)} kWh</b>
          <span>Kilowatt-hours</span>
        </div>
      </div>

      <div class="bp-warning">
        ${close ? L("voltageOK") : L("voltageWarn")}
      </div>
    </div>

    ${packDrawing(series, parallel)}
  `;

  App.last = {
    title: `Battery PRO · ${safe(actualV)}V · ${safe(actualAh)}Ah`,
    result: `${series}S${parallel}P · ${cells} cells · ${safe(wh)}Wh`
  };
},
    
