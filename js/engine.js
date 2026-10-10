"use strict";
const CHEM = {lead:{dod:50,eff:85}, agm:{dod:60,eff:85}, lfp:{dod:80,eff:95}};
const SIZES = [0.5,0.75,1,1.5,2.5,4,6,10,16,25,35,50,70,95];            // mm²
const AMPS  = {0.5:5,0.75:8,1:10,1.5:15,2.5:20,4:30,6:40,10:60,16:80,25:110,35:140,50:170,70:215,95:260}; // rough limits (Cu)
const AWG   = {0.5:"20",0.75:"18",1:"17",1.5:"16",2.5:"14",4:"12",6:"10",10:"8",16:"6",25:"4",35:"2",50:"1/0",70:"2/0",95:"3/0"};
const FUSES = [1,2,3,5,7.5,10,15,20,25,30,40,50,60,80,100,125,150,200];
const RELAYS = [20,30,40,60,80];
const FUSE_FACTOR = {normal:1.25, motor:1.5};
const RHO   = {cu:0.0175, al:0.0282};   // Ω·mm²/m at 20°C
const AL_DERATE = 0.78;

function backupCalc(V,Ah,W,dod,eff){
  const usableWh = V*Ah*(dod/100)*(eff/100);
  const hours = usableWh/W;
  let h = Math.floor(hours), m = Math.round((hours-h)*60);
  if(m===60){h+=1;m=0}
  return {usableWh,hours,h,m,amps:W/V};
}

function wireCalc(V,I,L,dropPct,mat){
  const rho = RHO[mat];
  const reqArea = rho*2*L*I/(V*dropPct/100);
  const k = mat==='al'?AL_DERATE:1;
  const size = SIZES.find(s => s>=reqArea && AMPS[s]*k>=I);
  if(!size) return null;
  const drop = rho*2*L*I/size;
  const fuse = FUSES.find(f => f>=I*1.25) || null;
  return {reqArea,size,drop,dropPct:drop/V*100,fuse};
}

function fuseCalc(V,W,type){
  const I = W/V;
  const need = I*FUSE_FACTOR[type];
  const fuse = FUSES.find(f => f>=need) || null;
  const relay = RELAYS.find(r => r>=need) || null;
  const wire = fuse ? SIZES.find(s => AMPS[s]>=fuse) : null;
  return {I,need,fuse,relay,wire};
}

/* Ohm's law: give any two of {V,I,R,P} (numbers > 0), get all four back.
   f = the two formulas used, in the order of the two computed values. */
function ohmCalc(k){
  const has = x => typeof x==='number' && isFinite(x) && x>0;
  let {V,I,R,P} = k, f;
  if(has(V)&&has(I))      {R=V/I; P=V*I;               f=['R = V ÷ I','P = V × I']}
  else if(has(V)&&has(R)) {I=V/R; P=V*V/R;             f=['I = V ÷ R','P = V² ÷ R']}
  else if(has(V)&&has(P)) {I=P/V; R=V*V/P;             f=['I = P ÷ V','R = V² ÷ P']}
  else if(has(I)&&has(R)) {V=I*R; P=I*I*R;             f=['V = I × R','P = I² × R']}
  else if(has(I)&&has(P)) {V=P/I; R=P/(I*I);           f=['V = P ÷ I','R = P ÷ I²']}
  else if(has(R)&&has(P)) {V=Math.sqrt(P*R); I=Math.sqrt(P/R); f=['V = √(P × R)','I = √(P ÷ R)']}
  else return null;
  return {V,I,R,P,f};
}

/* Series / parallel resistance. list = resistor values in ohms (all > 0). */
function spCalc(mode,list){
  if(!Array.isArray(list) || list.length<1 || !list.every(x=>typeof x==='number' && isFinite(x) && x>0)) return null;
  if(mode==='series') return list.reduce((a,b)=>a+b,0);
  return 1/list.reduce((a,b)=>a+1/b,0);
}
/* ==========================================
   ElectroMind — Resistor Colour Code Engine
   Supports 4, 5 and 6 bands
========================================== */

const RC = {
  black:  { d: 0, m: 1,       p: 250 },
  brown:  { d: 1, m: 10,      t: 1,    p: 100 },
  red:    { d: 2, m: 100,     t: 2,    p: 50 },
  orange: { d: 3, m: 1e3,     p: 15 },
  yellow: { d: 4, m: 1e4,     p: 25 },
  green:  { d: 5, m: 1e5,     t: 0.5,  p: 20 },
  blue:   { d: 6, m: 1e6,     t: 0.25, p: 10 },
  violet: { d: 7, m: 1e7,     t: 0.1,  p: 5 },
  grey:   { d: 8, m: 1e8,     t: 0.05, p: 1 },
  white:  { d: 9, m: 1e9 },
  gold:   { m: 0.1, t: 5 },
  silver: { m: 0.01, t: 10 },
  none:   { t: 20 }
};

const RC_ROLES = {
  4: ["d", "d", "m", "t"],
  5: ["d", "d", "d", "m", "t"],
  6: ["d", "d", "d", "m", "t", "p"]
};

const RC_COL10 = [
  "black", "brown", "red", "orange", "yellow",
  "green", "blue", "violet", "grey", "white"
];

/* Decode colour bands into resistance */
function rcDecode(n, bands) {
  const roles = RC_ROLES[n];

  if (
    !roles ||
    !Array.isArray(bands) ||
    bands.length !== n
  ) return null;

  let digits = "";
  let multiplier = 1;
  let tolerance = null;
  let ppm = null;

  for (let i = 0; i < n; i++) {
    const colour = RC[bands[i]];

    if (!colour) return null;

    const role = roles[i];

    if (role === "d") {
      if (colour.d === undefined) return null;
      if (i === 0 && colour.d === 0) return null;

      digits += colour.d;
    } else if (role === "m") {
      if (colour.m === undefined) return null;
      multiplier = colour.m;
    } else if (role === "t") {
      if (colour.t === undefined) return null;
      if (bands[i] === "none" && n !== 4) return null;

      tolerance = colour.t;
    } else if (role === "p") {
      if (colour.p === undefined) return null;
      ppm = colour.p;
    }
  }

  return {
    ohms: Number(digits) * multiplier,
    tol: tolerance,
    ppm: ppm
  };
}

/* Encode resistance into colour bands */
function rcEncode(ohms, n, tolerance, ppm) {
  if (
    !RC_ROLES[n] ||
    !Number.isFinite(ohms) ||
    ohms <= 0
  ) return null;

  const digitCount = n === 4 ? 2 : 3;
  const limit = 10 ** digitCount;

  let exponent =
    Math.floor(Math.log10(ohms)) - (digitCount - 1);

  let digits = Math.round(
    ohms / (10 ** exponent)
  );

  if (digits >= limit) {
    digits = Math.round(digits / 10);
    exponent++;
  }

  if (exponent < -2 || exponent > 9) return null;

  const digitColours = String(digits)
    .split("")
    .map(x => RC_COL10[Number(x)]);

  let multiplierColour;

  if (exponent === -2) {
    multiplierColour = "silver";
  } else if (exponent === -1) {
    multiplierColour = "gold";
  } else {
    multiplierColour = RC_COL10[exponent];
  }

  const toleranceColour = Object.keys(RC).find(
    colour => RC[colour].t === tolerance
  );

  if (!toleranceColour) return null;
  if (toleranceColour === "none" && n !== 4) return null;

  const bands = [
    ...digitColours,
    multiplierColour,
    toleranceColour
  ];

  if (n === 6) {
    const tempColour = Object.keys(RC).find(
      colour => RC[colour].p === ppm
    );

    if (!tempColour) return null;

    bands.push(tempColour);
  }

  const actual = digits * (10 ** exponent);

  return {
    bands,
    actual,
    exact: Math.abs(actual - ohms) < 1e-9 * ohms
  };
}
