"use strict";
(function(){
const W_ = store.get('em_w',{V:12,I:10,L:5,drop:3,mat:'cu'});
registerModule({
  id:'wire', big:'line', titleKey:'wire', subKey:'wireS',
  render(){
    return `${topBar(t('wire'))}
    <div id="out"></div>
    <div class="chips">${[12,24,48].map(v=>chip('data-v',v,v+'V',W_.V==v)).join('')}${['cu','al'].map(m=>chip('data-mat',m,t(m),W_.mat===m)).join('')}</div>
    <div class="fields">${field('I',t('A'),W_.I)}${field('L',t('L'),W_.L)}${field('drop',t('md'),W_.drop)}</div>
    <div class="fields two" style="padding-top:8px">${field('V',t('V'),W_.V)}</div>
    <div class="actions"><button class="save" id="save">${t('save')}</button></div>`;
  },
  update(){
    W_.V=num($('#V').value);W_.I=num($('#I').value);W_.L=num($('#L').value);W_.drop=num($('#drop').value);
    store.set('em_w',W_);
    if(![W_.V,W_.I,W_.L,W_.drop].every(x=>x>0)){App.last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('wbad')}</div></div>`;return}
    const r=wireCalc(W_.V,W_.I,W_.L,W_.drop,W_.mat);
    if(!r){App.last=null;$('#out').innerHTML=`<div class="res bad"><div class="d">${t('wbig')}</div></div>`;return}
    App.last={title:`${t('wire')} · ${fmt(W_.V,1)}V ${fmt(W_.I,1)}A ${fmt(W_.L,1)}m`,result:`${r.size} mm² (≈ ${AWG[r.size]} AWG)`};
    $('#out').innerHTML=`<div class="res"><div class="l">${t('right')}</div>
     <div class="n">${r.size} mm² <span style="font-size:18px">(≈ ${AWG[r.size]} AWG)</span></div>
     <div class="d">${t('dropT')} ${fmt(r.dropPct,1)} % (${fmt(r.drop,2)} V)${r.fuse?` · ${t('fuseT')} ${r.fuse} A`:''}</div></div>
     <div class="meter"><div class="r"><span>${t('dropT')}</span><b>${fmt(r.dropPct,1)} % / ${t('limit')} ${fmt(W_.drop,1)} %</b></div>
     <div class="track"><div class="fillbar" style="width:${Math.min(100,r.dropPct/W_.drop*100)}%"></div></div></div>
     <div class="note">${t('wnote')}</div>`;
  },
  click(el){
    if(el.dataset.v){$('#V').value=el.dataset.v;setOn('[data-v]',el);this.update();return true}
    if(el.dataset.mat){W_.mat=el.dataset.mat;setOn('[data-mat]',el);this.update();return true}
    return false;
  }
});
})();
