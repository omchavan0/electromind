"use strict";
const $ = s => document.querySelector(s);
const store = {
  get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
let lang = store.get('em_lang','mr');
let view = 'home';
let hist = store.get('em_hist',[]);
const B = store.get('em_b',{V:12,Ah:80,W:250,chem:'lead',dod:50,eff:85});
const W_ = store.get('em_w',{V:12,I:10,L:5,drop:3,mat:'cu'});
const t = k => T[lang][k];
const num = v => { const n = parseFloat(String(v).replace(',','.')); return isFinite(n)?n:NaN };
const fmt = (n,d=2) => String(+n.toFixed(d));
const digits = s => (lang==='en') ? s : String(s).replace(/[0-9]/g,c=>'०१२३४५६७८९'[c]);
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Pieces ---------- */
const langBar = () => `<div class="lang" role="group" aria-label="Language">${
  [['mr','मर'],['hi','हिं'],['en','EN']].map(([c,l])=>`<button data-lang="${c}" class="${lang===c?'on':''}">${l}</button>`).join('')}</div>`;
const navBar = () => `<nav class="nav"><div>
  <button data-go="home" class="${view==='home'?'on':''}">${t('home')}</button>
  <button data-go="hist" class="${view==='hist'?'on':''}">${t('hist')}</button></div></nav>`;
const field = (id,label,val,mode='decimal') => `<div class="f"><label for="${id}">${label}</label><input id="${id}" inputmode="${mode}" value="${esc(val)}"></div>`;
const chip = (attr,val,label,on) => `<button class="chip ${on?'on':''}" ${attr}="${val}">${label}</button>`;
const top = title => `<div class="bar"><button class="back" data-go="home" aria-label="${t('home')}">‹</button><h1>${title}</h1></div>`;

/* ---------- Views ---------- */
function homeView(){
  const tiles = ['fuse','load','motor','res','unit','ai']
    .map(k=>`<div class="tile">${t(k)}<small>${t('soon')}</small></div>`).join('');
  const rec = hist.slice(0,3).map(h=>`<div class="item"><div class="k">${esc(h.title)}</div><div class="v">${esc(h.result)}</div></div>`).join('')
    || `<div class="empty">${t('none')}</div>`;
  return `<div class="top"><div><div class="brand">ElectroMind</div><div class="sub">${t('sub')}</div></div>${langBar()}</div>
  <div class="sub" style="padding:4px 20px">${t('hello')}</div>
  <button class="big fill" data-go="backup"><div><b>${t('backup')}</b><span>${t('backupS')}</span></div></button>
  <button class="big line" data-go="wire"><div><b>${t('wire')}</b><span>${t('wireS')}</span></div></button>
  <div class="grid">${tiles}</div>
  <div class="sec"><span>${t('recent')}</span><a href="#" data-go="hist" style="color:var(--primary);font-weight:600;text-decoration:none">${t('all')}</a></div>${rec}${navBar()}`;
}
function backupView(){
  return `${top(t('backup'))}
  <div id="out"></div>
  <div class="chips">${[12,24,48].map(v=>chip('data-v',v,v+'V',B.V==v)).join('')}</div>
  <div class="lab">${t('chem')}</div>
  <div class="chips">${['lead','agm','lfp'].map(c=>chip('data-chem',c,t(c),B.chem===c)).join('')}</div>
  <div class="fields">${field('V',t('V'),B.V)}${field('Ah',t('Ah'),B.Ah)}${field('W',t('W'),B.W)}</div>
  <div class="fields two" style="padding-top:8px">${field('dod',t('dod'),B.dod)}${field('eff',t('eff'),B.eff)}</div>
  <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
}
function wireView(){
  return `${top(t('wire'))}
  <div id="out"></div>
  <div class="chips">${[12,24,48].map(v=>chip('data-v',v,v+'V',W_.V==v)).join('')}${['cu','al'].map(m=>chip('data-mat',m,t(m),W_.mat===m)).join('')}</div>
  <div class="fields">${field('I',t('A'),W_.I)}${field('L',t('L'),W_.L)}${field('drop',t('md'),W_.drop)}</div>
  <div class="fields two" style="padding-top:8px">${field('V',t('V'),W_.V)}</div>
  <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
}
function histView(){
  const list = hist.map(h=>`<div class="item"><div class="k">${esc(h.title)} · ${esc(h.when)}</div><div class="v">${esc(h.result)}</div></div>`).join('')
    || `<div class="empty">${t('none')}</div>`;
  return `${top(t('hist'))}${list}${hist.length?`<button class="clear" id="clr">${t('clear')}</button>`:''}${navBar()}`;
}

/* ---------- Live update ---------- */
let last = null;   // last valid result, used by Save
function updBackup(){
  B.V=num($('#V').value);B.Ah=num($('#Ah').value);B.W=num($('#W').value);B.dod=num($('#dod').value);B.eff=num($('#eff').value);
  store.set('em_b',B);
  const ok=[B.V,B.Ah,B.W].every(x=>x>0)&&B.dod>=1&&B.dod<=100&&B.eff>=1&&B.eff<=100;
  if(!ok){last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('bad')}</div></div>`;return}
  const r=backupCalc(B.V,B.Ah,B.W,B.dod,B.eff);
  const txt = `${digits(r.h)} ${t('hr')} ${digits(r.m)} ${t('mn')}`;
  last={title:`${t('backup')} · ${fmt(B.V,1)}V ${fmt(B.Ah,1)}Ah ${fmt(B.W,0)}W`,result:txt};
  const peuk=(B.chem!=='lfp'&&r.amps>B.Ah/5)?`<div class="note">${t('peuk')}</div>`:'';
  $('#out').innerHTML=`<div class="res"><div class="l">${t('est')}</div><div class="n">${txt}</div>
   <div class="d">${t('usable')}: ${fmt(r.usableWh,0)} Wh ÷ ${fmt(B.W,0)} W</div></div>${peuk}<div class="note">${t('bnote')}</div>`;
}
function updWire(){
  W_.V=num($('#V').value);W_.I=num($('#I').value);W_.L=num($('#L').value);W_.drop=num($('#drop').value);
  store.set('em_w',W_);
  if(![W_.V,W_.I,W_.L,W_.drop].every(x=>x>0)){last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('wbad')}</div></div>`;return}
  const r=wireCalc(W_.V,W_.I,W_.L,W_.drop,W_.mat);
  if(!r){last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('wbig')}</div></div>`;return}
  last={title:`${t('wire')} · ${fmt(W_.V,1)}V ${fmt(W_.I,1)}A ${fmt(W_.L,1)}m`,result:`${r.size} mm² (≈ ${AWG[r.size]} AWG)`};
  $('#out').innerHTML=`<div class="res"><div class="l">${t('right')}</div>
   <div class="n">${r.size} mm² <span style="font-size:18px">(≈ ${AWG[r.size]} AWG)</span></div>
   <div class="d">${t('dropT')} ${fmt(r.dropPct,1)} % (${fmt(r.drop,2)} V)${r.fuse?` · ${t('fuseT')} ${r.fuse} A`:''}</div></div>
   <div class="meter"><div class="r"><span>${t('dropT')}</span><b>${fmt(r.dropPct,1)} % / ${t('limit')} ${fmt(W_.drop,1)} %</b></div>
   <div class="track"><div class="fillbar" style="width:${Math.min(100,r.dropPct/W_.drop*100)}%"></div></div></div>
   <div class="note">${t('wnote')}</div>`;
}

/* ---------- Render + events ---------- */
function toast(m){const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),1400)}
function render(){
  const app=$('#app');
  app.innerHTML = view==='home'?homeView():view==='backup'?backupView():view==='wire'?wireView():histView();
  document.documentElement.lang=lang;
  if(view==='backup')updBackup();
  if(view==='wire')updWire();
  window.scrollTo(0,0);
}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-go],[data-lang],[data-v],[data-chem],[data-mat],#save,#clr');
  if(!el)return;
  if(el.dataset.go){e.preventDefault();view=el.dataset.go;render();return}
  if(el.dataset.lang){lang=el.dataset.lang;store.set('em_lang',lang);render();return}
  if(el.dataset.v){$('#V').value=el.dataset.v;document.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b===el));view==='backup'?updBackup():updWire();return}
  if(el.dataset.chem){B.chem=el.dataset.chem;$('#dod').value=CHEM[B.chem].dod;$('#eff').value=CHEM[B.chem].eff;
    document.querySelectorAll('[data-chem]').forEach(b=>b.classList.toggle('on',b===el));updBackup();return}
  if(el.dataset.mat){W_.mat=el.dataset.mat;document.querySelectorAll('[data-mat]').forEach(b=>b.classList.toggle('on',b===el));updWire();return}
  if(el.id==='save'){if(!last)return;
    hist.unshift({...last,when:new Date().toLocaleString(lang==='en'?'en-IN':'mr-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})});
    hist=hist.slice(0,50);store.set('em_hist',hist);toast(t('saved'));return}
  if(el.id==='clr'){hist=[];store.set('em_hist',hist);render()}
});
document.addEventListener('input',e=>{ if(e.target.matches('.f input')) view==='backup'?updBackup():updWire(); });
render();
