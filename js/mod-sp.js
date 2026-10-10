
"use strict";

(function () {
  const KEY = "em_battery_pack";

  const B = store.get(KEY, {
    cellV: 3.7,
    cellAh: 3,
    targetV: 12,
    targetAh: 60,
    fullCellV: 4.2,
    whKm: 30,
    usable: 85,
    efficiency: 90
  });

  const get = id => document.getElementById(id);

  const val = (id, fallback) => {
    const el = get(id);
    return el ? num(el.value) : fallback;
  };

  const safe = n => Number.isFinite(n) ? fmt(n, 2) : "—";

  function packDrawing(series, parallel) {
    const maxCells = 48;
    const total = series * parallel;
    const shown = Math.min(total, maxCells);

    const cols = Math.min(series, 8);
    const rows = Math.min(parallel, 6);
    const cellW = 31;
    const cellH = 45;
    const gapX = 10;
    const gapY = 9;
    const pad = 18;

    const shownCols = Math.min(cols, shown);
    const width = pad * 2 + shownCols * cellW +
      Math.max(0, shownCols - 1) * gapX;
    const height = pad * 2 + rows * cellH +
      Math.max(0, rows - 1) * gapY + 24;

    let cells = "";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < shownCols; c++) {
        const x = pad + c * (cellW + gapX);
        const y = pad + r * (cellH + gapY);
        const index = r * shownCols + c;
        if (index >= shown) continue;

        cells += `
          <g>
            <rect x="${x + 3}" y="${y + 4}"
              width="${cellW}" height="${cellH}"
              rx="7" fill="#07172c" opacity=".18"/>
            <rect x="${x}" y="${y + 5}"
              width="${cellW}" height="${cellH - 5}"
              rx="7" fill="url(#cellBody)"
              stroke="#78a9ff" stroke-opacity=".7"/>
            <rect x="${x + 10}" y="${y}"
              width="11" height="7" rx="2"
              fill="#cbd5e1" stroke="#64748b"/>
            <rect x="${x + 5}" y="${y + 12}"
              width="${cellW - 10}" height="3"
              rx="1.5" fill="#dbeafe" opacity=".8"/>
            <text x="${x + cellW / 2}" y="${y + 29}"
              text-anchor="middle" font-size="9"
              font-weight="700" fill="#ffffff">${index + 1}</text>
          </g>`;
      }
    }

    const label = total > shown
      ? `दाखवलेले ${shown} / एकूण ${total} सेल`
      : `एकूण ${total} सेल`;

    return `
      <div class="bp-visual">
        <div class="bp-visual-head">
          <span>3D PACK VIEW</span>
          <b>${series}S × ${parallel}P</b>
        </div>
        <svg viewBox="0 0 ${width} ${height}"
          role="img" aria-label="Battery pack cell layout"
          style="width:100%;max-height:330px;display:block">
          <defs>
            <linearGradient id="cellBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#60a5fa"/>
              <stop offset="48%" stop-color="#2563eb"/>
              <stop offset="100%" stop-color="#173a82"/>
            </linearGradient>
          </defs>
          <ellipse cx="${width / 2}" cy="${height - 10}"
            rx="${Math.max(20, width * .38)}" ry="8"
            fill="#0f172a" opacity=".12"/>
          ${cells}
        </svg>
        <div class="bp-visual-foot">${label}</div>
      </div>`;
  }

  registerModule({
    id: "battery",
    big: "battery",
    titleKey: "batteryPro",
    subKey: "batteryProS",

    render() {
      return `
        ${topBar("Battery PRO")}

        <div class="bp-intro">
          <div class="bp-kicker">BATTERY PACK DESIGNER</div>
          <h2>तुझा Battery Pack तयार कर</h2>
          <p>सेलचे आकडे भर — Series, Parallel, Capacity आणि Range आपोआप काढ.</p>
        </div>

        <div class="bp-section">
          <h3>1. Cell Details</h3>
          <div class="fields two">
            ${field("bpCellV", "एका सेलचा Nominal Voltage (V)", B.cellV)}
            ${field("bpCellAh", "एका सेलची Capacity (Ah)", B.cellAh)}
          </div>
          <div class="fields two" style="padding-top:8px">
            ${field("bpFullV", "एका सेलचा Full Charge V", B.fullCellV)}
            ${field("bpTargetV", "हवे असलेले Pack Voltage (V)", B.targetV)}
          </div>
          <div class="fields two" style="padding-top:8px">
            ${field("bpTargetAh", "हवी असलेली Capacity (Ah)", B.targetAh)}
          </div>
        </div>

        <div class="bp-section">
          <h3>2. Vehicle Range Estimate</h3>
          <div class="fields two">
            ${field("bpWhKm", "Consumption (Wh/km)", B.whKm)}
            ${field("bpUsable", "Usable Energy (%)", B.usable)}
          </div>
          <div class="fields two" style="padding-top:8px">
            ${field("bpEff", "System Efficiency (%)", B.efficiency)}
          </div>
          <p class="bp-help">
            Wh/km मध्ये वाहनाचा प्रत्यक्ष वापर भर. उदाहरणार्थ 30 Wh/km
            ही फक्त सुरुवातीची अंदाजे value आहे; वाहनानुसार बदल.
          </p>
        </div>

        <div id="bpOut"></div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>

        <div class="note">
          सुरक्षा: योग्य BMS, cell balancing, compatible charger, योग्य
          current rating आणि fuse आवश्यक आहेत. Pack जोडण्यापूर्वी
          उपकरणाची voltage मर्यादा तपास.
        </div>

        <style>
          .bp-intro,.bp-section,.bp-visual,.bp-result{
            margin:12px 0;padding:16px;border-radius:20px;
            background:var(--card,rgba(255,255,255,.7));
            border:1px solid rgba(120,150,190,.22);
            box-shadow:0 8px 24px rgba(30,60,100,.06)
          }
          .bp-kicker{font-size:11px;letter-spacing:1.8px;
            font-weight:800;color:#3478e5}
          .bp-intro h2{font-size:21px;margin:7px 0}
          .bp-intro p,.bp-help{font-size:13px;line-height:1.5;opacity:.78}
          .bp-section h3{font-size:16px;margin:0 0 13px}
          .bp-visual-head,.bp-visual-foot{
            display:flex;justify-content:space-between;gap:8px;
            font-size:12px;align-items:center
          }
          .bp-visual-head{margin-bottom:12px}
          .bp-visual-head span{letter-spacing:1px;font-weight:800;
            color:#3478e5}
          .bp-visual-foot{justify-content:center;opacity:.75}
          .bp-result .bp-label{font-size:12px;opacity:.75}
          .bp-result .bp-value{font-size:25px;font-weight:800;
            overflow-wrap:anywhere}
          .bp-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px;margin-top:12px}
          .bp-stat{padding:12px;border-radius:14px;
            background:rgba(90,130,190,.09);min-width:0}
          .bp-stat b{display:block;font-size:18px;overflow-wrap:anywhere}
          .bp-stat span{font-size:12px;opacity:.75}
          .bp-warning{margin-top:12px;padding:12px;border-radius:12px;
            background:rgba(245,158,11,.12);font-size:13px;line-height:1.5}
          .bp-good{margin-top:12px;font-size:13px;line-height:1.5}
        </style>`;
    },

    update() {
      const fields = {
        cellV: "bpCellV",
        cellAh: "bpCellAh",
        fullCellV: "bpFullV",
        targetV: "bpTargetV",
        targetAh: "bpTargetAh",
        whKm: "bpWhKm",
        usable: "bpUsable",
        efficiency: "bpEff"
      };

      for (const [key, id] of Object.entries(fields)) {
        B[key] = val(id, B[key]);
      }

      store.set(KEY, B);

      const out = get("bpOut");
      if (!out) return;

      const inputs = [
        B.cellV, B.cellAh, B.fullCellV, B.targetV,
        B.targetAh, B.whKm, B.usable, B.efficiency
      ];

      if (!inputs.every(Number.isFinite) ||
          B.cellV <= 0 || B.cellAh <= 0 ||
          B.fullCellV <= 0 || B.targetV <= 0 ||
          B.targetAh <= 0 || B.whKm <= 0 ||
          B.usable <= 0 || B.usable > 100 ||
          B.efficiency <= 0 || B.efficiency > 100 ||
          B.fullCellV < B.cellV) {
        App.last = null;
        out.innerHTML = `
          <div class="bp-result">
            <b>कृपया योग्य values भर.</b>
            <p class="bp-help">सर्व values शून्यापेक्षा जास्त हव्यात.
            Usable Energy आणि Efficiency 100% पेक्षा जास्त नसावेत.</p>
          </div>`;
        return;
      }

      // Nearest whole-number series count for the requested nominal voltage.
      const series = Math.max(1, Math.round(B.targetV / B.cellV));
      // Round parallel upward so actual capacity meets/exceeds the target.
      const parallel = Math.max(1, Math.ceil(B.targetAh / B.cellAh));

      const actualV = series * B.cellV;
      const fullV = series * B.fullCellV;
      const actualAh = parallel * B.cellAh;
      const cells = series * parallel;
      const wh = actualV * actualAh;
      const kwh = wh / 1000;
      const usableWh = wh * (B.usable / 100) * (B.efficiency / 100);
      const rangeKm = usableWh / B.whKm;
      const voltageDiff = Math.abs(actualV - B.targetV);
      const closeEnough = voltageDiff <= Math.max(0.5, B.targetV * 0.05);

      const warning = !closeEnough
        ? `तुझं लक्ष्य ${safe(B.targetV)}V आहे; जवळचा पूर्ण Series पर्याय ${series}S = ${safe(actualV)}V nominal आहे. हा फरक लक्षात घे.`
        : `Nominal voltage लक्ष्याजवळ आहे: ${safe(actualV)}V. उपकरणाची voltage मर्यादा तपास.`;

      const chargeNote =
        `Full-charge voltage अंदाजे ${safe(fullV)}V आहे ` +
        `(${safe(B.fullCellV)}V प्रति सेल गृहीत).`;

      out.innerHTML = `
        ${packDrawing(series, parallel)}

        <div class="bp-result">
          <div class="bp-label">Estimated Vehicle Range</div>
          <div class="bp-value">${safe(rangeKm)} km</div>
          <p class="bp-help">
            वापरण्यायोग्य ऊर्जा ${safe(usableWh)} Wh ÷
            ${safe(B.whKm)} Wh/km.
            प्रत्यक्ष रेंज वाहन, वेग, भार, रस्ता आणि तापमानानुसार बदलते.
          </p>
        </div>

        <div class="bp-result">
          <div class="bp-label">Pack Nominal Voltage</div>
          <div class="bp-value">${safe(actualV)} V</div>

          <div class="bp-stats">
            <div class="bp-stat">
              <b>${series}S</b><span>Series</span>
            </div>
            <div class="bp-stat">
              <b>${parallel}P</b><span>Parallel</span>
            </div>
            <div class="bp-stat">
              <b>${cells}</b><span>Total Cells</span>
            </div>
            <div class="bp-stat">
              <b>${safe(actualAh)} Ah</b><span>Actual Capacity</span>
            </div>
            <div class="bp-stat">
              <b>${safe(wh)} Wh</b><span>Pack Energy</span>
            </div>
            <div class="bp-stat">
              <b>${safe(kwh)} kWh</b><span>Pack Energy</span>
            </div>
          </div>

          <div class="bp-warning">${warning}</div>
          <div class="bp-good">${chargeNote}</div>
        </div>`;

      App.last = {
        title: `Battery PRO · ${safe(actualV)}V · ${safe(actualAh)}Ah`,
        result: `${series}S${parallel}P · ${cells} cells · ${safe(wh)}Wh · ${safe(rangeKm)}km estimated`
      };
    },

    click(el) {
      if (el.id === "save") {
        if (!App.last) {
          toast("आधी योग्य values भर");
          return true;
        }
        App.hist.unshift({
          ...App.last,
          date: new Date().toLocaleString()
        });
        App.hist = App.hist.slice(0, 50);
        store.set("em_hist", App.hist);
        toast(t("saved") || "Saved");
        return true;
      }
      return false;
    }
  });
})();
