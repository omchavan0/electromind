"use strict";
/* Shared helpers, state and the module registry. */
const $ = s => document.querySelector(s);
const store = {
  get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
const App = { lang: store.get('em_lang','mr'), view: 'home', hist: store.get('em_hist',[]), last: null };
const MODULES = {};
const registerModule = m => { MODULES[m.id] = m; };

const t = k => (T[App.lang] && T[App.lang][k]) || T.en[k] || k;
const num = v => { const n = parseFloat(String(v).replace(',','.')); return isFinite(n)?n:NaN };
const fmt = (n,d=2) => String(+n.toFixed(d));
const digits = s => (App.lang==='en') ? s : String(s).replace(/[0-9]/g,c=>'०१२३४५६७८९'[c]);
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const field = (id,label,val,mode='decimal') => `<div class="f"><label for="${id}">${label}</label><input id="${id}" inputmode="${mode}" value="${esc(val)}"></div>`;
const chip = (attr,val,label,on) => `<button class="chip ${on?'on':''}" ${attr}="${val}">${label}</button>`;
const topBar = title => `<div class="bar"><button class="back" data-go="home" aria-label="${t('home')}">‹</button><h1>${title}</h1></div>`;
const setOn = (sel,el) => document.querySelectorAll(sel).forEach(b => b.classList.toggle('on', b===el));
function toast(m){const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),1400)}
