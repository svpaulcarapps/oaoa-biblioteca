export const DEFAULT_SCHOOL='sv-cartagena';
export const SCHOOLS=[
 {id:'sv-cartagena',name:'San Vicente de Paúl (Cartagena)'},
 {id:'sc-cartagena',name:'Sagrado Corazón (Cartagena)'},
 {id:'sv-palmar',name:'San Vicente de Paúl (El Palmar)'},
 {id:'inmaculada-yecla',name:'La Inmaculada (Yecla)'}
];
export const schoolName=id=>SCHOOLS.find(s=>s.id===(id||DEFAULT_SCHOOL))?.name||'Colegio';
export const schoolOptions=(selected=DEFAULT_SCHOOL,all=false)=>`${all?'<option value="all">Todos los colegios</option>':''}${SCHOOLS.map(s=>`<option value="${s.id}" ${s.id===selected?'selected':''}>${s.name}</option>`).join('')}`;
