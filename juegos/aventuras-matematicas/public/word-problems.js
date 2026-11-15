// Original contexts; the relationships follow the OAOA part-whole models.
export function wordProblem(op){
 const {a,b}=op,addition=(a+b)%2===0,k=Math.floor((a*3+b)/2)%4;
 const themes=[['cromos','Leo','Sara'],['libros','la clase A','la clase B'],['conchas','Nora','Dani'],['puntos','el equipo azul','el equipo rojo']];
 const [unit,x,y]=themes[k],comparison=!addition&&k%2===0;
 if(addition)return {operation:'add',kind:'join',unit,labels:[`Total de ${unit}`,`${unit} de ${x}`,`${unit} de ${y}`],values:['?',a,b],text:`${x} tiene ${a} ${unit} y ${y} tiene ${b}. ¿Cuántos ${unit} tienen entre los dos?`,before:'Entre los dos tienen',after:unit+'.',answer:a+b};
 if(comparison)return {operation:'subtract',kind:'compare',unit,labels:[`${unit} de ${x}`,`${unit} de ${y}`,'Diferencia'],values:[a,b,'?'],text:`${x} tiene ${a} ${unit} y ${y} tiene ${b}. ¿Cuántos ${unit} más tiene ${x} que ${y}?`,before:`${x} tiene`,after:`${unit} más que ${y}.`,answer:a-b};
 return {operation:'subtract',kind:'missing',unit,labels:[`Total de ${unit}`,`${unit} de ${x}`,`${unit} de ${y}`],values:[a,b,'?'],text:`${x} y ${y} tienen ${a} ${unit} entre los dos. ${x} tiene ${b}. ¿Cuántos ${unit} tiene ${y}?`,before:`${y} tiene`,after:unit+'.',answer:a-b};
}
export const problemMethods=p=>p.operation==='add'?['add','dresses']:['subtract','climb'];
export function checkWordDiagram(p,d){
 if(!d||!['parts','bars'].includes(d.model)||!Array.isArray(d.values)||d.values.length!==3)throw Error('Elige un modelo y completa las tres cantidades.');
 if(d.values.some((v,i)=>p.values[i]==='?'?String(v).trim()!=='?':!/^\d+$/.test(String(v).trim())||Number(v)!==p.values[i]))throw Error('Coloca solo los datos del enunciado y marca con ? lo que hay que averiguar. Todavía no tienes que calcularlo.');
 return true;
}
export function checkWordSteps(op,actions,validate){
 const p=wordProblem(op);if(!Array.isArray(actions)||actions.length<5)throw Error('Completa el diagrama, la operación, el cálculo y la solución.');
 const [d,o,m,...rest]=actions,answer=rest.pop();
 if(d?.type!=='problemDiagram')throw Error('Completa primero el diagrama.');checkWordDiagram(p,d);
 if(o?.type!=='problemOperation'||o.operation!==p.operation)throw Error('Revisa qué operación resuelve el problema.');
 if(m?.type!=='problemMethod'||!problemMethods(p).includes(m.method))throw Error('Elige una estrategia válida para esa operación.');
 validate({...op,mode:m.method},rest);
 if(answer?.type!=='problemAnswer'||!Number.isSafeInteger(answer.answer)||answer.answer!==p.answer)throw Error('Completa la frase con la solución del problema.');
 return true;
}
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function wordDiagramHtml(p,model='parts',values=['','',''],readOnly=false){
 const box=i=>`<label class="word-quantity q${i}" data-word-slot="${i}"><span>${esc(p.labels[i])}</span>${readOnly?`<strong>${esc(values[i])}</strong>`:`<input data-word-value="${i}" aria-label="${esc(p.labels[i])}" value="${esc(values[i])}" ${values[i]==='?'?'readonly':''} inputmode="numeric" maxlength="5" autocomplete="off" placeholder="Dato conocido"><button type="button" class="word-mark-unknown" data-word-unknown="${i}" aria-pressed="${values[i]==='?'}" aria-label="Marcar ${esc(p.labels[i])} como lo que hay que averiguar">${values[i]==='?'?'? Averiguar':'Marcar ?'}</button>`}</label>`;
 return `<div class="word-diagram ${model==='bars'?'word-bars':'word-parts'} ${p.kind==='compare'?'word-compare':''}" aria-label="Diagrama ${model==='bars'?'de barras':'partes y todo'}"><div class="word-total">${box(0)}</div><div class="word-links" aria-hidden="true"></div><div class="word-pair">${box(1)}${box(2)}</div></div>`;
}
