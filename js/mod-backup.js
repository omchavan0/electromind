"use strict";
(function(){
const B = store.get('em_b',{V:12,Ah:80,W:250,chem:'lead',dod:50,eff:85});
registerModule({
  id:'backup', big:'fill', titleKey:'backup', subKey:'backupS',
  render(){
    return `${topBar(t('backup'))}
    <div id="out"></div>
    <div class="chips">${[12,24,48].map(v=>chip('data-v',v,v+'V',B.V==v)).join('')}</div>
    <div class="lab">${t('chem')}</div>
    <div class="chips">${['lead','agm','lfp'].map(c=>chip('data-chem',c,t(c),B.chem===c)).join('')}</div>
    <div class="fields">${field('V',t('V'),B.V)}${field('Ah',t('Ah'),B.Ah)}${field('W',t('W'),B.W)}</div>
    <div class="fields two" style="padding-top:8px">${field('dod',t('dod'),B.dod)}${field('eff',t('eff'),B.eff)}</div>
    <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
  },
  update(){
    B.V=num($('#V').value);B.Ah=num($('#Ah').value);B.W=num($('#W').value);B.dod=num($('#dod').value);B.eff=num($('#eff').value);
    store.set('em_b',B);
    const ok=[B.V,B.Ah,B.W].every(x=>x>0)&&B.dod>=1&&B.dod<=100&&B.eff>=1&&B.eff<=100;
    if(!ok){App.last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('bad')}</div></div>`;return}
    const r=backupCalc(B.V,B.Ah,B.W,B.dod,B.eff);
    const txt=`${digits(r.h)} ${t('hr')} ${digits(r.m)} ${t('mn')}`;
    App.last={title:`${t('backup')} · ${fmt(B.V,1)}V ${fmt(B.Ah,1)}Ah ${fmt(B.W,0)}W`,result:txt};
    const peuk=(B.chem!=='lfp'&&r.amps>B.Ah/5)?`<div class="note">${t('peuk')}</div>`:'';
    $('#out').innerHTML=`<div class="res"><div class="l">${t('est')}</div><div class="n">${txt}</div>
     <div class="d">${t('usable')}: ${fmt(r.usableWh,0)} Wh ÷ ${fmt(B.W,0)} W</div></div>${peuk}<div class="note">${t('bnote')}</div>`;
  },
  click(el){
    if(el.dataset.v){$('#V').value=el.dataset.v;setOn('[data-v]',el);this.update();return true}
    if(el.dataset.chem){B.chem=el.dataset.chem;$('#dod').value=CHEM[B.chem].dod;$('#eff').value=CHEM[B.chem].eff;setOn('[data-chem]',el);this.update();return true}
    return false;
  }
});
})();
