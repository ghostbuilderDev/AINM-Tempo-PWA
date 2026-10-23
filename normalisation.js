/* AINM Tempo : regrouper les variations WE / WER / SQ en chantiers génériques.
   Ce fichier ne contient AUCUNE donnée de personnel ni affectation.
   LAPLACE est la seule source d'identifiants d'origine ; la correspondance est conservée. */
'use strict';
const TEMPO_GROUPES = [{"id":"AINM-CHANTIER-MONTEREAU","nom":"Chantier Montereau","type":"chantier","sources":["LAPLACE-6","LAPLACE-15","LAPLACE-16","LAPLACE-17","LAPLACE-18","LAPLACE-19","LAPLACE-20","LAPLACE-21","LAPLACE-23","LAPLACE-24","LAPLACE-25","LAPLACE-26","LAPLACE-27","LAPLACE-30"]},{"id":"AINM-CHANTIER-THOMERY","nom":"Chantier Thomery","type":"chantier","sources":["LAPLACE-29","LAPLACE-35","LAPLACE-36","LAPLACE-37","LAPLACE-41","LAPLACE-42","LAPLACE-43","LAPLACE-45"]},{"id":"AINM-CHANTIER-CEPOY","nom":"Chantier Cepoy","type":"chantier","sources":["LAPLACE-28","LAPLACE-32","LAPLACE-33","LAPLACE-34","LAPLACE-38","LAPLACE-39","LAPLACE-40","LAPLACE-44"]},{"id":"AINM-CHANTIER-SAMOIS","nom":"Chantier Samois","type":"chantier","sources":["LAPLACE-5","LAPLACE-7","LAPLACE-8","LAPLACE-9","LAPLACE-10","LAPLACE-11","LAPLACE-12","LAPLACE-13","LAPLACE-48"]},{"id":"AINM-CHANTIER-MTRO","nom":"Chantier MTRO","type":"chantier","sources":["LAPLACE-2"]},{"id":"AINM-CHANTIER-RCT","nom":"Chantier RCT","type":"chantier","sources":["LAPLACE-3","LAPLACE-4","LAPLACE-22"]},{"id":"AINM-CHANTIER-PMP-GARENNE-BETZ","nom":"Chantier PMP Garenne–Betz","type":"chantier","sources":["LAPLACE-1"]},{"id":"AINM-CHANTIER-PMP-NEMOURS-CHALET-GARENNE","nom":"Chantier PMP Nemours–Chalet–Garenne","type":"chantier","sources":["LAPLACE-14","LAPLACE-47"]},{"id":"AINM-CHANTIER-PMP-MEE","nom":"Chantier PMP du Mée","type":"chantier","sources":["LAPLACE-31"]},{"id":"AINM-CHANTIER-ETALONNAGE","nom":"Chantier Étalonnage","type":"chantier","sources":["LAPLACE-46"]}];
function normaliseBase(d){
  if(!d || !Array.isArray(d.CH) || !Array.isArray(d.AG) || !Array.isArray(d.MI) || !Array.isArray(d.PL)) {
    throw Error('Format de base AINM non reconnu');
  }
  const chantierId='AINM-CHANTIER-ETALONNAGE';
  const ancienId='AINM-ACTIVITE-ETALONNAGE';
  const titre='Chantier Étalonnage';
  const existe=d.CH.some(x=>x.chantier_id===chantierId);
  const ancienneActivite=(d.ACT||[]).find(x=>x.chantier_id===ancienId);
  // La mise à niveau est idempotente : un second import ne dédouble pas le chantier.
  if(d.version>=3 && existe && !ancienneActivite) return d;
  if(d.version>=2){
    const CH=d.CH.map(x=>({...x}));
    const ACT=(d.ACT||[]).filter(x=>x.chantier_id!==ancienId).map(x=>({...x}));
    if(!existe && ancienneActivite) {
      CH.push({...ancienneActivite,chantier_id:chantierId,chantier:titre,categorie:'chantier',source:'LAPLACE (chantier générique)'});
    } else if(!existe) {
      throw Error('Chantier Étalonnage absent de cette base. Aucune donnée remplacée.');
    }
    const MI=d.MI.map(m=>m.chantier_id===ancienId ? {...m,
      chantier_id:chantierId, chantier:titre, type_affectation:'chantier'} : {...m});
    return {...d,version:3,format:'ainm-tempo-prive-10-chantiers-generiques-2026',CH,ACT,MI,
      META:{...(d.META||{}),chantiers_generiques:CH.length,activites_transversales:ACT.length,
        note:'Étalonnage est un chantier générique ; phases LAPLACE conservées en traçabilité.'}};
  }
  // Migration directe depuis le JSON LAPLACE initial (v1, 48 libellés).
  const idx = new Map(TEMPO_GROUPES.flatMap(g=>g.sources.map(s=>[s,g])));
  const inconnus = d.CH.filter(c=>!idx.has(c.chantier_id));
  if(inconnus.length) throw Error('Regroupement incomplet : '+inconnus.length+' chantier(s) inconnu(s).');
  const parId = new Map(d.CH.map(c=>[c.chantier_id,c]));
  const comptage = new Map();
  for(const m of d.MI) comptage.set(m.chantier_id,(comptage.get(m.chantier_id)||0)+1);
  const CH=[];const ACT=[];
  for(const g of TEMPO_GROUPES){
    const src=g.sources.map(id=>parId.get(id)).filter(Boolean);
    if(!src.length) continue;
    const contacts=[...new Set(src.map(x=>x.contact).filter(Boolean))];
    const tels=[...new Set(src.map(x=>x.telephone_contact).filter(Boolean))];
    const obj={chantier_id:g.id,chantier:g.nom,categorie:g.type,compte:src[0].compte||'',
      contact:contacts.join(' ; '),telephone_contact:tels.join(' / '),contacts,
      source:'LAPLACE (regroupement par chantier générique)',
      lignes_source:src.reduce((n,x)=>n+(+x.lignes_source||0),0),
      nb_affectations:g.sources.reduce((n,id)=>n+(comptage.get(id)||0),0),
      nb_libelles_laplace:src.length,
      anciens_chantiers:src.map(x=>({chantier_id:x.chantier_id,libelle_laplace:x.chantier,
        nb_affectations:comptage.get(x.chantier_id)||0,
        etat_source:/ANNULE/i.test(x.chantier)?'annulé':'mentionné'}))};
    (g.type==='activite'?ACT:CH).push(obj);
  }
  const MI=d.MI.map(m=>{
    const g=idx.get(m.chantier_id);
    if(!g) throw Error('Affectation avec chantier inconnu : '+m.chantier_id);
    return {...m,chantier_id_source:m.chantier_id,chantier_source:m.chantier,
      chantier_id:g.id,chantier:g.nom,type_affectation:g.type};
  });
  return {version:3,format:'ainm-tempo-prive-10-chantiers-generiques-2026',
    META:{chantiers_sources:d.CH.length,chantiers_generiques:CH.length,activites_transversales:ACT.length,
      agents:d.AG.length,affectations:MI.length,annotations_planning:d.PL.length},
    CH,ACT,AG:d.AG,MI,PL:d.PL};
}
