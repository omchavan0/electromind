"use strict";
(function(){
const UN = [['mΩ',1e-3],['Ω',1],['kΩ',1e3],['MΩ',1e6]];
const MAX = 10;
const fac = u => { const x = UN.find(a=>a[0]===u); return x ? x[1] : 1; };
const pick = x => { let b = UN[0]; UN.forEach(a=>{ if(Math.abs(x)/a[1]>=1) b = a; }); return b[0]; };
const nice = n => {
  if(!isFinite(n)) return '';
  if(n===0) return '0';
  const a = Math.abs(n);
  if(a<1e-6 || a>=1e12) return n.toExponential(3);
  return String(Number(n.toPrecision(4)));
};

let S = store.get('em_s',null);
if(!S || !Array.isArray(S.rows) || S.rows.length<2 || (S.mode!=='series' && S.mode!=='parallel'))
  S = {mode:'series', rows:[{v:'100',u:'Ω'},{v:'220',u:'Ω'}]};

const sync = () => S.rows.forEach((r,i)=>{ const a=$('#s'+i), b=$('#su'+i); if(a&&b){ r.v=a.value; r.u=b.value; } });
const row = (r,i) => `<div class="f"><label for="s${i}">R${i+1}</label><div style="display:flex;align-items:center;gap:6px">
  <input id="s${i}" inputmode="decimal" value="${esc(r.v)}" style="flex:1;min-width:0">
  <select id="su${i}" aria-label="unit" style="font:inherit;font-size:18px;font-weight:800;color:var(--primary);border:0;background:#E8ECF4;border-radius:10px;min-height:44px;padding:0 6px">${
    UN.map(a=>`<option${a[0]===r.u?' selected':''}>${a[0]}</option>`).join('')}</select>${
  S.rows.length>2 ? `<button data-act="del:${i}" aria-label="${t('sdel')}" style="border:0;background:#E8ECF4;border-radius:10px;min-height:44px;min-width:44px;font-size:20px;color:var(--err)">✕</button>` : ''}
  </div></div>`;

registerModule({
  id:'sp', titleKey:'sp', subKey:'spS',
  render(){
    return `${topBar(t('sp'))}
    <div id="out"></div>
    <div class="chips">${[['series','ser'],['parallel','par']].map(([k,l])=>chip('data-act','mode:'+k,t(l),S.mode===k)).join('')}</div>
    <div class="fields" style="grid-template-columns:1fr;gap:8px">${S.rows.map(row).join('')}</div>
    ${S.rows.length<MAX ? `<div class="chips"><button class="chip" data-act="add">${t('sadd')}</button></div>` : ''}
    <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
  },
  update(){
    sync(); store.set('em_s',S);
    const out = $('#out');
    const vals = [], items = []; let bad = false;
    S.rows.forEach(r=>{
      if(String(r.v).trim()==='') return;
      const n = num(r.v);
      if(!(n>0)){ bad = true; return; }
      vals.push(n*fac(r.u)); items.push(`${nice(n)} ${r.u}`);
    });
    if(bad){ App.last=null; out.innerHTML=`<div class="res bad"><div class="d">${t('sbad')}</div></div>`; return; }
    if(vals.length<2){ App.last=null; out.innerHTML=`<div class="note">${t('shint')}</div>`; return; }
    const tot = spCalc(S.mode, vals);
    if(tot===null || !isFinite(tot)){ App.last=null; out.innerHTML=`<div class="res bad"><div class="d">${t('sbad')}</div></div>`; return; }
    const u = pick(tot);
    const txt = `${digits(nice(tot/fac(u)))} ${u}`;
    const formula = S.mode==='series' ? 'R = R1 + R2 + …' : '1/R = 1/R1 + 1/R2 + …';
    App.last = {title:`${t('sp')} · ${t(S.mode==='series'?'ser':'par')}: ${items.join(', ')}`, result:`R = ${txt}`};
    out.innerHTML = `<div class="res"><div class="l">${t('stot')} (${t(S.mode==='series'?'ser':'par')})</div>
      <div class="n">${txt}</div>
      <div class="d">${formula}${u!=='Ω' ? ` · ${digits(nice(tot))} Ω` : ''}</div></div>
      <div class="note">${t('snote')}</div>`;
  },
  click(el){
    const a = el.dataset.act; if(!a) return false;
    if(a.indexOf('mode:')===0){ S.mode=a.slice(5); setOn('[data-act^="mode:"]',el); this.update(); return true; }
    if(a==='add'){
      sync();
      if(S.rows.length<MAX) S.rows.push({v:'', u:S.rows[S.rows.length-1].u});
      store.set('em_s',S); render();
      const f = $('#s'+(S.rows.length-1)); if(f) f.focus();
      return true;
    }
    if(a.indexOf('del:')===0){
      sync();
      if(S.rows.length>2) S.rows.splice(+a.slice(4),1);
      store.set('em_s',S); render(); return true;
    }
    return false;
  }
});
document.addEventListener('change',e=>{
  if(App.view==='sp' && e.target.matches && e.target.matches('select[id^="su"]')) MODULES.sp.update();
});
})();
