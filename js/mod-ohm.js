"use strict";
(function(){
const KEYS = ['V','I','R','P'];
const UNIT = {V:'V',I:'A',R:'Ω',P:'W'};
let O = store.get('em_o',null);
if(!O || !Array.isArray(O.order) || !O.v) O = {order:['I','V'], v:{V:'12',I:'2',R:'',P:''}};

// 4 significant digits, no long decimals
const nice = n => {
  if(!isFinite(n)) return '';
  if(n===0) return '0';
  const a = Math.abs(n);
  if(a<1e-6 || a>=1e12) return n.toExponential(3);
  return String(Number(n.toPrecision(4)));
};

registerModule({
  id:'ohm', titleKey:'ohm', subKey:'ohmS',
  render(){
    return `${topBar(t('ohm'))}
    <div id="out"></div>
    <div class="lab">${t('ohint')}</div>
    <div class="fields two">${field('V',t('V'),O.v.V)}${field('I',t('A'),O.v.I)}</div>
    <div class="fields two" style="padding-top:8px">${field('R',t('oR'),O.v.R)}${field('P',t('oP'),O.v.P)}</div>
    <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
  },
  update(){
    const ae = document.activeElement;
    const act = (ae && ae.matches && ae.matches('.f input') && KEYS.includes(ae.id)) ? ae.id : null;
    if(act) O.order = [act].concat(O.order.filter(k=>k!==act));
    const val = k => num($('#'+k).value);
    const mark = (k,on) => { const p=$('#'+k).parentElement; p.style.background=on?'var(--res-bg)':''; p.style.borderColor=on?'var(--res-border)':''; };
    const ins = O.order.filter(k=>val(k)>0).slice(0,2);
    const save = () => { KEYS.forEach(k=>{O.v[k]=$('#'+k).value}); store.set('em_o',O); };
    const out = $('#out');

    if(ins.length<2){
      KEYS.forEach(k=>{ if(!ins.includes(k) && k!==act) $('#'+k).value=''; mark(k,false); });
      App.last=null;
      out.innerHTML = `<div class="note">${t('ohint')}</div>`;
      save(); return;
    }
    const known = {}; ins.forEach(k=>{known[k]=val(k)});
    const r = ohmCalc(known);
    if(!r || ![r.V,r.I,r.R,r.P].every(x=>isFinite(x)&&x>0)){
      App.last=null;
      out.innerHTML = `<div class="res bad"><div class="d">${t('obig')}</div></div>`;
      save(); return;
    }
    const comp = KEYS.filter(k=>!ins.includes(k));
    KEYS.forEach(k=>{
      if(ins.includes(k)) mark(k,false);
      else if(k!==act){ $('#'+k).value = nice(r[k]); mark(k,true); }
      else mark(k,false);
    });
    O.order = O.order.filter(k=>ins.includes(k)||k===act);   // computed fields are no longer 'typed'
    const line = k => `${k} = ${digits(nice(r[k]))} ${UNIT[k]}`;
    App.last = {
      title: `${t('ohm')} · ${ins.map(k=>`${k}=${digits(nice(known[k]))}${UNIT[k]}`).join(' ')}`,
      result: comp.map(line).join(' · ')
    };
    out.innerHTML = `<div class="res"><div class="l">${t('oRes')}</div>
      ${comp.map(k=>`<div class="n" style="font-size:30px">${line(k)}</div>`).join('')}
      <div class="d">${r.f.join(' · ')}</div></div>
      <div class="note">${t('onote')}</div>`;
    save();
  },
  click(el){ return false; }
});
})();
