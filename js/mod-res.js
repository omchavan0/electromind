
"use strict";

(function () {
  const COLORS = [
    {name:"Black",mr:"काळा",hi:"काला",hex:"#242424",digit:0,mult:1,ppm:250},
    {name:"Brown",mr:"तपकिरी",hi:"भूरा",hex:"#795548",digit:1,mult:10,tol:1,ppm:100},
    {name:"Red",mr:"लाल",hi:"लाल",hex:"#E53935",digit:2,mult:100,tol:2,ppm:50},
    {name:"Orange",mr:"नारंगी",hi:"नारंगी",hex:"#FB8C00",digit:3,mult:1000,ppm:15},
    {name:"Yellow",mr:"पिवळा",hi:"पीला",hex:"#FDD835",digit:4,mult:10000,ppm:25},
    {name:"Green",mr:"हिरवा",hi:"हरा",hex:"#43A047",digit:5,mult:100000,tol:0.5,ppm:20},
    {name:"Blue",mr:"निळा",hi:"नीला",hex:"#1E88E5",digit:6,mult:1e6,tol:0.25,ppm:10},
    {name:"Violet",mr:"जांभळा",hi:"बैंगनी",hex:"#8E24AA",digit:7,mult:1e7,tol:0.1,ppm:5},
    {name:"Grey",mr:"राखाडी",hi:"धूसर",hex:"#9E9E9E",digit:8,mult:1e8,tol:0.05,ppm:1},
    {name:"White",mr:"पांढरा",hi:"सफेद",hex:"#F5F5F5",digit:9,mult:1e9},
    {name:"Gold",mr:"सोनेरी",hi:"सुनहरा",hex:"#D4AF37",mult:0.1,tol:5},
    {name:"Silver",mr:"चंदेरी",hi:"चाँदी",hex:"#B7C2CB",mult:0.01,tol:10},
    {name:"None",mr:"नसलेला",hi:"नहीं",hex:"#FFFFFF",tol:20}
  ];

  const COUNTS = [4,5,6];
  const KEY = "em_res";

  const DEFAULT = {
    bands: 4,
    colors: ["Brown","Black","Red","Gold","Brown","Brown"],
    value: "1",
    unit: "kΩ"
  };

  const UNITS = [
    {name:"Ω",factor:1},
    {name:"kΩ",factor:1e3},
    {name:"MΩ",factor:1e6}
  ];

  let S = store.get(KEY,null);

  if (!S || !COUNTS.includes(S.bands) || !Array.isArray(S.colors)) {
    S = {...DEFAULT,colors:[...DEFAULT.colors]};
  }

  S.colors = [...S.colors];
  while (S.colors.length < 6) S.colors.push("Brown");
  S.value = S.value ?? DEFAULT.value;
  S.unit = UNITS.some(u=>u.name===S.unit) ? S.unit : DEFAULT.unit;

  const txt = (mr,hi,en) =>
    App.lang==="mr" ? mr : App.lang==="hi" ? hi : en;

  const cget = name => COLORS.find(c=>c.name===name) || COLORS[0];

  const tr = c =>
    App.lang==="mr" ? c.mr :
    App.lang==="hi" ? c.hi : c.name;

  const esc = s => String(s).replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  const fmt = n => {
    if (!Number.isFinite(n)) return "—";
    return String(Number(n.toPrecision(4)));
  };

  function formatR(n) {
    if (!Number.isFinite(n) || n < 0) return "—";
    if (n >= 1e6) return `${fmt(n/1e6)} MΩ`;
    if (n >= 1e3) return `${fmt(n/1e3)} kΩ`;
    return `${fmt(n)} Ω`;
  }

  function saveState() {
    store.set(KEY,S);
  }

  function bandRole(i) {
    if (S.bands === 4) {
      return ["digit","digit","mult","tol"][i];
    }
    if (S.bands === 5) {
      return ["digit","digit","digit","mult","tol"][i];
    }
    return ["digit","digit","digit","mult","tol","ppm"][i];
  }

  function allowed(i) {
    const role = bandRole(i);

    if (role === "digit") {
      return COLORS.filter(c=>c.digit !== undefined);
    }

    if (role === "mult") {
      return COLORS.filter(c=>c.mult !== undefined);
    }

    if (role === "tol") {
      return COLORS.filter(c=>c.tol !== undefined);
    }

    return COLORS.filter(c=>c.ppm !== undefined);
  }

  function fixColors() {
    S.colors = Array.isArray(S.colors) ? S.colors : [...DEFAULT.colors];

    while (S.colors.length < 6) S.colors.push("Brown");
    S.colors = S.colors.slice(0,6);

    for (let i=0;i<S.bands;i++) {
      if (!allowed(i).some(c=>c.name===S.colors[i])) {
        S.colors[i] =
          bandRole(i)==="tol" ? "Gold" :
          bandRole(i)==="ppm" ? "Brown" : "Brown";
      }
    }
  }

  function calculate() {
    fixColors();

    const count = S.bands === 4 ? 2 : 3;
    const digits = S.colors.slice(0,count).map(n=>cget(n).digit);

    if (digits.some(v=>v===undefined)) return null;

    const multiplier = cget(S.colors[count]).mult;
    const tolerance = cget(S.colors[count+1]).tol;
    const ppm = S.bands===6 ? cget(S.colors[5]).ppm : null;

    if (multiplier===undefined || !Number.isFinite(multiplier)) {
      return null;
    }

    return {
      ohms: Number(digits.join(""))*multiplier,
      tol: tolerance===undefined ? null : tolerance,
      ppm: ppm===undefined ? null : ppm
    };
  }

  function encodeValue(ohms) {
    if (!Number.isFinite(ohms) || ohms<=0) return false;

    const count = S.bands===4 ? 2 : 3;
    const minSig = Math.pow(10,count-1);
    const maxSig = Math.pow(10,count)-1;
    let best = null;

    for (let exp=-2;exp<=9;exp++) {
      const multiplier = Math.pow(10,exp);
      const sig = Math.round(ohms/multiplier);

      if (sig<minSig || sig>maxSig) continue;

      const error = Math.abs(sig*multiplier-ohms)/ohms;

      if (!best || error<best.error) {
        best = {sig,exp,error};
      }
    }

    if (!best) return false;

    const digits = String(best.sig).padStart(count,"0");

    for (let i=0;i<count;i++) {
      const c = COLORS.find(x=>x.digit===Number(digits[i]));
      if (!c) return false;
      S.colors[i] = c.name;
    }

    const mult = COLORS.find(c=>c.mult===Math.pow(10,best.exp));
    if (!mult) return false;

    S.colors[count] = mult.name;

    if (!allowed(count+1).some(c=>c.name===S.colors[count+1])) {
      S.colors[count+1] = "Gold";
    }

    if (S.bands===6 &&
        !allowed(5).some(c=>c.name===S.colors[5])) {
      S.colors[5] = "Brown";
    }

    fixColors();
    return true;
  }

  function svgBand(i) {
    const positions =
      S.bands===4 ? [148,174,200,230] :
      S.bands===5 ? [140,160,180,207,235] :
                    [132,152,172,194,220,244];

    const x = positions[i];
    const c = cget(S.colors[i]);
    const width = (bandRole(i)==="tol" || bandRole(i)==="ppm") ? 9 : 10;

    return `
      <g>
        <rect x="${x}" y="37" width="${width}" height="48" rx="2"
          fill="${c.hex}" stroke="#000" stroke-opacity=".35" stroke-width="1"/>
        <rect x="${x+1}" y="39" width="2" height="43" rx="1"
          fill="#fff" opacity=".3"/>
      </g>`;
  }

  function resistorSVG() {
    const bands = Array.from({length:S.bands},(_,i)=>svgBand(i)).join("");

    return `
    <svg class="resistor-svg" viewBox="0 0 360 125"
      role="img" aria-label="3D resistor with selected colour bands">
      <defs>
        <linearGradient id="resBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#F9E7C7"/>
          <stop offset=".2" stop-color="#E8C99B"/>
          <stop offset=".48" stop-color="#D4A875"/>
          <stop offset=".78" stop-color="#C18E59"/>
          <stop offset="1" stop-color="#8D6038"/>
        </linearGradient>

        <linearGradient id="resShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
          <stop offset=".35" stop-color="#fff" stop-opacity=".08"/>
          <stop offset=".75" stop-color="#fff" stop-opacity=".25"/>
          <stop offset="1" stop-color="#68431F" stop-opacity=".2"/>
        </linearGradient>

        <linearGradient id="resMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#AEB8C2"/>
          <stop offset=".22" stop-color="#687580"/>
          <stop offset=".48" stop-color="#DCE3E9"/>
          <stop offset=".68" stop-color="#89949E"/>
          <stop offset="1" stop-color="#515B65"/>
        </linearGradient>

        <filter id="resShadow" x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="4"/>
        </filter>

        <clipPath id="resClip">
          <rect x="88" y="34" width="184" height="54" rx="19"/>
        </clipPath>
      </defs>

      <ellipse cx="180" cy="103" rx="95" ry="7"
        fill="#63758B" opacity=".22" filter="url(#resShadow)"/>

      <!-- Metallic wires at both ends -->
      <path d="M12 61 H104 M256 61 H348"
        stroke="url(#resMetal)" stroke-width="6" stroke-linecap="round"/>
      <path d="M12 59 H104 M256 59 H348"
        stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>

      <!-- Resistor body -->
      <rect x="88" y="34" width="184" height="54" rx="19"
        fill="url(#resBody)" stroke="#9B754C" stroke-width="1.2"/>

      <g clip-path="url(#resClip)">
        ${bands}
        <rect x="88" y="34" width="184" height="54"
          fill="url(#resShine)"/>
        <path d="M99 43 Q105 35 117 36 H244"
          fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="2"/>
      </g>

      <ellipse cx="91" cy="61" rx="4" ry="22"
        fill="#A8794C" opacity=".45"/>
      <ellipse cx="269" cy="61" rx="4" ry="22"
        fill="#80532F" opacity=".35"/>
    </svg>`;
  }

  function renderValueInput() {
    return `
      <div class="res-value-box">
        <label for="resValue">
          ${txt("रेझिस्टन्सची किंमत","प्रतिरोध का मान","Resistance value")}
        </label>

        <div class="res-value-row">
          <input id="resValue" type="number" min="0" step="any"
            inputmode="decimal" value="${esc(S.value)}" placeholder="उदा. 2.2">

          <select id="resUnit" aria-label="Resistance unit">
            ${UNITS.map(u=>`
              <option value="${u.name}" ${S.unit===u.name?"selected":""}>
                ${u.name}
              </option>`).join("")}
          </select>
        </div>

        <div class="res-small">
          ${txt(
            "किंमत टाकल्यावर रंग आपोआप बदलतील.",
            "मान भरने पर रंग अपने-आप बदलेंगे।",
            "Enter a value to update the resistor colours."
          )}
        </div>
      </div>`;
  }

  function renderBands() {
    return Array.from({length:S.bands},(_,i)=>{
      const c = cget(S.colors[i]);
      const role = bandRole(i);

      const roleLabel = role==="digit"
        ? txt("अंक","अंक","Digit")
        : role==="mult"
        ? txt("मल्टिप्लायर","मल्टीप्लायर","Multiplier")
        : role==="tol"
        ? txt("टॉलरन्स","टॉलरेंस","Tolerance")
        : txt("तापमान गुणांक","तापमान गुणांक","Temp. coefficient");

      return `
        <div class="f">
          <label for="res${i}">
            ${txt("बँड","बैंड","Band")} ${i+1} · ${roleLabel}
          </label>

          <div class="res-color-row">
            <span class="res-swatch"
              style="background:${c.hex};${c.name==="White"||c.name==="None"?"border:1px solid #aaa;":""}">
            </span>

            <select id="res${i}" data-resband="${i}">
              ${allowed(i).map(x=>`
                <option value="${x.name}" ${x.name===S.colors[i]?"selected":""}>
                  ${tr(x)}
                </option>`).join("")}
            </select>
          </div>
        </div>`;
    }).join("");
  }

  function updateVisual() {
    const host = $("#resistorVisual");
    if (host) host.innerHTML = resistorSVG();

    for (let i=0;i<S.bands;i++) {
      const sel = $(`#res${i}`);
      if (!sel) continue;

      if (sel.value!==S.colors[i]) sel.value=S.colors[i];

      const sw = sel.parentElement.querySelector(".res-swatch");
      if (sw) {
        const c = cget(S.colors[i]);
        sw.style.background = c.hex;
        sw.style.border = c.name==="White" || c.name==="None"
          ? "1px solid #aaa"
          : "1px solid #00000018";
      }
    }
  }

  function updateResult() {
    const out = $("#resout");
    if (!out) return;

    const r = calculate();

    if (!r || !Number.isFinite(r.ohms)) {
      App.last = null;
      out.innerHTML = `<div class="res bad">
        ${txt("रंग तपासा","रंग जाँचें","Check the bands")}
      </div>`;
      return;
    }

    const tolText = r.tol===null ? "—" : `±${r.tol}%`;
    const ppmText = r.ppm===null ? "" : `
      <div class="d">
        ${txt("तापमान गुणांक","तापमान गुणांक","Temperature coefficient")}:
        ${r.ppm} ppm/°C
      </div>`;

    const title = txt("रेझिस्टर कलर कोड","रेज़िस्टर कलर कोड","Resistor colour code");
    const resultText = `${formatR(r.ohms)} · ${tolText}${r.ppm===null?"":` · ${r.ppm} ppm/°C`}`;

    App.last = {title,result:resultText};

    out.innerHTML = `
      <div class="res">
        <div class="l">${txt("रेझिस्टन्स","प्रतिरोध","Resistance")}</div>
        <div class="n">${formatR(r.ohms)}</div>
        <div class="d">Tolerance: ${tolText}</div>
        ${ppmText}
      </div>`;
  }

  function update() {
    fixColors();
    updateVisual();
    updateResult();
    saveState();
  }

  function applyValue() {
    const input = $("#resValue");
    const unit = $("#resUnit");
    if (!input || !unit) return;

    const v = Number(input.value);
    const u = UNITS.find(x=>x.name===unit.value);

    if (!input.value.trim() || !Number.isFinite(v) || v<=0 || !u) {
      return;
    }

    const ohms = v*u.factor;

    if (encodeValue(ohms)) {
      S.value = input.value;
      S.unit = unit.value;
      update();
    }
  }

  function syncValueFromColors() {
    const r = calculate();
    const input = $("#resValue");
    const unit = $("#resUnit");
    if (!r || !input || !unit) return;

    let u = UNITS[0];
    if (r.ohms>=1e6) u=UNITS[2];
    else if (r.ohms>=1e3) u=UNITS[1];

    S.value = String(Number((r.ohms/u.factor).toPrecision(5)));
    S.unit = u.name;

    input.value = S.value;
    unit.value = S.unit;
  }

  registerModule({
    id: "res",
    titleKey: "res",
    subKey: "resS",

    render() {
      fixColors();

      return `
        ${topBar(txt("रेझिस्टर","रेज़िस्टर","Resistor"))}

        <div class="chips">
          ${COUNTS.map(n=>chip(
            "data-resbands",
            String(n),
            `${n} ${txt("बँड","बैंड","Band")}`,
            S.bands===n
          )).join("")}
        </div>

        <div class="resistor-stage">
          <div id="resistorVisual">${resistorSVG()}</div>
        </div>

        ${renderValueInput()}

        <div id="resout"></div>

        <div class="fields" style="grid-template-columns:1fr;gap:8px">
          ${renderBands()}
        </div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>

        <div class="note">
          ${txt(
            "Value टाका किंवा रंग निवडा. चित्र आणि निकाल आपोआप बदलतील.",
            "मान भरें या रंग चुनें। चित्र और नतीजा अपने-आप बदलेंगे।",
            "Enter a value or choose colours. The image and result update automatically."
          )}
        </div>`;
    },

    update() {
      update();
    },

    click(el) {
      if (el.dataset.resbands) {
        const n = Number(el.dataset.resbands);
        if (!COUNTS.includes(n)) return false;

        S.bands = n;
        fixColors();
        syncSavedValue();
        saveState();
        render();
        return true;
      }

      if (el.dataset.resband !== undefined) {
        const i = Number(el.dataset.resband);
        if (i>=0 && i<S.bands) {
          S.colors[i] = el.value;
          fixColors();
          syncValueFromColors();
          update();
        }
        return true;
      }

      return false;
    }
  });

  function syncSavedValue() {
    const r = calculate();
    if (r && r.ohms>0) {
      let u = UNITS[0];
      if (r.ohms>=1e6) u=UNITS[2];
      else if (r.ohms>=1e3) u=UNITS[1];

      S.value = String(Number((r.ohms/u.factor).toPrecision(5)));
      S.unit = u.name;
    }
  }

  document.addEventListener("change",e=>{
    if (App.view!=="res") return;

    if (e.target.matches('select[data-resband]')) {
      const i = Number(e.target.dataset.resband);
      if (i<0 || i>=S.bands) return;

      S.colors[i] = e.target.value;
      fixColors();
      syncValueFromColors();
      update();
    }

    if (e.target.id==="resUnit") {
      applyValue();
    }
  });

  document.addEventListener("input",e=>{
    if (App.view==="res" && e.target.id==="resValue") {
      applyValue();
    }
  });

  fixColors();
  saveState();
})();
