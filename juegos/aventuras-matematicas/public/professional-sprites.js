import {costumeById} from './costumes.js';
const BARE_SPRITES={summer:'/assets/art/feet-summer-v5.webp',formal:'/assets/art/feet-formal-v5.webp',summer2:'/assets/art/feet-summer2-v5.webp',formal2:'/assets/art/feet-formal2-v5.webp'};
const SPRITES={summer:'/assets/pixel/avatars-summer-v4.webp',formal:'/assets/pixel/avatars-formal-v3.webp',summer2:'/assets/art/avatars-summer-v5.webp',formal2:'/assets/art/avatars-formal-v5.webp'};
// Attachment landmarks are in the same 48 × 72 coordinate system as the avatar.
// Each pose has its own head, torso, hands and two feet; accessories never animate independently.
const POSES={
 still:[[[25,20],[25,41],[10,49],[38,49],[[14.8,64.5],[33.5,64.5]]],[[25,20],[25,41],[10,49],[38,49],[[14.8,64.5],[33.5,64.5]]],[[25,20],[25,41],[10,49],[38,49],[[14.8,64.5],[33.5,64.5]]],[[25,20],[25,41],[10,49],[38,49],[[14.8,64.5],[33.5,64.5]]]],
 jump:[[[25,35],[25,52],[5,48],[39,54],[[14,67],[32,67]]],[[25,22],[25,43],[9,41],[40,35],[[14,58],[28,62]]],[[25,17],[25,35],[5,18],[42,17],[[17,54],[30,54]]],[[25,35],[25,52],[8,54],[42,51],[[14,67],[32,67]]]],
 thumb:[[[25,20],[25,41],[10,49],[38,49],[[14.8,64.5],[33.5,64.5]]],[[25,20],[25,41],[14,37],[38,49],[[14.8,64.5],[33.5,64.5]]],[[25,19],[25,41],[13,32],[38,49],[[14.8,64.5],[33.5,64.5]]],[[25,19],[25,41],[12,32],[38,49],[[14.8,64.5],[33.5,64.5]]]],
 dance:[[[24,20],[24,41],[9,40],[40,20],[[10,64],[37,64]]],[[25,22],[25,42],[10,32],[42,32],[[12,59],[38,65]]],[[25,21],[25,42],[9,41],[35,33],[[24,62],[28,65]]],[[25,18],[25,40],[5,18],[44,18],[[13,64],[36,64]]]]
};
let serial=0;
const n=v=>Number(v.toFixed(3));
const move=(content,from,to,angle=0)=>`<g transform="translate(${to[0]} ${to[1]}) rotate(${angle}) translate(${-from[0]} ${-from[1]})">${content}</g>`;
function limb(content,from,to,endFrom,endTo){const vx=endFrom[0]-from[0],vy=endFrom[1]-from[1],dx=endTo[0]-to[0],dy=endTo[1]-to[1],d=vx*vx+vy*vy,a=(dx*vx+dy*vy)/d,b=(dy*vx-dx*vy)/d;return `<g transform="matrix(${n(a)} ${n(b)} ${n(-b)} ${n(a)} ${n(to[0]-a*from[0]+b*from[1])} ${n(to[1]-b*from[0]-a*from[1])})">${content}</g>`}
export function spriteFrames(a,layers={}){
 const costume=costumeById(a.costume);if(costume?.variants?.[a.character])return completeCostumeFrames(a,costume);

 const extra=['curly','bob'].includes(a.character),uniform=(a.outfit===7?'formal':'summer')+(extra?'2':''),girl=['girl','bob'].includes(a.character),motion=a.motion||'still',row=(girl?4:0)+({still:0,jump:1,thumb:2,dance:3}[motion]||0),bare=a.equipment?.feet==='hobbitfeet',id='oaoa-sprites-'+uniform+(bare?'-bare':''),source=(bare?BARE_SPRITES:SPRITES)[uniform],uid='attachments-'+(++serial);
 if(typeof document!=='undefined'&&!document.getElementById(id)){let defs=document.getElementById('oaoa-sprite-defs');if(!defs){const holder=document.createElementNS('http://www.w3.org/2000/svg','svg');holder.setAttribute('aria-hidden','true');holder.style.cssText='position:absolute;width:0;height:0;overflow:hidden';holder.innerHTML='<defs id="oaoa-sprite-defs"></defs>';document.body.append(holder);defs=document.getElementById('oaoa-sprite-defs')}const image=document.createElementNS('http://www.w3.org/2000/svg','image');image.id=id;image.setAttribute('width','887');image.setAttribute('height','1774');image.setAttribute('href',window.OAOA_ASSETS?.[source]||source);defs.append(image)}
 const clips=[['left-foot',9,56,16,16],['right-foot',25,56,17,16],['torso',14,29,21,19],['left-arm',0,29,14,22],['right-arm',35,29,13,23],['left-leg',0,48,25,24],['right-leg',25,48,23,24]];
 const defs=clips.map(([name,x,y,w,h])=>`<clipPath id="${uid}-${name}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`).join('');
 const cut=(content,name)=>`<g clip-path="url(#${uid}-${name})">${content}</g>`;
 return `<defs>${defs}</defs>`+Array.from({length:4},(_,i)=>{
 const [head,body,leftHand,rightHand,feet]=(POSES[motion]||POSES.still)[i];
 const holes=layers.feet&&!bare?feet.map(([x,y])=>`<ellipse cx="${x}" cy="${y-1}" rx="7.3" ry="7.6" fill="black"/>`).join(''):'';
 const mask=holes?`<mask id="${uid}-shoe-${i}" maskUnits="userSpaceOnUse" x="-12" y="0" width="72" height="72"><rect x="-12" width="72" height="72" fill="white"/>${holes}</mask>`:'';
 let pieces='';
 if(layers.suit){pieces+=move(cut(layers.suit,'torso'),[25,41],body);pieces+=limb(cut(layers.suit,'left-arm'),[14,33],[body[0]-11,body[1]-8],[11,47],leftHand);pieces+=limb(cut(layers.suit,'right-arm'),[35,33],[body[0]+10,body[1]-8],[37,47],rightHand);pieces+=limb(cut(layers.suit,'left-leg'),[19,48],[body[0]-6,body[1]+7],[17,63],feet[0]);pieces+=limb(cut(layers.suit,'right-leg'),[30,48],[body[0]+5,body[1]+7],[34,63],feet[1]);}
 if(layers.feet&&!bare)pieces+=feet.map((point,j)=>move(cut(layers.feet,j?'right-foot':'left-foot'),[j?33.7:16.5,63],point)).join('');
 if(layers.hands){const angle=Math.atan2(rightHand[1]-(body[1]-8),rightHand[0]-(body[0]+10))*180/Math.PI-78;pieces+=move(layers.hands,[37.3,46.8],rightHand,angle);}
 if(layers.head)pieces+=move(layers.head,[25,20],head);
 if(layers.face)pieces+=move(layers.face,[25,16.5],head);
 return `<g class="sprite-frame frame-${i}" data-pose="${motion}-${i}"><defs>${mask}</defs><g${holes?` mask="url(#${uid}-shoe-${i})"`:''}><svg x="-12" y="0" width="72" height="72" viewBox="${i*221.75} ${row*221.75} 221.75 221.75" overflow="hidden"><use href="#${id}"/></svg></g>${pieces}</g>`;
 }).join('');
}

function completeCostumeFrames(a,costume){
 const asset=costume.variants[a.character],id='oaoa-costume-'+costume.id+'-'+a.character,row=({still:0,jump:1,thumb:2,dance:3}[a.motion]||0);
 if(typeof document!=='undefined'&&!document.getElementById(id)){let defs=document.getElementById('oaoa-sprite-defs');if(!defs){const holder=document.createElementNS('http://www.w3.org/2000/svg','svg');holder.setAttribute('aria-hidden','true');holder.style.cssText='position:absolute;width:0;height:0;overflow:hidden';holder.innerHTML='<defs id="oaoa-sprite-defs"></defs>';document.body.append(holder);defs=document.getElementById('oaoa-sprite-defs')}const image=document.createElementNS('http://www.w3.org/2000/svg','image');image.id=id;image.setAttribute('width','1536');image.setAttribute('height','1536');image.setAttribute('href',window.OAOA_ASSETS?.[asset]||asset);defs.append(image)}
 return Array.from({length:4},(_,i)=>`<g class="sprite-frame frame-${i}" data-costume="${costume.id}" data-pose="${a.motion||'still'}-${i}"><svg x="-12" y="0" width="72" height="72" viewBox="${i*384} ${row*384} 384 384" overflow="hidden"><use href="#${id}"/></svg></g>`).join('');
}
