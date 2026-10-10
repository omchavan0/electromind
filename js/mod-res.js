
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
    {name:"Grey",mr:"राखाडी",hi:"серый",hex:"#9E9E9E",digit:8,mult:1e8,tol:0.05,ppm:1},
    {name:"White",mr:"पांढरा",hi:"सफेद",hex:"#F5F5F5",digit:9,mult:1e9},
    {name:"Gold",mr:"सोनेरी",hi:"सुनहरा",hex:"#D4AF37",mult:0.1,tol:5},
    {name:"Silver",mr:"चंदेरी",hi:"चाँदी",hex:"#B7C2CB",mult:0.01,tol:10},
    {name:"None",mr:"नसलेला",hi:"नहीं",hex:"#FFFFFF",tol:20}
  ];

  const COUNTS = [4,5,6];
  const KEY = "em_res";
  const DEFAULT = {
    bands:4,
    colors:["Brown","Black","Red","Gold","Brown","Brown"],
    value:"1",
    unit:"kΩ"
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
  while(S.colors.length < 6) S.colors.push("Brown");
  S.value = S.value ?? "1";
  S.unit = S.unit ?? "kΩ";

  const txt = (mr,hi,en) =>
    App.lang==="mr" ? mr : App.lang==="hi" ? hi : en;

  const cget = name => COLORS.find(c=>c.name===name) || COLORS[0];
  const tr = c => App.lang==="mr" ? c.mr : App.lang==="hi" ? c.hi : c.name;
  const fmt = n => {
    if(!Number.isFinite(n)) return "—";
    if(n===0) return "0";
    return String(Number(n.toPrecision(4)));
  };
  const formatR = n => {
    if(!Number.isFinite(n) || n<0) return "—";
    if(n>=1e6) return `${fmt(n/1e6)} MΩ`;
    if(n>=1e3) return `${fmt(n/1e3)} kΩ`;
    return `${fmt(n)} Ω`;
  };
  const saveState = () => store.set(KEY,S);

  function role(i) {
    if(i < S.bands-2-(S.bands===6?1:0)) return "digit";
    if(i === S.bands-2-(S.bands===6?1:0)) return "mult";
    if(S.bands===6 && i===5) return "ppm";
    return "tol";
  }

  // Band positions:
  // 4-band: digit, digit, multiplier, tolerance
  // 5-band: digit, digit, digit, multiplier, tolerance
  // 6-band: digit, digit, digit, multiplier, tolerance, ppm
  function bandRole(i) {
    if(S.bands===4) return ["digit","digit","mult","tol"][i];
    if(S.bands===5) return ["digit","digit","digit","mult","tol"][i];
    return ["digit","digit","digit","mult","tol","ppm"][i];
  }

  function allowed(i) {
    const r=bandRole(i);
    if(r==="digit") {
      return COLORS.filter(c=>c.digit!==undefined);
    }
    if(r==="mult") {
      return COLORS.filter(c=>c.mult!==undefined);
    }
    if(r==="tol") {
      return COLORS.filter(c=>c.tol!==undefined);
    }
    return COLORS.filter(c=>c.ppm!==undefined);
  }

  function fixColors() {
    for(let i=0;i<S.bands;i++) {
      if(!allowed(i).some(c=>c.name===S.colors[i])) {
        S.colors[i] = bandRole(i)==="tol" ? "Gold" :
          bandRole(i)==="ppm" ? "Brown" : "Brown";
      }
    }
  }

  function tolerance(c) {
    return c.tol===undefined ? null : c.tol;
  }

  function calculate() {
    fixColors();
    const digitsCount=S.bands===4?2:3;
    const ds=S.colors.slice(0,digitsCount).map(n=>cget(n).digit);
    if(ds.some(v=>v===undefined)) return null;

    const multiplier=cget(S.colors[digitsCount]).mult;
    const tol=tolerance(cget(S.colors[digitsCount+1]));
    const ohms=Number(ds.join(""))*multiplier;
    const ppm=S.bands===6?cget(S.colors[5]).ppm:null;

    if(!Number.isFinite(ohms)) return null;
    return {ohms,tol,ppm};
  }

  function encodeValue(ohms) {
    if(!Number.isFinite(ohms) || ohms<=0) return false;

    const digitsCount=S.bands===4?2:3;
    const exponentMax=9;
    let best=null;

    // Find the nearest valid significant digits and multiplier.
    for(let exp=-2;exp<=exponentMax;exp++) {
      const mult=Math.pow(10,exp);
      const raw=ohms/mult;
      const sig=Math.round(raw);
      const min=Math.pow(10,digitsCount-1);
      const max=Math.pow(10,digitsCount)-1;
      if(sig<min || sig>max) continue;

      const err=Math.abs(sig*mult-ohms)/ohms;
      if(!best || err<best.err) best={sig,exp,err};
    }

    if(!best) {
      // Very small or very large values: try a normalized representation.
      const exp=Math.floor(Math.log10(ohms))-(digitsCount-1);
      const sig=Math.round(ohms/Math.pow(10,exp));
      if(sig>=Math.pow(10,digitsCount-1) &&
         sig<Math.pow(10,digitsCount) && exp>=-2 && exp<=9) {
        best={sig,exp,err:Math.abs(sig*Math.pow(10,exp)-ohms)/ohms};
      }
    }
    if(!best) return false;

    const digits=String(best.sig).padStart(digitsCount,"0");
    for(let i=0;i<digitsCount;i++) {
      S.colors[i]=COLORS.find(c=>c.digit===Number(digits[i])).name;
    }
    const mc=COLORS.find(c=>c.mult===Math.pow(10,best.exp));
    if(!mc) return false;
    S.colors[digitsCount]=mc.name;

    // Keep a sensible default tolerance if the current colour is invalid.
    if(!allowed(digitsCount+1).some(c=>c.name===S.colors[digitsCount+1])) {
      S.colors[digitsCount+1]="Gold";
    }
    if(S.bands===6 &&
       !allowed(5).some(c=>c.name===S.colors[5])) S.colors[5]="Brown";

    fixColors();
    return true;
  }

  function svgBand(i) {
    const n=S.bands;
    const positions = n===4 ? [148,170,192,216] :
      n===5 ? [142,160,178,200,222] :
      [138,154,170,190,210,230];
    const x=positions[i];
    const col=cget(S.colors[i]);
    const width=(i===n-1 && n===4)?10:9;
    return `<g>
      <rect x="${x}" y="37" width="${width}" height="48" rx="2"
        fill="${col.hex}" stroke="#000000" stroke-opacity=".2" stroke-width="1"/>
      <rect x="${x+1}" y="39" width="2" height="43" rx="1"
        fill="#FFFFFF" opacity=".28"/>
    </g>`;
  }

  function resistorSVG() {
    const bands=Array.from({length:S.bands},(_,i)=>svgBand(i)).join("");
    return `<svg class="resistor-svg" viewBox="0 0 360 125"
      role="img" aria-label="3D resistor with selected colour bands">
      <defs>
        <linearGradient id="resBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#EBD1A1"/>
          <stop offset=".20" stop-color="#F8E4BF"/>
          <stop offset=".52" stop-color="#D9B17A"/>
          <stop offset=".78" stop-color="#C4945D"/>
          <stop offset="1" stop-color="#8D6038"/>
        </linearGradient>
        <linearGradient id="resShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".65"/>
          <stop offset=".35" stop-color="#FFFFFF" stop-opacity=".08"/>
          <stop offset=".75" stop-color="#FFFFFF" stop-opacity=".25"/>
          <stop offset="1" stop-color="#68431F" stop-opacity=".2"/>
        </linearGradient>
        <linearGradient id="resMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#F4F7FA"/>
          <stop offset=".45" stop-color="#8A949B"/>
          <stop offset=".7" stop-color="#E5E9ED"/>
          <stop offset="1" stop-color="#707A81"/>
        </linearGradient>
        <filter id="resShadow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="4"/>
        </filter>
      </defs>
      <ellipse cx="180" cy="103" rx="95" ry="7" fill="#63758B" opacity=".22" filter="url(#resShadow)"/>
      <path d="M12 61 H104 M256 61 H348" stroke="url(#resMetal)" stroke-width="6" stroke-linecap="round"/>
      <path d="M12 59 H104 M256 59 H348" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="1.4"/>
      <rect x="88" y="34" width="184" height="54" rx="19" fill="url(#resBody)" stroke="#9B754C" stroke-width="1.2"/>
      <clipPath id="resClip"><rect x="88" y="34" width="184" height="54" rx="19"/></clipPath>
      <g clip-path="url(#resClip)">
        ${bands}
        <rect x="88" y="34" width="184" height="54" fill="url(#resShine)"/>
        <path d="M99 43 Q105 35 117 36 H244" fill="none" stroke="#FFFFFF" stroke-opacity=".62" stroke-width="2"/>
      </g>
      <ellipse cx="91" cy="61" rx="4" ry="22" fill="#A8794C" opacity=".45"/>
      <ellipse cx="269" cy="61" rx="4" ry="22" fill="#80532F" opacity=".35"/>
    </svg>`;
  }

  function valueInput() {
    return `<div class="res-value-box">
      <label for="resValue">${txt("रेझिस्टन्सची किंमत टाका","प्रतिरोध का मान भरें","Enter resistance value")}</label>
      <div class="res-value-row">
        <input id="resValue" type="number" min="0" step="any"
          inputmode="decimal" value="${esc(S.value)}" placeholder="उदा. 2.2">
        <select id="resUnit" aria-label="Resistance unit">
          ${UNITS.map(u=>`<option value="${u.name}" ${S.unit===u.name?"selected":""}>${u.name}</option>`).join("")}
        </select>
      </div>
      <div class="res-small">${txt("किंमत टाकल्यावर रंग आपोआप बदलतील.","मान भरने पर रंग अपने-आप बदलेंगे।","Changing the value updates the bands automatically.")}</div>
    </div>`;
  }

  function renderBands() {
    return Array.from({length:S.bands},(_,i)=>{
      const c=cget(S.colors[i]);
      return `<div class="f">
        <label for="res${i}">${txt("बँड","बैंड","Band")} ${i+1} · ${txt(bandRole(i)==="digit"?"अंक":bandRole(i)==="mult"?"मल्टिप्लायर":bandRole(i)==="tol"?"टॉलरन्स":"तापमान गुणांक",bandRole(i)==="digit"?"अंक":bandRole(i)==="mult"?"मल्टिप्लायर":bandRole(i)==="tol"?"टॉलरेंस":"तापमान गुणांक",bandRole(i)==="digit"?"Digit":bandRole(i)==="mult"?"Multiplier":bandRole(i)==="tol"?"Tolerance":"Temp. coefficient")}</label>
        <div class="res-color-row">
          <span class="res-swatch" style="background:${c.hex};${c.name==="White"||c.name==="None"?"border:1px solid #aaa;":""}"></span>
          <select id="res${i}" data-resband="${i}">
            ${allowed(i).map(x=>`<option value="${x.name}" ${x.name===S.colors[i]?"selected":""}>${tr(x)}</option>`).join("")}
          </select>
        </div>
      </div>`;
    }).join("");
  }

  function updateVisual() {
    const host=$("#resistorVisual");
    if(host) host.innerHTML=resistorSVG();

    for(let i=0;i<S.bands;i++) {
      const sel=$(`#res${i}`);
      if(sel && sel.value!==S.colors[i]) sel.value=S.colors[i];
      const sw=sel?.parentElement?.querySelector(".res-swatch");
      if(sw) {
        const c=cget(S.colors[i]);
        sw.style.background=c.hex;
        sw.style.border=c.name==="White"||c.name==="None"?"1px solid #aaa":"1px solid #00000018";
      }
    }
  }

  function updateResult() {
    const out=$("#resout");
    if(!out) return;

    const r=calculate();
    if(!r) {
      App.last=null;
      out.innerHTML=`<div class="res bad">${txt("रंग तपासा","रंग जाँचें","Check the bands")}</div>`;
      return;
    }

    const tolText=r.tol===null?"—":`±${r.tol}%`;
    const ppmText=r.ppm===null?"":`<div class="d">${txt("तापमान गुणांक","तापमान गुणांक","Temperature coefficient")}: ${r.ppm} ppm/°C</div>`;
    const title=txt("रेझिस्टर कलर कोड","रेज़िस्टर कलर कोड","Resistor colour code");
    const resultText=`${formatR(r.ohms)} · ${tolText}${r.ppm===null?"":` · ${r.ppm} ppm/°C`}`;

    App.last={title,result:resultText};
    out.innerHTML=`<div class="res">
      <div class="l">${txt("रेझिस्टन्स","प्रतिरोध","Resistance")}</div>
      <div class="n">${formatR(r.ohms)}</div>
      <div class="d">${txt("Tolerance","Tolerance","Tolerance")}: ${tolText}</div>
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
    const input=$("#resValue");
    const unit=$("#resUnit");
    if(!input||!unit) return;

    const v=Number(input.value);
    const u=UNITS.find(x=>x.name===unit.value);
    if(!Number.isFinite(v)||v<=0||!u) return;

    const ohms=v*u.factor;
    if(encodeValue(ohms)) {
      S.value=input.value;
      S.unit=unit.value;
      update();
    }
  }

  function syncValueFromColors() {
    const r=calculate();
    const input=$("#resValue");
    const unit=$("#resUnit");
    if(!r||!input||!unit) return;

    let u=UNITS[0];
    if(r.ohms>=1e6) u=UNITS[2];
    else if(r.ohms>=1e3) u=UNITS[1];

    S.value=String(Number((r.ohms/u.factor).toPrecision(5)));
    S.unit=u.name;
    input.value=S.value;
    unit.value=S.unit;
  }

  registerModule({
    id:"res",
    titleKey:"res",
    subKey:"resS",

    render() {
      fixColors();
      return `${topBar(txt("रेझिस्टर","रेज़िस्टर","Resistor"))}
        <div class="chips">
          ${COUNTS.map(n=>chip("data-resbands",String(n),`${n} ${txt("बँड","बैंड","Band")}`,S.bands===n)).join("")}
        </div>

        <div class="resistor-stage">
          <div id="resistorVisual">${resistorSVG()}</div>
        </div>

        ${valueInput()}
        <div id="resout"></div>

        <div class="fields" style="grid-template-columns:1fr;gap:8px">
          ${renderBands()}
        </div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>

        <div class="note">${txt(
          "Value टाका किंवा रंग निवडा. चित्र आणि निकाल आपोआप बदलतील.",
          "मान भरें या रंग चुनें। चित्र और नतीजा अपने-आप बदलेंगे।",
          "Enter a value or choose colours. The image and result update automatically."
        )}</div>`;
    },

    update() {
      update();
    },

    click(el) {
      if(el.dataset.resbands) {
        S.bands=Number(el.dataset.resbands);
        fixColors();
        saveState();
        render();
        return true;
      }

      if(el.dataset.resband!==undefined) {
        S.colors[Number(el.dataset.resband)]=el.value;
        fixColors();
        syncValueFromColors();
        update();
        return true;
      }
      return false;
    }
  });

  document.addEventListener("change",e=>{
    if(App.view!=="res") return;
    if(e.target.matches('select[data-resband]')) {
      const i=Number(e.target.dataset.resband);
      S.colors[i]=e.target.value;
      fixColors();
      syncValueFromColors();
      update();
    }
    if(e.target.id==="resUnit") applyValue();
  });

  document.addEventListener("input",e=>{
    if(App.view==="res" && e.target.id==="resValue") applyValue();
  });

  // Ensure the first view has correct result after the app opens the module.
  document.addEventListener("click",e=>{
    if(e.target.closest('[data-go="res"]')) {
      setTimeout(()=>{if(App.view==="res") update();},0);
    }
  });

  fixColors();
  saveState();
})();
      
