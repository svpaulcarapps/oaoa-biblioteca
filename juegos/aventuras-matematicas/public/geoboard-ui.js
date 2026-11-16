import {polygon,pathMetrics,geoboardChallenge,checkGeoboard,GEO_COURSES,geoboardEvidence} from './geoboard.js';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isInteger(n)?String(n):String(Math.round(n*100)/100).replace('.',',');
const colors=['#d04b36','#2678ab','#4e8d52','#914ba5'];
function drawing(size,points,closed,model=[],axis=null){
 const pos=p=>[5+(p[0]+.5)*90/size,5+(size-1-p[1]+.5)*90/size],path=ps=>ps.map(p=>pos(p).join(',')).join(' ');
 const grids=Array.from({length:size},(_,i)=>{const v=pos([i,i])[0];return `<path d="M ${v} ${pos([0,0])[1]} V ${pos([0,size-1])[1]} M ${pos([0,0])[0]} ${v} H ${pos([size-1,0])[0]}"/>`}).join('');
 return `<svg class="geo-lines" viewBox="0 0 100 100" aria-hidden="true"><g stroke="#ccdce4" stroke-width=".22">${grids}</g>${axis!==null?`<path d="M ${pos([axis,0])[0]} 2 V 98" stroke="#a06930" stroke-width=".6" stroke-dasharray="2 2"/>`:''}${model.length?`<polygon points="${path(model)}" fill="#44799b18" stroke="#44799b" stroke-width=".65" stroke-dasharray="1.5 1"/>`:''}${points.length?`<${closed?'polygon':'polyline'} points="${path(points)}" fill="${closed?'#d04b3628':'none'}" stroke="var(--geo-band,#d04b36)" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`:''}</svg>`;
}
function modelSvg(size,points,closed=true){const svg=drawing(size,points,closed);return svg.replace('class="geo-lines"','class="geo-model"').replace('aria-hidden="true"','role="img" aria-label="Figura de referencia que debes reproducir o transformar"');}
export function openGeoboard({host,course=1,level=1,player,api,home,onPoints,freeMode=false}){
 let currentCourse=Number(course),difficulty=Number(level),free=freeMode,index=0,points=[],closed=false,bands=[],color=0,run=null,solved=false,saving=false,starting=false,mistakes=0,pendingEvidence=null,earned=false,task,revision=0;
 const root=document.createElement('section');root.className='geo-page';host.replaceChildren(root);
 const $=s=>root.querySelector(s),active=()=>host.contains(root);
 const choose=()=>{revision++;task=geoboardChallenge({a:currentCourse,b:index,level:difficulty});points=[];closed=false;bands=[];run=null;solved=false;pendingEvidence=null;earned=false;mistakes=0;};
 const board=()=>{
  const size=task.size,old=bands.map((b,i)=>drawing(size,b,true).replace('class="geo-lines"',`class="geo-lines" style="--geo-band:${colors[i%colors.length]}"`)).join('');
  $('#geo-board').innerHTML=old+drawing(size,points,closed&&(free||task.kind!=='path'),free?[]:task.overlay||[],!free&&task.axis!=null?task.axis:null)+`<div class="geo-pins" style="--geo-size:${size}">${Array.from({length:size*size},(_,i)=>{const x=i%size,y=size-1-Math.floor(i/size);return `<button type="button" class="geo-pin" data-pin="${x},${y}" aria-label="Clavo (${x}, ${y})" aria-pressed="${points.some(p=>p[0]===x&&p[1]===y)}"></button>`}).join('')}</div>`;
  $('#geo-board').style.setProperty('--geo-band',colors[color]);
  if(currentCourse>=4){const svg=$('#geo-board svg:last-of-type');if(svg)svg.insertAdjacentHTML('beforeend',Array.from({length:size},(_,i)=>`<text x="${5+(i+.5)*90/size}" y="99" font-size="2.5" text-anchor="middle" fill="#355a71">${i}</text><text x="1" y="${5+(size-1-i+.5)*90/size+1}" font-size="2.5" fill="#355a71">${i}</text>`).join(''));}
  root.querySelectorAll('[data-pin]').forEach(pin=>pin.onkeydown=e=>{const [x,y]=pin.dataset.pin.split(',').map(Number),moves={ArrowRight:[x+1,y],ArrowLeft:[x-1,y],ArrowUp:[x,y+1],ArrowDown:[x,y-1]};if(moves[e.key]){e.preventDefault();const target=root.querySelector(`[data-pin="${moves[e.key].join(',')}"]`);if(target)target.focus()}});
  root.querySelectorAll('[data-pin]').forEach(b=>b.onclick=()=>{
   if(solved||saving||starting)return;
   const p=b.dataset.pin.split(',').map(Number);
   if(closed){message('La figura está cerrada. Pulsa Deshacer para seguir cambiándola.');return}
   if(points.some(q=>q[0]===p[0]&&q[1]===p[1])){if(points.length>=3&&points[0][0]===p[0]&&points[0][1]===p[1])close();else message('Ese clavo ya forma parte de tu recorrido.');return}
   if(points.length>=32){message('Usa como máximo 32 vértices.');return}points.push(p);message('');board();root.querySelector(`[data-pin="${p.join(',')}"]`)?.focus({preventScroll:true});
  });
  $('#geo-close').disabled=closed||points.length<(!free&&task.kind==='path'?2:3)||solved||saving||starting;
  $('#geo-undo').disabled=(!points.length&&!bands.length)||solved||saving||starting;
  $('#geo-clear').disabled=(!points.length&&!bands.length)||solved||saving||starting;
  const check=$('#geo-check');if(check)check.disabled=!closed||!run||solved||saving||starting;
  if(free&&closed){const metrics=polygon(points,task.size);$('#geo-metrics').innerHTML=`<span>${metrics.sides} lados</span><span>Área: ${number(metrics.area)} u²</span><span>Perímetro: ${number(metrics.perimeter)} u</span>`}else $('#geo-metrics').innerHTML='';
 };
 const message=text=>{const box=$('#geo-message');if(box)box.textContent=text;};
 const close=()=>{try{if(!free&&task.kind==='path')pathMetrics(points,task.size);else polygon(points,task.size);closed=true;message((!free&&task.kind==='path'?'Recorrido terminado. ':'Figura cerrada. ')+(free?'Puedes añadir otra goma o explorar sus medidas.':'Ahora comprueba tu reto.'));board()}catch(e){message(e.message)}};
 const controlsLocked=value=>{root.querySelectorAll('#geo-course,#geo-level,#geo-free,#geo-next,#geo-home').forEach(e=>e.disabled=value)};
 const render=()=>{
  root.innerHTML=`<div class="geo-heading"><div><span class="eyebrow">CONSTRUYE · OBSERVA · EXPLICA</span><h1>El geoplano</h1></div><button id="geo-home" class="secondary">Volver a las misiones</button></div><p class="geo-intro">Crea figuras con gomas sobre los clavos. Un espacio entre dos clavos vecinos mide una unidad.</p><div class="geo-controls"><label>Curso de los retos<select id="geo-course">${GEO_COURSES.map((c,i)=>`<option value="${i+1}" ${currentCourse===i+1?'selected':''}>${i+1}.º de Primaria</option>`).join('')}</select></label><label>Dificultad<select id="geo-level">${['Empiezo','Avanzo','Reto','Experto'].map((v,i)=>`<option value="${i+1}" ${difficulty===i+1?'selected':''}>${i+1} · ${v}</option>`).join('')}</select></label><button id="geo-free" class="secondary" aria-pressed="${free}">${free?'Volver a los retos':'Explorar libremente'}</button><span class="geo-course-note">${esc(GEO_COURSES[currentCourse-1])}</span></div><div class="geo-grid"><div class="geo-board-card"><div id="geo-board" class="geo-board" role="group" aria-label="Geoplano de ${task.size} por ${task.size} clavos"></div><p class="geo-board-key">${!free&&task.kind==='path'?'Pulsa los clavos en orden y después Terminar recorrido.':'Pulsa los clavos en orden y vuelve al primero para cerrar la goma.'}</p><div class="geo-toolbar"><button id="geo-close" class="primary">${!free&&task.kind==='path'?'Terminar recorrido':'Cerrar figura'}</button><button id="geo-undo" class="secondary">Deshacer</button><button id="geo-clear" class="secondary">Borrar figura</button>${free?'<button id="geo-add" class="secondary">Añadir otra goma</button><button id="geo-color" class="secondary">Cambiar color</button>':''}</div><div id="geo-metrics" class="geo-metrics"></div><div class="geo-legend"><span>Tu goma</span>${!free&&task.overlay?'<span>Figura de partida</span>':''}</div></div><aside class="geo-task"><span class="eyebrow">${free?'TALLER LIBRE':`${currentCourse}.º · NIVEL ${difficulty}`}</span><h2>${free?'¿Qué puedes construir?':esc(task.title)}</h2>${!free&&task.model?modelSvg(task.size,task.model,task.kind!=='path'):''}<p>${free?'Prueba figuras, compara superficies y busca distintas maneras de rodear los clavos.':esc(task.prompt)}</p>${free?'<p class="geo-free-notice">El taller es para investigar: no suma puntos ni cuenta como un reto completado.</p>':`<form id="geo-answer-form" class="geo-answer">${task.answer?`<label>${esc(task.answer.label)}<input id="geo-answer" type="number" min="0" step="${task.answer.step||1}" inputmode="decimal" required autocomplete="off"></label>`:''}<button type="submit" id="geo-check" class="primary">Comprobar mi reto</button></form><p class="geo-progress">Los retos completados suman puntos al ranking y aparecen en el control semanal.</p>`}<p id="geo-message" class="geo-message" role="status" aria-live="polite"></p><div id="geo-result"></div><div class="geo-tools"><details><summary>Una pista para pensar</summary><p>${free?'Usa las flechas del teclado y la barra espaciadora para elegir clavos. Investiga qué cambia al estirar un vértice.':esc(task.hint)}</p></details><p class="geo-source">${free?'Investiga a tu ritmo.':esc(task.source)}</p><button id="geo-next" class="secondary">${free?'Empezar de nuevo':'Otro reto del mismo nivel'}</button></div></aside></div>`;
  $('#geo-home').onclick=home;
  $('#geo-course').onchange=e=>{currentCourse=Number(e.target.value);index=0;choose();render()};
  $('#geo-level').onchange=e=>{difficulty=Number(e.target.value);index=0;choose();render()};
  $('#geo-free').onclick=()=>{if(free&&(!player.name||player.name.trim().length<2)){message('Vuelve a las misiones y escribe tu nombre para guardar retos. Puedes seguir explorando libremente.');return}free=!free;choose();render()};
  $('#geo-next').onclick=()=>{index=(index+1)%32;choose();render()};
  $('#geo-close').onclick=close;
  $('#geo-undo').onclick=()=>{if(closed)closed=false;else if(points.length)points.pop();else if(bands.length){points=bands.pop();closed=true}message('');board()};
  $('#geo-clear').onclick=()=>{points=[];closed=false;bands=[];message('');board()};
  if(free){$('#geo-add').onclick=()=>{if(!closed){message('Cierra primero la figura actual para añadir otra goma.');return}bands.push(points);points=[];closed=false;color=(color+1)%colors.length;board();message('Elige los clavos de la siguiente goma.')};$('#geo-color').onclick=()=>{color=(color+1)%colors.length;board()}}
  else $('#geo-answer-form').onsubmit=async e=>{e.preventDefault();if(!closed||saving||solved)return;try{const answer=$('#geo-answer')?Number($('#geo-answer').value):null;checkGeoboard(task,points,answer);pendingEvidence=geoboardEvidence(points,answer);await save()}catch(e){mistakes=Math.min(1000,mistakes+1);message(e.message)}};
  board();if(!free)void beginChallenge();
 };
 async function save(){
  if(saving||!pendingEvidence)return;saving=true;controlsLocked(true);board();message('Guardando el reto…');
  try{
   if(!run)throw Error('Primero inicia el reto.');
   const saved=await api({action:'finish',id:run,actions:[pendingEvidence],mistakes});
   solved=true;if(!earned){earned=true;onPoints?.(saved)}
   if(active()){$('#geo-result').innerHTML=`<div class="geo-success"><strong>¡Reto conseguido!</strong><p>+${saved.points} puntos${saved.coins?' · +'+saved.coins+' monedas':''}</p><p>${esc(task.explanation||'Has construido una figura que cumple todas las condiciones.')}</p></div>`;message('Reto guardado. Puedes probar otra figura en el siguiente reto.');}
  }catch(e){if(active()){$('#geo-result').innerHTML='<button id="geo-retry" class="primary">Volver a guardar</button>';$('#geo-retry').onclick=save;message(e.message+' Tu figura sigue aquí.');}}
  finally{saving=false;if(active()){controlsLocked(false);board()}}
 }
 async function beginChallenge(){
  const rev=revision;starting=true;controlsLocked(true);board();message('Preparando el reto…');
  try{const data=await api({action:'start',...player,mode:'geoboard',level:difficulty,a:currentCourse,b:index});if(rev===revision&&active()){run=data.id;message('Elige tus clavos. Tienes tiempo para pensar.')}}
  catch(e){if(rev===revision&&active()){message(e.message);$('#geo-result').innerHTML='<button id="geo-start-retry" class="primary">Intentar conectar de nuevo</button>';$('#geo-start-retry').onclick=()=>{$('#geo-result').innerHTML='';void beginChallenge()}}}
  finally{if(rev===revision&&active()){starting=false;controlsLocked(false);board();if(!run)$('#geo-check').disabled=true}}
 }
 choose();render();
 return root;
}
