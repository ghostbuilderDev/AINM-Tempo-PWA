/* AINM Tempo — regroupement des affectations par chantier / journée / séance.
   Aucun nom, numéro ou donnée de personnel n'est livré avec ce fichier. */
(function(root, factory){
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TempoPlanningCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function(){
  'use strict';
  const THEMES = Object.freeze({
    'AINM-CHANTIER-MONTEREAU':['#236ac0','#eaf3ff'],
    'AINM-CHANTIER-THOMERY':['#a76e09','#fff3d2'],
    'AINM-CHANTIER-CEPOY':['#b7356b','#ffe9f1'],
    'AINM-CHANTIER-SAMOIS':['#287d4a','#e5f7e8'],
    'AINM-CHANTIER-MTRO':['#6e4aaa','#eee6ff'],
    'AINM-CHANTIER-RCT':['#bd4c45','#ffeae7'],
    'AINM-CHANTIER-PMP-GARENNE-BETZ':['#197c79','#e1f6f1'],
    'AINM-CHANTIER-PMP-NEMOURS-CHALET-GARENNE':['#37618d','#e5f0ff'],
    'AINM-CHANTIER-PMP-MEE':['#95519b','#f8eaff'],
    'AINM-CHANTIER-ETALONNAGE':['#427c63','#e1f5eb']
  });
  const FALLBACK=[['#356b86','#e7f3f7'],['#805692','#f5eafb'],['#916a35','#faf0de'],['#447b63','#e8f6ed']];
  function theme(id){if(THEMES[id])return {accent:THEMES[id][0],soft:THEMES[id][1]};let h=0;for(const c of String(id||''))h=(h*31+c.charCodeAt(0))>>>0;const p=FALLBACK[h%FALLBACK.length];return {accent:p[0],soft:p[1]};}
  function cleanTime(value){const s=String(value||'').trim().replace(/[hH]/,':');return /^\d{1,2}:\d{2}$/.test(s)?s.padStart(5,'0'):'22:00';}
  function minutes(value){const [h,m]=cleanTime(value).split(':').map(Number);return h*60+m;}
  function isNight(m){const start=minutes(m.debut),end=minutes(m.fin);return start>=18*60 || (end<start && start>=15*60) || (start<5*60 && end<8*60);}
  function agentKey(m){const raw=String(m.agent_source||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/\s+/g,' ');return m.agent_id ? 'id:'+m.agent_id : raw ? 'source:'+raw : 'ligne:'+String(m.id||m.ligne||'inconnue');}
  function groupSessions(items){
    const sessions=new Map();
    for(const m of items||[]){
      const debut=cleanTime(m.debut),fin=cleanTime(m.fin),key=debut+'|'+fin;
      if(!sessions.has(key))sessions.set(key,{key,debut,fin,items:[],night:isNight(m)});
      sessions.get(key).items.push(m);
    }
    return [...sessions.values()].map(s=>({...s,agentCount:new Set(s.items.map(agentKey)).size})).sort((a,b)=>minutes(a.debut)-minutes(b.debut));
  }
  function groupBySiteAndDay(missions){
    const all=new Map();
    for(const m of missions||[]){
      if(!m.date||!m.chantier_id)continue;
      const key=m.date+'|'+m.chantier_id;
      if(!all.has(key))all.set(key,{key,date:m.date,chantier_id:m.chantier_id,items:[]});
      all.get(key).items.push(m);
    }
    return [...all.values()].map(g=>({...g,sessions:groupSessions(g.items),agentsCount:new Set(g.items.map(agentKey)).size,missionsCount:g.items.filter(m=>String(m.mission_securite_demandee||'').trim()).length,nightCount:g.items.filter(isNight).length})).sort((a,b)=>a.date.localeCompare(b.date)||a.chantier_id.localeCompare(b.chantier_id));
  }
  function weekDays(start){const d=new Date(start.getFullYear(),start.getMonth(),start.getDate());return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(x.getDate()+i);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;});}
  function filterWeek(missions,dates,mode){const range=new Set(dates);return (missions||[]).filter(m=>range.has(m.date) && (mode==='all'||(mode==='night'?isNight(m):mode==='day'?!isNight(m):mode==='security'?Boolean(String(m.mission_securite_demandee||'').trim()):true)));}
  return {THEMES,theme,cleanTime,minutes,isNight,agentKey,groupSessions,groupBySiteAndDay,weekDays,filterWeek};
});
