"use strict";
/* Home, History, router and events. Calculators live in js/mod-*.js */
const SOON = ['load','unit','ai'];

const langBar = () => `<div class="lang" role="group" aria-label="Language">${
  [['mr','मर'],['hi','हिं'],['en','EN']].map(([c,l])=>`<button data-lang="${c}" class="${App.lang===c?'on':''}">${l}</button>`).join('')}</div>`;
const navBar = () => `<nav class="nav"><div>
  <button data-go="home" class="${App.view==='home'?'on':''}">${t('home')}</button>
  <button data-go="hist" class="${App.view==='hist'?'on':''}">${t('hist')}</button></div></nav>`;

function homeView(){
  const mods = Object.values(MODULES);
  const bigs = mods.filter(m=>m.big).map(m=>`<button class="big ${m.big==='fill'?'fill':'line'}" data-go="${m.id}"><div><b>${t(m.titleKey)}</b><span>${t(m.subKey)}</span></div></button>`).join('');
  const tiles = mods.filter(m=>!m.big).map(m=>`<button class="tile link" data-go="${m.id}">${t(m.titleKey)}</button>`).join('')
    + SOON.map(k=>`<div class="tile">${t(k)}<small>${t('soon')}</small></div>`).join('');
  const rec = App.hist.slice(0,3).map(h=>`<div class="item"><div class="k">${esc(h.title)}</div><div class="v">${esc(h.result)}</div></div>`).join('')
    || `<div class="empty">${t('none')}</div>`;
  return `<div class="top"><div><div class="brand">ElectroMind</div><div class="sub">${t('sub')}</div></div>${langBar()}</div>
  <div class="sub" style="padding:4px 20px">${t('hello')}</div>${bigs}
  <div class="grid">${tiles}</div>
  <div class="sec"><span>${t('recent')}</span><a href="#" data-go="hist" style="color:var(--primary);font-weight:600;text-decoration:none">${t('all')}</a></div>${rec}${navBar()}`;
}
function histView(){
  const list = App.hist.map(h=>`<div class="item"><div class="k">${esc(h.title)} · ${esc(h.when)}</div><div class="v">${esc(h.result)}</div></div>`).join('')
    || `<div class="empty">${t('none')}</div>`;
  return `${topBar(t('hist'))}${list}${App.hist.length?`<button class="clear" id="clr">${t('clear')}</button>`:''}${navBar()}`;
}

function render(){
  const m = MODULES[App.view];
  $('#app').innerHTML = App.view==='hist' ? histView() : m ? m.render() : homeView();
  if(m) m.update();
  document.documentElement.lang = App.lang;
  window.scrollTo(0,0);
}

document.addEventListener('click',e=>{
  const el = e.target.closest('[data-go],[data-lang],[data-v],[data-chem],[data-mat],[data-ftype],[data-act],#save,#clr');
  if(!el) return;
  if(el.dataset.go){e.preventDefault();App.view=el.dataset.go;render();return}
  if(el.dataset.lang){App.lang=el.dataset.lang;store.set('em_lang',App.lang);render();return}
  const m = MODULES[App.view];
  if(m && m.click(el)) return;
  if(el.id==='save'){
    if(!App.last) return;
    App.hist.unshift({...App.last,when:new Date().toLocaleString(App.lang==='en'?'en-IN':'mr-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})});
    App.hist = App.hist.slice(0,50);
    store.set('em_hist',App.hist);
    toast(t('saved'));
    return;
  }
  if(el.id==='clr'){App.hist=[];store.set('em_hist',App.hist);render()}
});
document.addEventListener('input',e=>{
  const m = MODULES[App.view];
  if(m && e.target.matches('.f input')) m.update();
});
render();
