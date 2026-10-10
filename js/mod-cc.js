"use strict";

(function () {
  const ORDER = [
    "black", "brown", "red", "orange", "yellow",
    "green", "blue", "violet", "grey", "white",
    "gold", "silver", "none"
  ];

  const HEX = {
    black: "#111111",
    brown: "#7B4A1E",
    red: "#D32F2F",
    orange: "#F57C00",
    yellow: "#FBC02D",
    green: "#2E9E5B",
    blue: "#1456D9",
    violet: "#7B1FA2",
    grey: "#8A8F98",
    white: "#FFFFFF",
    gold: "#C9A227",
    silver: "#BFC5CC",
    none: "#FFFFFF"
  };

  const DARK = [
    "black", "brown", "red", "green",
    "blue", "violet", "grey"
  ];

  const UNITS = [
    ["Ω", 1],
    ["kΩ", 1e3],
    ["MΩ", 1e6]
  ];

  const OUT = [
    ["Ω", 1],
    ["kΩ", 1e3],
    ["MΩ", 1e6],
    ["GΩ", 1e9]
  ];

  const DEF_BANDS = {
    4: ["yellow", "violet", "red", "gold"],
    5: ["yellow", "violet", "black", "brown", "brown"],
    6: [
      "yellow", "violet", "black",
      "brown", "brown", "brown"
    ]
  };

  const tols = n =>
    n === 4
      ? [1, 2, 5, 10, 20]
      : [0.1, 0.25, 0.5, 1, 2, 5, 10];

  const PPMS = [5, 10, 15, 25, 50, 100, 250];

  const DEF = () => ({
    mode: "decode",
    n: 4,
    bands: {
      4: DEF_BANDS[4].slice(),
      5: DEF_BANDS[5].slice(),
      6: DEF_BANDS[6].slice()
    },
    active: 0,
    val: "4.7",
    u: "kΩ",
    tol: 5,
    ppm: 100
  });

  function validBands(n, bands) {
    if (
      typeof RC_ROLES === "undefined" ||
      !RC_ROLES[n] ||
      !Array.isArray(bands) ||
      bands.length !== n
    ) return false;

    return bands.every(c => ORDER.includes(c));
  }

  let C;

  try {
    C = store.get("em_c", null);
  } catch (_) {
    C = null;
  }

  if (
    !C ||
    !C.bands ||
    ![4, 5, 6].every(n => validBands(n, C.bands[n]))
  ) {
    C = DEF();
  } else {
    C = Object.assign(DEF(), C);
  }

  if (!["decode", "encode"].includes(C.mode)) {
    C.mode = "decode";
  }

  if (![4, 5, 6].includes(C.n)) {
    C.n = 4;
  }

  if (
    !Number.isInteger(C.active) ||
    C.active < 0 ||
    C.active >= C.n
  ) {
    C.active = 0;
  }

  if (!tols(C.n).includes(Number(C.tol))) {
    C.tol = C.n === 4 ? 5 : 1;
  }

  if (!PPMS.includes(Number(C.ppm))) {
    C.ppm = 100;
  }

  if (!UNITS.some(a => a[0] === C.u)) {
    C.u = "Ω";
  }

  function saveState() {
    try {
      store.set("em_c", C);
    } catch (err) {
      console.error("Resistor state save failed:", err);
    }
  }

  function allowed(role, idx) {
    return ORDER.filter(c => {
      const x = RC[c];

      if (role === "d") {
        return x.d !== undefined &&
          !(idx === 0 && c === "black");
      }

      if (role === "m") {
        return x.m !== undefined;
      }

      if (role === "t") {
        return x.t !== undefined &&
          !(c === "none" && C.n !== 4);
      }

      return x.p !== undefined;
    });
  }

  function hint(role, c) {
    const x = RC[c];

    if (role === "d") return String(x.d);
    if (role === "m") return "×" + x.m;
    if (role === "t") return "±" + x.t + "%";

    return x.p + " ppm";
  }

  function resistorSVG(bands) {
    const n = bands.length;

    const positions = {
      4: [72, 100, 128, 200],
      5: [72, 100, 128, 156, 205],
      6: [64, 90, 116, 142, 190, 222]
    }[n];

    const rects = bands.map((c, i) => {
      if (c === "none") return "";

      return `
        <rect
          x="${positions[i]}"
          y="15"
          width="14"
          height="50"
          fill="${HEX[c]}"
          stroke="#00000055"
          stroke-width=".6"
        />
      `;
    }).join("");

    return `
      <svg
        viewBox="0 0 300 80"
        width="100%"
        style="max-width:360px"
        role="img"
        aria-label="Resistor colour bands"
      >
        <line
          x1="5" y1="40"
          x2="295" y2="40"
          stroke="#8A8F98"
          stroke-width="5"
        />

        <rect
          x="45" y="12"
          width="210" height="56"
          rx="18"
          fill="#E9D8B4"
          stroke="#B89E64"
        />

        ${rects}
      </svg>
    `;
  }

  function formatResistance(value) {
    if (!Number.isFinite(value)) return "—";

    let unit = OUT[0];

    OUT.forEach(item => {
      if (value / item[1] >= 1) {
        unit = item;
      }
    });

    const scaled = value / unit[1];

    return `${Number(scaled.toPrecision(4))} ${unit[0]}`;
  }

  function chip(action, value, label, active) {
    return `
      <button
        type="button"
        data-act="${action}:${value}"
        class="${active ? "primary" : ""}"
        style="
          min-height:42px;
          padding:8px 14px;
          border-radius:22px;
          border:1px solid var(--border);
          font-weight:600;
          cursor:pointer;
        "
      >
        ${label}
      </button>
    `;
  }

  function renderControls() {
    const modeButtons = `
      <div class="chips">
        ${chip(
          "mode", "decode",
          t("cdec"),
          C.mode === "decode"
        )}

        ${chip(
          "mode", "encode",
          t("cenc"),
          C.mode === "encode"
        )}
      </div>
    `;

    const bandButtons = `
      <div class="chips">
        ${[4, 5, 6].map(n =>
          chip(
            "bands", n,
            `${n} ${t("cband")}`,
            C.n === n
          )
        ).join("")}
      </div>
    `;

    if (C.mode === "decode") {
      const roles = RC_ROLES[C.n];
      const bands = C.bands[C.n];

      const selectors = `
        <div class="chips">
          ${bands.map((colour, i) => `
            <button
              type="button"
              data-act="selectband:${i}"
              style="
                min-width:52px;
                min-height:48px;
                border-radius:12px;
                font-weight:800;
                background:${HEX[colour]};
                color:${DARK.includes(colour) ? "#fff" : "#000"};
                border:${
                  i === C.active
                    ? "4px solid var(--primary)"
                    : "1px solid var(--border)"
                };
              "
            >
              B${i + 1}
            </button>
          `).join("")}
        </div>
      `;

      const role = roles[C.active];

      const colours = `
        <div class="chips">
          ${allowed(role, C.active).map(colour => `
            <button
              type="button"
              data-act="colour:${colour}"
              style="
                display:flex;
                flex-direction:column;
                align-items:center;
                gap:5px;
                min-width:76px;
                padding:8px 6px;
                border-radius:14px;
                border:1px solid var(--border);
                background:#fff;
                color:#222;
              "
            >
              <span style="
                width:34px;
                height:34px;
                border-radius:50%;
                background:${HEX[colour]};
                border:1px solid #999;
              "></span>

              <span>${t("c_" + colour)}</span>

              <span style="font-size:12px;color:#777">
                ${hint(role, colour)}
              </span>
            </button>
          `).join("")}
        </div>
      `;

      return `
        ${modeButtons}
        ${bandButtons}

        <div class="lab">${t("chint")}</div>

        ${selectors}
        ${colours}
      `;
    }

    const valueInput = `
      <div class="fields" style="grid-template-columns:1fr">
        <div class="f">
          <label for="cc-value">${t("ccval")}</label>

          <div style="display:flex;gap:6px">
            <input
              id="cc-value"
              inputmode="decimal"
              value="${escapeHTML(C.val)}"
              style="flex:1;min-width:0"
            />

            <select id="cc-unit">
              ${UNITS.map(([unit]) => `
                <option
                  value="${unit}"
                  ${C.u === unit ? "selected" : ""}
                >
                  ${unit}
                </option>
              `).join("")}
            </select>
          </div>
        </div>
      </div>
    `;

    const toleranceButtons = `
      <div class="lab">${t("ctol")}</div>

      <div class="chips">
        ${tols(C.n).map(value =>
          chip(
            "tolerance", value,
            `±${value}%`,
            Number(C.tol) === value
          )
        ).join("")}
      </div>
    `;

    const ppmButtons = C.n === 6 ? `
      <div class="lab">${t("cppm")}</div>

      <div class="chips">
        ${PPMS.map(value =>
          chip(
            "ppm", value,
            String(value),
            Number(C.ppm) === value
          )
        ).join("")}
      </div>
    ` : "";

    return `
      ${modeButtons}
      ${bandButtons}
      ${valueInput}
      ${toleranceButtons}
      ${ppmButtons}
    `;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  function updateResult() {
    const output = document.getElementById("out");

    if (!output) return;

    saveState();

    if (C.mode === "decode") {
      const bands = C.bands[C.n];
      const result = rcDecode(C.n, bands);

      if (!result) {
        App.last = null;

        output.innerHTML = `
          <div class="res bad">
            <div class="d">${t("cbad")}</div>
          </div>
        `;

        return;
      }

      const low = result.ohms * (1 - result.tol / 100);
      const high = result.ohms * (1 + result.tol / 100);

      const detail = `
        ±${result.tol}%
        · ${formatResistance(low)}
        – ${formatResistance(high)}
        ${
          result.ppm !== null
            ? `· ${result.ppm} ppm/°C`
            : ""
        }
      `;

      const names = bands
        .map(colour => t("c_" + colour))
        .join(" · ");

      App.last = {
        title: `${t("cc")} · ${names}`,
        result: `${formatResistance(result.ohms)} ±${result.tol}%`
      };

      output.innerHTML = `
        <div class="meter" style="text-align:center">
          ${resistorSVG(bands)}
        </div>

        <div class="res">
          <div class="l">${t("cres")}</div>
          <div class="n">${formatResistance(result.ohms)}</div>
          <div class="d">${detail}</div>
        </div>

        <div class="note">${t("cnote")}</div>
      `;

      return;
    }

    const input = document.getElementById("cc-value");
    const unitSelect = document.getElementById("cc-unit");

    if (input) C.val = input.value;
    if (unitSelect) C.u = unitSelect.value;

    const unit = UNITS.find(item => item[0] === C.u);

    const value = Number(C.val) * (unit ? unit[1] : 1);

    if (!(value > 0) || !Number.isFinite(value)) {
      App.last = null;
      output.innerHTML = `<div class="note">${t("cvh")}</div>`;
      return;
    }

    const result = rcEncode(value, C.n, Number(C.tol), Number(C.ppm));

    if (!result) {
      App.last = null;

      output.innerHTML = `
        <div class="res bad">
          <div class="d">${t("cbad")}</div>
        </div>
      `;

      return;
    }

    const names = result.bands.map(colour => t("c_" + colour));

    App.last = {
      title: `${t("cc")} · ${C.val} ${C.u}`,
      result: names.join(" · ")
    };

    output.innerHTML = `
      <div class="meter" style="text-align:center">
        ${resistorSVG(result.bands)}
      </div>

      <div class="res">
        <div class="l">${t("cbandsT")}</div>

        <div class="n" style="font-size:22px;line-height:1.6">
          ${names.map((name, i) =>
            `${i + 1}. ${name}`
          ).join("<br>")}
        </div>

        <div class="d">
          ${formatResistance(result.actual)}
          ±${C.tol}%
          ${C.n === 6 ? `· ${C.ppm} ppm/°C` : ""}
        </div>
      </div>

      ${
        result.exact
          ? ""
          : `<div class="note">${t("cnear")}: ${formatResistance(result.actual)}</div>`
      }

      <div class="note">${t("cnote")}</div>
    `;
  }

  registerModule({
    id: "cc",
    titleKey: "cc",
    subKey: "ccS",

    render() {
      return `
        ${topBar(t("cc"))}
        <div id="out"></div>
        <div id="ccctl">${renderControls()}</div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>
      `;
    },

    update() {
      updateResult();
    },

    click(element) {
      const action = element.dataset.act;

      if (!action) return false;

      const separator = action.indexOf(":");
      const type = action.slice(0, separator);
      const value = action.slice(separator + 1);

      if (type === "mode") {
        C.mode = value;
      } else if (type === "bands") {
        C.n = Number(value);
        C.active = 0;

        if (!tols(C.n).includes(Number(C.tol))) {
          C.tol = C.n === 4 ? 5 : 1;
        }
      } else if (type === "selectband") {
        C.active = Number(value);
      } else if (type === "colour") {
        C.bands[C.n][C.active] = value;

        if (C.active < C.n - 1) {
          C.active++;
        }
      } else if (type === "tolerance") {
        C.tol = Number(value);
      } else if (type === "ppm") {
        C.ppm = Number(value);
      } else {
        return false;
      }

      const controls = document.getElementById("ccctl");

      if (controls) {
        controls.innerHTML = renderControls();
      }

      updateResult();

      return true;
    }
  });

  document.addEventListener("change", event => {
    if (
      typeof App !== "undefined" &&
      App.view === "cc" &&
      ["cc-value", "cc-unit"].includes(event.target.id)
    ) {
      updateResult();
    }
  });
})();
