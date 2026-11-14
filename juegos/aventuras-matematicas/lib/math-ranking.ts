import {createTree,createClimb,setClimbStart,splitNode,mergeNodes,removeNodes,circleNode,finishTree,addJump,crossClimbStart,branchClimb,finishClimb,treeComplete,createDresses,dressRow,finishDresses,dressComplete,createSacks,estimateSack,joinSack,finishSack,createSackHunt,solveSackHunt,validateMultiplication} from '../public/engine.js';
export const CLASSES=['1','2','3','4','5','6'].flatMap(g=>['A','B','C','D'].map(c=>g+c));
export const RANK_GROUPS=['1','2','3','4','5','6',...CLASSES];
export const MODES=['add','subtract','climb','dresses','sacks','sackhunt','multiply'];
export function scoreForTime(ms:number,level=1){const seconds=Math.max(0,Math.floor(ms/1000));const bonus=Math.max(0,50-Math.floor(seconds/3));const base=100*level;return {points:base+bonus,base,bonus,seconds};}
export function validateSolution(op:any,actions:any[]){
 if(!Array.isArray(actions)||actions.length<1||actions.length>200)throw Error('La operación necesita pasos válidos.');
 if(op.mode==='multiply')return validateMultiplication(op,actions);
 if(op.mode==='sackhunt'){let s=createSackHunt(op);for(const a of actions){if(a?.type!=='solveSackHunt')throw Error('Paso inválido.');s=solveSackHunt(s,a.ids)}if(!s.finished)throw Error('Completa el reto.');return true;}
 if(['dresses','sacks'].includes(op.mode)){let s:any=op.mode==='dresses'?createDresses(op):createSacks(op);for(const a of actions){if(!a||typeof a!=='object')throw Error('Paso inválido.');if(op.mode==='dresses'){if(a.type==='dressRow')s=dressRow(s,a.row,a.values);else if(a.type==='finishDresses')s=finishDresses(s,a.totals,a.answer);else throw Error('Completa las dos descomposiciones.')}else{if(a.type==='estimateSack')s=estimateSack(s,a.rounds,a.estimate);else if(a.type==='joinSack')s=joinSack(s,a.ids,a.answer);else if(a.type==='finishSack')s=finishSack(s,a.answer,a.difference);else throw Error('Paso inválido para el saco.')}}if(!(op.mode==='dresses'?dressComplete(s):s.finished))throw Error('Completa todos los pasos.');return true;}
 let state:any=op.mode==='climb'?createClimb(op,actions.some(a=>a?.type==='startClimb')):createTree(op);
 for(const action of actions){if(!action||typeof action!=='object')throw Error('Paso inválido.');const n=(v:any)=>Number.isSafeInteger(v)&&v>=0;if(['split','circle'].includes(action.type)&&!n(action.id))throw Error('Número de rama inválido.');if(['merge','remove'].includes(action.type)&&(!Array.isArray(action.ids)||action.ids.length>50||!action.ids.every(n)))throw Error('Ramas inválidas.');if(action.type==='split'&&(!Array.isArray(action.values)||action.values.length>6))throw Error('Descomposición inválida.');
  if(op.mode==='climb'){switch(action.type){case 'startClimb':state=setClimbStart(state,action.answer);break;case 'jump':state=addJump(state,action.amount,action.landing);break;case 'cross':state=crossClimbStart(state);break;case 'branch':state=branchClimb(state);break;case 'finishClimb':state=finishClimb(state,action.answer);break;default:throw Error('Paso no válido para el rocódromo.')}}
  else{switch(action.type){case 'split':state=splitNode(state,action.id,action.values);break;case 'merge':state=mergeNodes(state,action.ids,action.answer);break;case 'remove':state=removeNodes(state,action.ids);break;case 'circle':if(op.mode!=='subtract')throw Error('En la suma no rodeamos.');state=circleNode(state,action.id);break;case 'finishTree':state=finishTree(state,action.answer);break;default:throw Error('Paso no válido para el árbol.')}}
 }
 if(!(op.mode==='climb'?state.finished:treeComplete(state)))throw Error('Completa la estructura y el resultado para guardar puntos.');return true;
}

export function rankingQuery(params:URLSearchParams){
 const room=params.get('room')||'all',mode=params.get('mode')||'all',level=params.get('level')||'all';
 if((room!=='all'&&!RANK_GROUPS.includes(room))||(mode!=='all'&&!MODES.includes(mode))||(level!=='all'&&!['1','2','3','4'].includes(level)))throw Error('Elige filtros válidos para el ranking.');
 const where=['finished>0'],values:(string|number)[]=[];
 if(room!=='all'){where.push('math_runs.room LIKE ?');values.push(room.length===1?room+'%':room)}
 if(mode!=='all'){where.push('mode=?');values.push(mode)}
 if(level!=='all'){where.push('level=?');values.push(Number(level))}
 return {sql:'SELECT math_runs.name,math_runs.room,pupil_accounts.avatar,pupil_accounts.code,SUM(points) AS points,COUNT(*) AS operations,ROUND(AVG(seconds)) AS seconds FROM math_runs LEFT JOIN pupil_accounts ON pupil_accounts.id=math_runs.account_id WHERE '+where.join(' AND ')+' GROUP BY math_runs.room,COALESCE(math_runs.account_id,lower(math_runs.name)),math_runs.account_id ORDER BY points DESC,operations DESC,seconds ASC,math_runs.name ASC LIMIT 100',values};
}
