"use strict";
const CHEM = {lead:{dod:50,eff:85}, agm:{dod:60,eff:85}, lfp:{dod:80,eff:95}};
const SIZES = [0.5,0.75,1,1.5,2.5,4,6,10,16,25,35,50,70,95];            // mm²
const AMPS  = {0.5:5,0.75:8,1:10,1.5:15,2.5:20,4:30,6:40,10:60,16:80,25:110,35:140,50:170,70:215,95:260}; // rough limits (Cu)
const AWG   = {0.5:"20",0.75:"18",1:"17",1.5:"16",2.5:"14",4:"12",6:"10",10:"8",16:"6",25:"4",35:"2",50:"1/0",70:"2/0",95:"3/0"};
const FUSES = [1,2,3,5,7.5,10,15,20,25,30,40,50,60,80,100,125,150,200];
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
