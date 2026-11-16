// Coordinates count spaces between pins; one square is one square unit.
export const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const on=(a,b,p)=>cross(a,b,p)===0&&p[0]>=Math.min(a[0],b[0])&&p[0]<=Math.max(a[0],b[0])&&p[1]>=Math.min(a[1],b[1])&&p[1]<=Math.max(a[1],b[1]);
export function intersects(a,b,c,d){const ab1=cross(a,b,c),ab2=cross(a,b,d),cd1=cross(c,d,a),cd2=cross(c,d,b);return (ab1*ab2<0&&cd1*cd2<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);}
export function polygon(points,size=9){
 if(!Array.isArray(points)||points.length<3||points.length>32)throw Error('La figura necesita al menos tres vértices.');
 if(points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(n=>Number.isInteger(n)&&n>=0&&n<size)))throw Error('Coloca cada vértice en un clavo del geoplano.');
 if(new Set(points.map(p=>p.join(','))).size!==points.length)throw Error('Cada vértice debe ocupar un clavo distinto.');
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],c=points[(i+2)%points.length];
  if(cross(a,b,c)===0)throw Error('Un punto en mitad de un lado no es un vértice. Retíralo de la figura.');
  for(let j=i+1;j<points.length;j++){if(j===i+1||(i===0&&j===points.length-1))continue;if(intersects(a,b,points[j],points[(j+1)%points.length]))throw Error('Los lados se cruzan. Deshaz un punto y cambia el recorrido.');}
 }
 let twice=0,perimeter=0;const lengths=[];
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];twice+=a[0]*b[1]-b[0]*a[1];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);lengths.push(d);perimeter+=d;}
 if(!twice)throw Error('La figura debe encerrar una superficie.');
 const square=points.length===4&&lengths.every(d=>Math.abs(d-lengths[0])<1e-8)&&points.every((b,i)=>{const a=points[(i+3)%4],c=points[(i+1)%4];return (a[0]-b[0])*(c[0]-b[0])+(a[1]-b[1])*(c[1]-b[1])===0});
 const rectangle=points.length===4&&points.every((b,i)=>{const a=points[(i+3)%4],c=points[(i+1)%4];return (a[0]-b[0])*(c[0]-b[0])+(a[1]-b[1])*(c[1]-b[1])===0});
 return {area:Math.abs(twice)/2,perimeter,sides:points.length,square,rectangle};
}
export function sameVertices(a,b){return a.length===b.length&&a.every(p=>b.some(q=>same(p,q)));}
export function transform(points,type,value){return points.map(([x,y])=>type==='mirror'?[2*value-x,y]:type==='move'?[x+value[0],y+value[1]]:type==='turn'?[value[0]-(y-value[1]),value[1]+(x-value[0])]:[x,y]);}
export function pathMetrics(points,size=11){
 if(!Array.isArray(points)||points.length<2||points.length>32||points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(v=>Number.isInteger(v)&&v>=0&&v<size)))throw Error('Une al menos dos clavos válidos.');
 if(new Set(points.map(p=>p.join(','))).size!==points.length)throw Error('El recorrido debe usar clavos distintos.');
 let horizontal=0,vertical=0,diagonal=0;
 for(let i=1;i<points.length;i++){if(points[i][0]===points[i-1][0])vertical++;else if(points[i][1]===points[i-1][1])horizontal++;else diagonal++;}
 return {horizontal,vertical,diagonal,segments:points.length-1};
}
export const GEO_COURSES=['Figuras, vértices y primeras simetrías.','Segmentos y simetrías con gomas.','Cuadraditos, área y perímetro.','Coordenadas y construcción de polígonos.','Cuadriláteros, áreas y ampliaciones.','Coordenadas, razones y escalas.'];
const rectangle=(w,h,x=1,y=1)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const coords=ps=>ps.map(([x,y],i)=>`${String.fromCharCode(65+i)} (${x}, ${y})`).join(' · ');
const ref=(grade,page)=>`Adaptación al geoplano digital · OAOA ${grade}.º, pág. ${page}.`;
export function geoboardChallenge(op){
 const grade=Number(op.a),seed=Number(op.b),level=Number(op.level);
 if(!Number.isInteger(grade)||grade<1||grade>6||!Number.isInteger(seed)||seed<0||seed>31||!Number.isInteger(level)||level<1||level>4)throw Error('Elige un curso y un nivel de geoplano válidos.');
 const v=seed%4,task={grade,level,seed,size:grade===1?5:grade===2?7:grade===3?9:11,kind:'polygon',hint:'Cuenta espacios entre clavos, no los clavos. Puedes deshacer y construir otro camino.'};
 const set=(values)=>Object.assign(task,values);
 if(grade===1){
  if(level===1){const solution=v%2?[[1,1],[3,1],[2,3]]:rectangle(2,2);set({title:'Una goma, una figura',prompt:'Reproduce en tu tablero la figura del modelo. Puedes empezar por cualquier vértice.',model:solution,solution,rule:'exact',source:ref(1,324),hint:'Observa las esquinas del modelo. Une los clavos de una esquina a la siguiente.'});}
  if(level===2){const sides=3+v%2,solution=sides===3?[[1,1],[3,1],[2,3]]:rectangle(2,2);set({title:'Buscamos las esquinas',prompt:`Construye una figura cerrada con ${sides} lados. Después cuenta sus vértices.`,sides,solution,answer:{label:'¿Cuántos vértices tiene tu figura?',value:sides},source:ref(1,324)});}
  if(level===3){const solution=rectangle(2,1+v%2);set({title:'El rectángulo de cuerdas',prompt:'Construye un rectángulo con cuatro esquinas. Sus lados de arriba y abajo deben ser horizontales.',rectangle:true,axisAligned:true,solution,source:ref(1,324),hint:'Los lados opuestos de un rectángulo tienen la misma longitud. Sus cuatro esquinas son rectas.'});}
  if(level===4){const overlay=[[0,1],[1,1],[1,3]],solution=transform(overlay,'mirror',2);set({title:'La figura del espejo',prompt:'La línea discontinua es el espejo. Construye al otro lado el triángulo reflejado de la figura azul.',overlay,solution,axis:2,rule:'exact',source:ref(1,189),hint:'Cada esquina debe quedar a la misma distancia del espejo, pero al otro lado.'});}
 }
 if(grade===2){
  if(level<=2){const solution=level===1?[[1,1],[1,4],[4,4]]:[[0,5],[2,5],[2,3],[4,3],[5,1]],kind='path',count=level===1?'vertical':'horizontal',value=pathMetrics(solution,task.size)[count];set({kind,solution,model:solution,rule:'path',title:level===1?'Unimos segmentos':'Horizontales y verticales',prompt:`Copia el recorrido del modelo, sin cerrar sus extremos. Cuenta después sus segmentos ${count==='vertical'?'verticales':'horizontales'}.`,answer:{label:`Número de segmentos ${count==='vertical'?'verticales':'horizontales'}`,value},source:ref(2,98),hint:'Un segmento horizontal va de izquierda a derecha. Uno vertical va de abajo arriba. Cada cambio de dirección inicia otro segmento.'});}
  if(level===3){const overlay=[[0,1],[2,1],[1,4]],solution=transform(overlay,'mirror',3);set({title:'Una goma y su reflejo',prompt:'Construye el triángulo simétrico al azul al otro lado del eje vertical.',overlay,solution,axis:3,rule:'exact',source:ref(2,139),hint:'Cuenta la distancia de cada esquina al eje y repítela en el otro lado.'});}
  if(level===4){const overlay=[[0,1],[2,1],[2,3],[1,4],[0,3]],solution=transform(overlay,'mirror',3);set({title:'Simetría con cinco esquinas',prompt:'Reproduce al otro lado del espejo la figura azul completa. Respeta las cinco esquinas.',overlay,solution,axis:3,rule:'exact',source:ref(2,139),hint:'Fíjate en las cinco esquinas y en su altura. El espejo cambia izquierda por derecha.'});}
 }
 if(grade===3){
  const w=2+v%2,h=2+Math.floor(v/2),model=rectangle(w,h);
  if(level===1)set({title:'¿Cuántos cuadraditos caben?',prompt:'Construye la figura del modelo y cuenta los cuadraditos de su interior.',model,solution:model,rule:'exact',answer:{label:'Área en unidades cuadradas (u²)',value:w*h},source:ref(3,65),hint:'Puedes contar por filas. Una unidad cuadrada es el espacio entre cuatro clavos vecinos.'});
  if(level===2)set({title:'Recorre todo el borde',prompt:'Copia el rectángulo y mide su borde completo. Cada espacio horizontal o vertical mide una unidad.',model,solution:model,rule:'exact',answer:{label:'Perímetro en unidades (u)',value:2*(w+h)},source:ref(3,65),hint:'Recorre los cuatro lados sin olvidar el último. Cuenta espacios, no clavos.'});
  if(level===3){const area=4+2*v,solution=rectangle(area/2,2);set({title:'Misma área, otro borde',prompt:`La figura azul tiene área ${area} u². Construye otro rectángulo con la misma área y un perímetro diferente.`,overlay:rectangle(area,1,0,0),area,rectangle:true,differentPerimeter:2*(area+1),solution,source:ref(3,66),hint:'Busca dos filas de cuadraditos. Compara el borde de la figura larga con el de tu nuevo rectángulo.'});if(area>8){task.overlay=rectangle(5,2,0,0);task.area=10;task.differentPerimeter=14;task.solution=rectangle(2,5,1,1);task.prompt='La figura azul tiene área 10 u². Construye una figura de área 10 u² cuyo perímetro sea diferente.';delete task.rectangle;task.solution=[[1,1],[5,1],[5,2],[2,2],[2,8],[1,8]];}}
  if(level===4){const base=2+v%2,height=2+2*Math.floor(v/2),solution=[[1,1],[1+base,1],[1,1+height]];set({title:'Medios cuadraditos',prompt:'Copia el triángulo y cuenta cuántos cuadraditos completos ocupa. Puedes juntar dos mitades para formar uno.',model:solution,solution,rule:'exact',answer:{label:'Área del triángulo (u²)',value:base*height/2,step:.5},source:ref(3,108),hint:'Imagina un rectángulo con la misma base y altura. La diagonal lo reparte en dos mitades iguales.'});}
 }
 if(grade===4){
  const variants=[[[3,1],[7,5],[1,4]],[[6,9],[2,6],[9,7]],[[2,2],[7,2],[7,6],[2,6]],[[2,5],[5,2],[8,5],[5,8]]],solution=variants[(v+level-1)%4];
  if(level<=2)set({title:level===1?'La figura oculta':'Coordenadas de un polígono',prompt:`Localiza los puntos y únelos en este orden: ${coords(solution)}. Cierra la figura desde el último al primero.`,solution,rule:'exact',source:ref(4,13),hint:'En (x, y), primero avanza por el eje horizontal x y después sube por el eje vertical y. El origen (0, 0) está abajo a la izquierda.'});
  if(level===3){const model=rectangle(3+v%2,2+Math.floor(v/2));set({title:'Área por descomposición',prompt:'Copia la figura y calcula cuántas unidades cuadradas ocupa.',model,solution:model,rule:'exact',answer:{label:'Área de la figura (u²)',value:polygon(model,11).area},source:ref(4,141)});}
  if(level===4){const area=6+2*v;set({title:'Construye a partir del área',prompt:`Construye un cuadrilátero con área ${area} u². Hay más de una solución.`,sides:4,area,solution:rectangle(area/2,2),source:ref(4,141),hint:'Prueba con dos filas de cuadraditos y piensa cuántos necesitas en cada fila.'});}
 }
 if(grade===5){
  if(level===1){const solution=v%2?[[4,3],[8,5],[5,9]]:[[3,3],[8,5],[5,9]];set({title:'Dibujo geométrico',prompt:`Dibuja el triángulo indicado por estas coordenadas: ${coords(solution)}.`,solution,rule:'exact',source:ref(5,6),hint:'Localiza primero los tres vértices. La goma debe cerrar el triángulo sin añadir otras esquinas.'});}
  if(level===2){const area=8+2*v;set({title:'Un cuadrilátero de área conocida',prompt:`Construye un cuadrilátero que tenga un área de ${area} u². Puedes usar cualquier solución que cumpla la condición.`,sides:4,area,solution:rectangle(area/2,2),source:ref(5,6),hint:'Un cuadrilátero tiene cuatro lados. Puedes empezar probando rectángulos y contar sus cuadraditos.'});}
  if(level===3){const solution=[[5,3],[8,6],[5,9],[2,6]];set({title:'Un cuadrado inclinado',prompt:`Construye el cuadrado de vértices ${coords(solution)}. ¿Cuál es su área?`,solution,rule:'exact',answer:{label:'Área del cuadrado (u²)',value:18},source:ref(5,7),hint:'Encierra la figura en un cuadrado de lado 6 y quita los cuatro triángulos de las esquinas.'});}
  if(level===4){const w=2+v%2,h=1+Math.floor(v/2),solution=rectangle(w*2,h*2,1,1);set({title:'Ampliamos un rectángulo',prompt:`El modelo mide ${w} unidades de largo y ${h} de alto. Construye un rectángulo con el doble de largo y el doble de alto. Después calcula su área.`,model:rectangle(w,h),solution,width:w*2,height:h*2,axisAligned:true,rectangle:true,answer:{label:'Área del rectángulo ampliado (u²)',value:4*w*h},source:ref(5,138),hint:'Doblar cada lado multiplica el área por cuatro. La figura puede estar en otro lugar del tablero.'});}
 }
 if(grade===6){
  if(level===1){const solution=[[4,3],[5,8],[7,6],[8,3]];set({title:'Coordenadas y área',prompt:`Construye el cuadrilátero ${coords(solution)} y calcula su área en unidades cuadradas.`,solution,rule:'exact',answer:{label:'Área del cuadrilátero (u²)',value:polygon(solution,11).area,step:.5},source:ref(6,6),hint:'Descompón la figura en triángulos, o réstale al rectángulo que la contiene los trozos exteriores.'});}
  if(level===2){const solution=rectangle(6,3);set({title:'La proporción de una bandera',prompt:'Construye un rectángulo de área 18 u² cuyo largo horizontal sea el doble de su altura. ¿Cuánto mide su perímetro?',area:18,rectangle:true,axisAligned:true,ratio:2,solution,answer:{label:'Perímetro de la bandera (u)',value:18},source:ref(6,202),hint:'Si el alto mide 3 y el largo mide 6, comprueba tanto la razón como el área antes de medir el borde.'});}
  if(level===3){const w=2+v%2,h=1+Math.floor(v/2),solution=rectangle(2*w,2*h);set({title:'Escala y crecimiento del área',prompt:`La bandera original mide ${w} por ${h} unidades. Constrúyela ampliada con factor de escala ×2. ¿Por cuánto se multiplica el área?`,model:rectangle(w,h),solution,rectangle:true,axisAligned:true,width:2*w,height:2*h,answer:{label:'Factor de crecimiento del área',value:4},source:ref(6,207),hint:'El ancho se duplica y el alto también: hay el doble de columnas y el doble de filas.'});}
  if(level===4){const w=4+2*(v%2),h=2+2*Math.floor(v/2),solution=rectangle(w/2,h/2);set({title:'Reducir sin cambiar la forma',prompt:`La bandera del modelo mide ${w} por ${h} unidades. Construye otra con la mitad del largo y la mitad del alto. ¿Qué porcentaje del área original ocupa?`,model:rectangle(w,h),solution,rectangle:true,axisAligned:true,width:w/2,height:h/2,answer:{label:'Porcentaje del área original (%)',value:25},source:ref(6,208),hint:'La mitad por la mitad es la cuarta parte. Compárala con el 100 % de la figura original.'});}
 }
 return task;
}
export function checkGeoboard(task,points,answer=null){
 const m=task.kind==='path'?pathMetrics(points,task.size):polygon(points,task.size);
 if(task.rule==='path'){
  const forwards=points.length===task.solution.length&&points.every((p,i)=>same(p,task.solution[i])),backwards=points.length===task.solution.length&&points.every((p,i)=>same(p,task.solution[points.length-1-i]));
  if(!forwards&&!backwards)throw Error('Revisa los extremos y los cambios de dirección. El recorrido debe coincidir con el modelo.');
 }else if(task.rule==='exact'&&!sameVertices(points,task.solution))throw Error('Revisa dónde has colocado los vértices. Deben coincidir con los puntos que pide el reto.');
 if(task.sides&&m.sides!==task.sides)throw Error(`Busca una figura con ${task.sides} lados y ${task.sides} esquinas.`);
 if(task.rectangle&&!m.rectangle)throw Error('La figura necesita cuatro ángulos rectos para ser un rectángulo.');
 if(task.axisAligned&&points.some((p,i)=>{const q=points[(i+1)%points.length];return p[0]!==q[0]&&p[1]!==q[1]}))throw Error('En este reto, los lados deben seguir las líneas horizontales y verticales del tablero.');
 if(task.area!=null&&Math.abs(m.area-task.area)>1e-8)throw Error(`Tu figura todavía no tiene el área de ${task.area} u² que pide el reto. Cuenta o descompón sus cuadraditos.`);
 if(task.differentPerimeter!=null&&Math.abs(m.perimeter-task.differentPerimeter)<1e-8)throw Error('El área coincide, pero el perímetro sigue siendo el mismo. Prueba otra forma.');
 const width=Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),height=Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]));
 if(task.width!=null&&(width!==task.width||height!==task.height))throw Error('Revisa el largo y el alto. Aplica el factor de escala a las dos medidas.');
 if(task.ratio&&width!==task.ratio*height)throw Error('La figura todavía no respeta la proporción entre largo y alto.');
 if(task.answer&&(!Number.isFinite(answer)||Math.abs(answer-task.answer.value)>1e-8))throw Error('La figura está bien construida. Revisa ahora la medida o el número que has escrito.');
 return true;
}
export const geoboardEvidence=(points,answer)=>({type:'geoboard',points:points.map(p=>[...p]),answer});
export function validateGeoboard(op,actions){if(!Array.isArray(actions)||actions.length!==1||actions[0]?.type!=='geoboard')throw Error('Falta la construcción del geoplano.');return checkGeoboard(geoboardChallenge(op),actions[0].points,actions[0].answer);}
