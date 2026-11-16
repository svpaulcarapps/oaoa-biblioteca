import {wordProblem} from './word-problems.js';
export {validateMultiplication} from './multiplication.js';
import {nextMultiplication,validMultiplicationSeed} from './multiplication.js';
export const LABELS={problems:'Problemas de suma y resta',add:'Suma en árbol',subtract:'Resta en árbol',climb:'Rocódromo',dresses:'Suma en vestidos',sacks:'Sacos de Paco',sackhunt:'Reto de Paco',multiply:'Problemas de multiplicación',geoboard:'El geoplano'};
export const sum=ns=>ns.reduce((a,b)=>a+b,0);
export const isAddition=mode=>['add','dresses','sacks','sackhunt'].includes(mode);
const integer=n=>Number.isInteger(n)&&n>=0;
const copy=v=>structuredClone(v);
export class OperationHistory{
 constructor(saved={}){this.saved=saved;this.cache=new Map()}
 bucket(kind,digits){const key=(kind==='multiply'?'multiply':kind==='sacks'?'sacks':isAddition(kind)?'add':'sub')+digits;if(!this.cache.has(key)){let bits=new Uint8Array(10**(digits*2)/8);try{const raw=this.saved[key];if(raw){const text=atob(raw);if(text.length===bits.length)bits=Uint8Array.from(text,c=>c.charCodeAt(0))}}catch{}this.cache.set(key,bits)}return this.cache.get(key)}
 key(kind,digits,a,b){if(kind==='sacks'&&digits===2)return a+b;if(isAddition(kind)&&a>b)[a,b]=[b,a];return a*10**digits+b}
 has(kind,digits,a,b){const n=this.key(kind,digits,a,b);return !!(this.bucket(kind,digits)[n>>3]&(1<<(n%8)))}
 mark(kind,digits,a,b){const n=this.key(kind,digits,a,b);this.bucket(kind,digits)[n>>3]|=1<<(n%8)}
 serialize(){const out={...this.saved};for(const [key,bits]of this.cache){let text='';for(let i=0;i<bits.length;i+=8192)text+=String.fromCharCode(...bits.subarray(i,i+8192));out[key]=btoa(text)}return out}
}
export const DIFFICULTIES=[{id:1,label:'Empiezo',digits:2},{id:2,label:'Avanzo',digits:2},{id:3,label:'Reto',digits:3},{id:4,label:'Experto',digits:3}];
export function fitsDifficulty(mode,a,b,level){if(mode==='problems')return fitsDifficulty(wordProblem({a,b}).operation,a,b,level);if(mode==='multiply')return validMultiplicationSeed(a,b,level);if(!level)return true;if(isAddition(mode)){const units=a%10+b%10,tens=Math.floor(a/10)%10+Math.floor(b/10)%10+(units>=10?1:0);return level===1?units<10:level===2?units>=10:level===3?true:units>=10&&tens>=10}if(mode==='climb')return level===1?a-b<=20:level===2?a-b>20:level===3?true:a-b>=100;return level===1?a%10>=b%10:level===2?a%10<b%10:level===3?true:a%100<b%100&&a%10<b%10}
export function nextOperation(mode,digits,history,difficulty){
 if(mode==='multiply')return nextMultiplication(history,difficulty);
 if(!Object.hasOwn(LABELS,mode)||![2,3].includes(digits))throw Error('Elige una ruta y un nivel.');
 const min=10**(digits-1),max=10**digits-1;
 const use=(a,b)=>{if(isAddition(mode)&&a>b)[a,b]=[b,a];if(!isAddition(mode)&&a<b)[a,b]=[b,a];if(!isAddition(mode)&&a===b)return null;if(!fitsDifficulty(mode,a,b,difficulty))return null;if(history.has(mode,digits,a,b))return null;history.mark(mode,digits,a,b);return {mode,digits,a,b,level:difficulty}};
 for(let i=0;i<300;i++){const a=min+Math.floor(Math.random()*(max-min+1)),b=min+Math.floor(Math.random()*(max-min+1));const op=use(a,b);if(op)return op}
 for(let a=min;a<=max;a++)for(let b=min;b<=max;b++){const op=use(a,b);if(op)return op}
 throw Error('Has recorrido todas las operaciones de este nivel. Cambia de nivel para seguir sin repeticiones.');
}
const node=(id,value,x,y,kind='part')=>({id,value,x,y,kind,active:true,removed:false});
export function createTree(op){return {op,nodes:op.mode==='add'?[node(0,op.a,260,65,'root'),node(1,op.b,640,65,'root')]:[node(0,op.a,300,65,'root'),{...node(1,op.b,640,65,'operand'),active:false,fixed:true}],edges:[],serial:2,splits:0,removed:0,answer:null,actions:[],log:[]}}
export const activeNodes=s=>s.nodes.filter(n=>n.active);
function getNodes(s,ids){const ns=ids.map(id=>s.nodes.find(n=>n.id===id&&n.active));if(!ids.length||new Set(ids).size!==ids.length||ns.some(n=>!n))throw Error('Selecciona los números activos con los que quieres trabajar.');return ns}
function place(s,x,y){return {x:Math.max(55,Math.min(845,x)),y}}
// A row may grow wider than the viewport. Never squeeze branches into a fixed canvas.
export const TREE_NODE_GAP=160;
export function alignTree(state){
 const s=copy(state),byId=new Map(s.nodes.map(n=>[n.id,n])),parents=new Map(s.nodes.map(n=>[n.id,[]])),children=new Map(s.nodes.map(n=>[n.id,[]])),depth=new Map(),rows=new Map();
 for(const [p,c] of s.edges){parents.get(c).push(byId.get(p));children.get(p).push(byId.get(c))}
 for(const n of s.nodes){const ps=parents.get(n.id),d=ps.length?Math.max(...ps.map(p=>depth.get(p.id)))+1:0;depth.set(n.id,d);n.y=65+d*120;if(!rows.has(d))rows.set(d,[]);rows.get(d).push(n)}
 for(const ns of rows.values()){
  const groups=new Map();
  for(const n of ns){const ps=parents.get(n.id),key=ps.length===1?'split:'+ps[0].id:'node:'+n.id;if(!groups.has(key))groups.set(key,{nodes:[],center:ps.length?sum(ps.map(p=>p.x))/ps.length:n.x});groups.get(key).nodes.push(n)}
  const ordered=[...groups.values()].sort((a,b)=>a.center-b.center||a.nodes[0].id-b.nodes[0].id);let end=-Infinity;
  for(const group of ordered){const ns=group.nodes;ns.sort((a,b)=>a.id-b.id);const left=Math.max(65,group.center-(ns.length-1)*TREE_NODE_GAP/2,end+TREE_NODE_GAP);ns.forEach((n,i)=>n.x=left+i*TREE_NODE_GAP);end=ns.at(-1).x;}
 }
 return s;
}
export function treeNodeX(state,id,wanted){
 const node=state.nodes.find(n=>n.id===id),others=state.nodes.filter(n=>n.id!==id&&Math.abs(n.y-node.y)<70),target=Math.max(65,wanted);
 return [target,65,...others.flatMap(n=>[n.x-TREE_NODE_GAP,n.x+TREE_NODE_GAP])].filter(x=>x>=65&&others.every(n=>Math.abs(n.x-x)>=TREE_NODE_GAP)).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)||a-b)[0]??Math.max(65,...others.map(n=>n.x+TREE_NODE_GAP));
}
export function treeBranchSigns(state){
 const signs=[],placed=new Set();
 for(const parent of state.nodes){const children=state.edges.filter(e=>e[0]===parent.id).map(e=>state.nodes.find(n=>n.id===e[1])).sort((a,b)=>a.x-b.x);
  for(let i=1;i<children.length;i++){
   const a=children[i-1],b=children[i];if(Math.abs(a.y-b.y)>45)continue;const y=(a.y+b.y)/2,row=state.nodes.filter(n=>Math.abs(n.y-y)<65).sort((a,b)=>a.x-b.x),mid=(a.x+b.x)/2;
   const candidates=[mid,...row.slice(1).map((n,j)=>(row[j].x+n.x)/2)].filter(x=>x>a.x&&x<b.x&&row.every(n=>Math.abs(n.x-x)>=72)&&signs.every(sign=>Math.abs(sign.y-y)>45||Math.abs(sign.x-x)>=35));
   candidates.sort((x,z)=>Math.abs(x-mid)-Math.abs(z-mid));if(!candidates.length)continue;const x=candidates[0],key=x+':'+y;if(!placed.has(key)){placed.add(key);signs.push({x,y})}
  }
 }
 return signs;
}
export function splitNode(state,id,values){const s=copy(state),[parent]=getNodes(s,[id]);if(values.length<2||values.length>6||values.some(n=>!integer(n)))throw Error('Escribe entre dos y seis cantidades enteras, sin números negativos.');if(!parent.value)throw Error('El cero ya no necesita más ramas.');if(sum(values)!==parent.value)throw Error(`Las ramas deben sumar ${parent.value}. Ahora suman ${sum(values)}.`);if(values.some(v=>v===parent.value))throw Error('Prueba una descomposición que reparta la cantidad en partes más pequeñas.');parent.active=false;parent.circled=s.op.mode==='subtract';s.splits++;values.forEach((v,i)=>{const pos=place(s,parent.x+(i-(values.length-1)/2)*145,parent.y+110),n=node(s.serial++,v,pos.x,pos.y);s.nodes.push(n);s.edges.push([parent.id,n.id])});s.log.push(`${parent.value} = ${values.join(' + ')}`);s.actions.push({type:'split',id,values});return alignTree(s)}
export function mergeNodes(state,ids,answer){const s=copy(state),ns=getNodes(s,ids);if(ns.length<2)throw Error('Selecciona al menos dos números para reunirlos.');if(!s.splits)throw Error('Abre alguna rama antes de reunir: queremos ver tu estrategia.');const expected=sum(ns.map(n=>n.value));if(!integer(answer)||answer!==expected)throw Error(`Revisa la suma de ${ns.map(n=>n.value).join(' + ')}. Las cantidades deben conservarse.`);const pos=place(s,sum(ns.map(n=>n.x))/ns.length,Math.max(...ns.map(n=>n.y))+120),n=node(s.serial++,answer,pos.x,pos.y,'group');for(const p of ns){p.active=false;s.edges.push([p.id,n.id])}s.nodes.push(n);s.log.push(`${ns.map(n=>n.value).join(' + ')} = ${answer}`);s.actions.push({type:'merge',ids,answer});return alignTree(s)}
export function circleNode(state,id){const s=copy(state),[n]=getNodes(s,[id]);n.circled=!n.circled;s.actions.push({type:'circle',id});return s}
export function removeNodes(state,ids){const s=copy(state);if(s.op.mode!=='subtract')throw Error('Solo tachamos cantidades en la resta.');const ns=getNodes(s,ids),total=sum(ns.map(n=>n.value)),remaining=s.op.b-s.removed;if(!remaining)throw Error('Ya has tachado todo el sustraendo. Reúne lo que queda.');if(total<=0)throw Error('Selecciona una cantidad mayor que cero.');if(total>remaining)throw Error(`Solo quedan ${remaining} por tachar. Has seleccionado ${total}; puedes descomponer esas ramas en partes más pequeñas.`);for(const n of ns){n.active=false;n.removed=true}s.removed+=total;s.log.push(`Tacho ${ns.map(n=>n.value).join(' + ')}: ${s.removed} de ${s.op.b} quitados`);s.actions.push({type:'remove',ids});return s}
export function treeComplete(s){const ns=activeNodes(s);return s.splits>0&&ns.length===1&&ns[0].value===(isAddition(s.op.mode)?s.op.a+s.op.b:s.op.a-s.op.b)&&(isAddition(s.op.mode)||(s.removed===s.op.b&&s.answer===s.op.a-s.op.b))}
export function finishTree(state,answer){let s=copy(state);if(s.op.mode!=='subtract'||s.removed!==s.op.b)throw Error('Tacha primero las partes del sustraendo.');if(!integer(answer)||answer!==s.op.a-s.op.b)throw Error('Revisa las partes que quedan sin tachar.');const ns=activeNodes(s);if(ns.length>1)s=mergeNodes(s,ns.map(n=>n.id),answer);s.answer=answer;s.actions.push({type:'finishTree',answer});return s}
export function createClimb(op,manualStart=false){return {op,needsStart:manualStart,start:manualStart?null:op.b,current:manualStart?null:op.b,jumps:[],log:[],crossedStart:false,branched:false,finished:false,actions:[]}}
export function setClimbStart(state,answer){const s=copy(state);if(!s.needsStart)throw Error('El punto de partida ya está escrito.');if(!Number.isInteger(answer)||answer!==s.op.b)throw Error('Revisa el número desde el que empieza tu camino.');s.start=answer;s.current=answer;s.needsStart=false;s.actions.push({type:'startClimb',answer});s.log.push(`Punto de partida: ${answer}`);return s}
export function addJump(state,amount,landing){const s=copy(state);if(s.current===null)throw Error('Escribe primero tu punto de partida.');if(!Number.isInteger(amount)||amount<=0||!integer(landing))throw Error('El salto debe ser un número entero mayor que cero.');if(s.current+amount!==landing)throw Error(`Desde ${s.current}, un salto de +${amount} debe llevarte a otro número. Revisa la suma.`);if(landing>s.op.a)throw Error(`Te has pasado de ${s.op.a}. Elige un salto más pequeño.`);s.jumps.push({from:s.current,to:landing,amount});s.log.push(`${s.current} + ${amount} = ${landing}`);s.current=landing;s.actions.push({type:'jump',amount,landing});return s}
export function crossClimbStart(state){const s=copy(state);if(s.current!==s.op.a)throw Error('Completa el camino hasta el minuendo.');s.crossedStart=true;s.log.push(`Tacho ${s.op.b} dentro de la descomposición.`);s.actions.push({type:'cross'});return s}
export function branchClimb(state){const s=copy(state);if(!s.crossedStart)throw Error('Tacha primero el sustraendo en la descomposición.');s.branched=true;s.actions.push({type:'branch'});return s}
export function finishClimb(state,answer){const s=copy(state);if(!s.crossedStart||!s.branched)throw Error('Tacha el sustraendo y ramifica los saltos antes de reunirlos.');if(s.current!==s.op.a)throw Error(`Sigue subiendo hasta ${s.op.a}.`);if(!integer(answer)||answer!==sum(s.jumps.map(j=>j.amount)))throw Error('Reúne los saltos que has dado. La distancia total es el resultado de la resta.');s.finished=true;s.log.push(`${s.op.b} + ${answer} = ${s.op.a}`);s.actions.push({type:'finishClimb',answer});return s}

// Los vestidos: aligned vertical place-value totals, followed by the final sum.
export function createDresses(op){return {op,rows:[null,null],totals:null,answer:null,actions:[],log:[]}}
export function dressRow(state,row,values){const s=copy(state);if(![0,1].includes(row)||s.rows[row])throw Error('Elige una fila sin completar.');const value=row===0?s.op.a:s.op.b;const expected=[Math.floor(value/100)*100,Math.floor(value/10)%10*10,value%10];if(!Array.isArray(values)||values.length!==3||values.some((v,i)=>!integer(v)||v!==expected[i]))throw Error('Comprueba las centenas, decenas y unidades. Escribe su valor: por ejemplo, 30 para tres decenas.');s.rows[row]=values;s.actions.push({type:'dressRow',row,values});s.log.push(`${value} = ${values.join(' + ')}`);return s}
export function finishDresses(state,totals,answer){const s=copy(state);if(!s.rows.every(Boolean))throw Error('Descompón primero los dos sumandos.');if(!Array.isArray(totals)||totals.length!==3||totals.some((n,i)=>!integer(n)||n!==s.rows[0][i]+s.rows[1][i]))throw Error('Suma cada vestido y escribe el resultado justo debajo.');if(!integer(answer)||answer!==sum(totals))throw Error('Reúne los tres resultados para hallar la suma final.');s.totals=totals;s.answer=answer;s.actions.push({type:'finishDresses',totals,answer});s.log.push(`${totals.join(' + ')} = ${answer}`);return s}
export function dressComplete(s){return s.rows.every(Boolean)&&s.answer===s.op.a+s.op.b}
// Stable three-quantity bags from the operation seed. Levels 3–4 also estimate.
export function sackAmounts(op){if((op.level|| (op.digits===3?3:1))<=2){const total=op.a+op.b;const hundreds=Math.floor(total/100)*100,tens=Math.floor(total/10)%10*10,units=total%10;const parts=[hundreds,tens,units].filter(v=>v>0);if(parts.length<3){const i=parts.findIndex(v=>v>=20);if(i>=0){const value=parts.splice(i,1)[0];parts.push(10,value-10)}}return parts}const half=Math.floor(op.b/2);return [op.a,half,op.b-half]}
export function createSacks(op){const amounts=sackAmounts(op);return {op,amounts,pieces:amounts.map((value,id)=>({id,value})),serial:amounts.length,rounds:null,estimate:null,exact:null,difference:null,finished:false,actions:[],log:[]}}
export function estimateSack(state,rounds,estimate){const s=copy(state);if(s.rounds)throw Error('La estimación ya está escrita.');if(!Array.isArray(rounds)||rounds.length!==s.amounts.length||rounds.some((n,i)=>!integer(n)||n!==Math.round(s.amounts[i]/10)*10))throw Error('Redondea cada cantidad a la decena más cercana.');if(!integer(estimate)||estimate!==sum(rounds))throw Error('Suma las cantidades del segundo saco.');s.rounds=rounds;s.estimate=estimate;s.actions.push({type:'estimateSack',rounds,estimate});s.log.push(`Estimación: ${rounds.join(' + ')} = ${estimate}`);return s}
export function joinSack(state,ids,answer){const s=copy(state);if(!Array.isArray(ids)||ids.length<2||new Set(ids).size!==ids.length)throw Error('Elige dos o más cantidades.');const ns=ids.map(id=>s.pieces.find(n=>n.id===id));if(ns.some(n=>!n)||!integer(answer)||answer!==sum(ns.map(n=>n.value)))throw Error('Revisa la suma de las cantidades elegidas.');s.pieces=s.pieces.filter(n=>!ids.includes(n.id));s.pieces.push({id:s.serial++,value:answer});s.actions.push({type:'joinSack',ids,answer});s.log.push(`${ns.map(n=>n.value).join(' + ')} = ${answer}`);return s}
export function finishSack(state,answer,difference=null){const s=copy(state);if(s.pieces.length!==1||!s.actions.some(a=>a.type==='joinSack'))throw Error('Junta primero las cantidades del saco.');if(!integer(answer)||answer!==sum(s.amounts))throw Error('Comprueba cuánto hay en total.');if((s.op.level|| (s.op.digits===3?3:1))>=3){if(!s.rounds)throw Error('Completa también el saco de la estimación.');if(!Number.isInteger(difference)||difference!==s.estimate-answer)throw Error('Calcula estimación menos resultado exacto. Puede dar un número negativo.')}s.exact=answer;s.difference=difference;s.finished=true;s.actions.push({type:'finishSack',answer,difference});s.log.push(`Total exacto: ${answer}`);return s}

export function createSackHunt(op){const base=sackAmounts(op),total=sum(base),approx=(op.level|| (op.digits===3?3:1))>=3,target=approx?Math.round(total/10)*10:total;const offsets=approx?[0,3,20]:[0,10,-1];const bags=offsets.map(delta=>{const values=[...base];values[0]+=delta;return values});const rotation=(op.a+op.b*3)%3;const arranged=bags.slice(rotation).concat(bags.slice(0,rotation));const correct=arranged.map((values,i)=>({values,i})).filter(({values})=>approx?Math.round(sum(values)/10)*10===target:sum(values)===target).map(({i})=>i);return {op,bags:arranged,approx,target,correct,finished:false,actions:[],log:[]}}
export function solveSackHunt(state,ids){const s=copy(state);if(!Array.isArray(ids)||ids.length!==s.correct.length||new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||!s.correct.includes(id)))throw Error(s.approx?'Redondea el total de cada saco a decenas. Marca todos los que se aproximan a la meta.':'Suma las cantidades de cada saco. Elige el que tiene exactamente la cantidad de la meta.');s.finished=true;s.actions.push({type:'solveSackHunt',ids});s.log.push(...ids.map(i=>`Saco ${i+1}: ${s.bags[i].join(' + ')} = ${sum(s.bags[i])}`));return s}

