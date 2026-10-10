"use strict";
(function(){
const F = store.get('em_f',{V:12,W:250,type:'normal'});
registerModule({
  id:'fuse', titleKey:'fuse', subKey:'fuseS',
  render(){
    return `${topBar(t('fuse'))}
    <div id="out"></div>
    <div class="chips">${[12,24,48].map(v=>chip('data-v',v,v+'V',F.V==v)).join('')}</div>
    <div class="lab">${t('ltype')}</div>
    <div class="chips">${[['normal','lnorm'],['motor','lmotor']].map(([k,l])=>chip('data-ftype',k,t(l),F.type===k)).join('')}</div>
    <div class="fields two">${field('V',t('V'),F.V)}${field('W',t('W'),F.W)}</div>
    <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
  },
  update(){
    F.V=num($('#V').value);F.W=num($('#W').value);
    store.set('em_f',F);
    if(!(F.V>0&&F.W>0)){App.last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('fbad')}</div></div>`;return}
    const r=fuseCalc(F.V,F.W,F.type);
    if(!r.fuse||!r.relay){App.last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('fbig')}</div></div>`;return}
    App.last={title:`${t('fuse')} · ${fmt(F.V,1)}V ${fmt(F.W,0)}W`,result:`${r.fuse} A`};
    $('#out').innerHTML=`<div class="res"><div class="l">${t('fuseRec')}</div><div class="n">${r.fuse} A</div>
     <div class="d">${t('cur')} ${fmt(r.I,1)} A · ${t('relayT')} ${r.relay} A · ${t('wireMin')} ${r.wire} mm²</div></div>
     ${F.type==='motor'?`<div class="note">${t('fmotor')}</div>`:''}<div class="note">${t('fnote')}</div>`;
  },
  click(el){
    if(el.dataset.v){$('#V').value=el.dataset.v;setOn('[data-v]',el);this.update();return true}
    if(el.dataset.ftype){F.type=el.dataset.ftype;setOn('[data-ftype]',el);this.update();return true}
    return false;
  }
});
})();
