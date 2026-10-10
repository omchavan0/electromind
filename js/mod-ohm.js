"use strict";
(function(){
const KEYS = ['V','I','R','P'];
const BASE = {V:'V',I:'A',R:'Ω',P:'W'};
const UNITS = {
  V:[['mV',1e-3],['V',1],['kV',1e3]],
  I:[['µA',1e-6],['mA',1e-3],['A',1]],
  R:[['mΩ',1e-3],['Ω',1],['kΩ',1e3],['MΩ',1e6]],
  P:[['mW',1e-3],['W',1],['kW',1e3]]
};
const fac = (k,u) => { const x = UNITS[k].find(a=>a[0]===u); return x ? x[1] : 1; };
// biggest unit in which the number is still >= 1 (else the smallest unit)
const pick = (k,x) => { let b = UNITS[k][0]; UNITS[k].forEach(a=>{ if(Math.abs(x)/a[1]>=1) b = a; }); return b[0]; };
// 4 significant digits, no long decimals
const nice = n => {
  if(!isFinite(n)) return '';
  if(n===0) return '0';
  const a = Math.abs(n);
  if(a<1e-6 || a>=1e12) return n.toExponential(3);
  return String(Number(n.toPrecision(4)));
};

let O = store.get('em_o',null);
if(!O || !Array.isArray(O.order) || !O.v) O = {order:['I','V'], v:{V:'12',I:'2',R:'',P:''}};
O.u = Object.assign({}, BASE, O.u||{});
O.lock = O.lock || {};

const unitBox = k => `<select id="u${k}" aria-label="unit" style="font:inherit;font-size:18px;font-weight:800;color:var(--primary);border:0;background:#E8ECF4;border-radius:10px;min-height:44px;padding:0 6px">${
  UNITS[k].map(a=>`<option${a[0]===O.u[k]?' selected':''}>${a[0]}</option>`).join('')}</select>`;
const box = (k,label) => `<div class="f"><label for="${k}">${label}</label><div style="display:flex;align-items:center;gap:6px"><input id="${k}" inputmode="decimal" value="${esc(O.v[k])}" style="flex:1;min-width:0">${unitBox(k)}</div></div>`;

registerModule({
  id:'ohm', titleKey:'ohm', subKey:'ohmS',
  render(){
    return `${topBar(t('ohm'))}
    <div id="out"></div>
    <div class="lab">${t('ohint')}</div>
    <div class="fields two">${box('V',t('V'))}${box('I',t('A'))}</div>
    <div class="fields two" style="padding-top:8px">${box('R',t('oR'))}${box('P',t('oP'))}</div>
    <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
  },
  update(){
    const ae = document.activeElement;
    const act = (ae && ae.matches && ae.matches('.f input') && KEYS.includes(ae.id)) ? ae.id : null;
    if(act) O.order = [act].concat(O.order.filter(k=>k!==act));
    const U = k => $('#u'+k).value;
    const val = k => num($('#'+k).value);
    const mark = (k,on) => { const p=$('#'+k).parentElement; p.style.background=on?'var(--res-bg)':''; p.style.borderColor=on?'var(--res-border)':''; };
    const ins = O.order.filter(k=>val(k)>0).slice(0,2);
    const save = () => { KEYS.forEach(k=>{O.v[k]=$('#'+k).value; O.u[k]=U(k)}); store.set('em_o',O); };
    const out = $('#out');

    if(ins.length<2){
      KEYS.forEach(k=>{ if(!ins.includes(k) && k!==act) $('#'+k).value=''; mark(k,false); });
      O.lock = {};
      App.last=null;
      out.innerHTML = `<div class="note">${t('ohint')}</div>`;
      save(); return;
    }
    const known = {}; ins.forEach(k=>{known[k]=val(k)*fac(k,U(k))});
    const r = ohmCalc(known);
    if(!r || ![r.V,r.I,r.R,r.P].every(x=>isFinite(x)&&x>0)){
      App.last=null;
      out.innerHTML = `<div class="res bad"><div class="d">${t('obig')}</div></div>`;
      save(); return;
    }
    const comp = KEYS.filter(k=>!ins.includes(k));
    const shown = {};
    KEYS.forEach(k=>{
      if(ins.includes(k)){ mark(k,false); delete O.lock[k]; shown[k]=U(k); }
      else if(k!==act){
        const u = O.lock[k] ? U(k) : pick(k,r[k]);
        $('#u'+k).value = u; $('#'+k).value = nice(r[k]/fac(k,u)); mark(k,true); shown[k]=u;
      } else { mark(k,false); shown[k]=pick(k,r[k]); }
    });
    O.order = O.order.filter(k=>ins.includes(k)||k===act);   // computed fields are no longer 'typed'
    const line = k => `${k} = ${digits(nice(r[k]/fac(k,shown[k])))} ${shown[k]}`;
    App.last = {
      title: `${t('ohm')} · ${ins.map(k=>`${k}=${digits(nice(val(k)))} ${U(k)}`).join(' ')}`,
      result: comp.map(line).join(' · ')
    };
    out.innerHTML = `<div class="res"><div class="l">${t('oRes')}</div>
      ${comp.map(k=>`<div class="n" style="font-size:30px">${line(k)}</div>`).join('')}
      <div class="d">${r.f.join(' · ')}</div></div>
      <div class="note">${t('onote')}</div>`;
    save();
  },
  click(el){ return false; },
  unit(k){                                   // user changed a unit box
    const v = num($('#'+k).value), nu = $('#u'+k).value;
    if(O.order.includes(k) && v>0){           // typed value: same number, new unit
      O.order = [k].concat(O.order.filter(x=>x!==k));
    } else if(v>0){                           // calculated value: show same quantity in the new unit
      const b = v*fac(k,O.u[k]);
      $('#'+k).value = nice(b/fac(k,nu)); O.lock[k] = true;
    }
    this.update();
  }
});
document.addEventListener('change',e=>{
  if(App.view==='ohm' && e.target.matches && e.target.matches('select[id^="u"]')) MODULES.ohm.unit(e.target.id.slice(1));
});
})();
