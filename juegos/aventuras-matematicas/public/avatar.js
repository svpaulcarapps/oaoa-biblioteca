import {spriteFrames} from './professional-sprites.js';
import {validEquipment,drawRewards} from './rewards.js';
export const SKINS=['#f8d5ae','#eeb789','#d89765','#ba7952','#8c513a','#60382d'];
export const HAIRS=['#342c32','#684331','#a75d2e','#eac35b','#b72f4f','#4165a0','#eeedf5','#293c6b'];
export const OUTFITS=['#c43b43','#2a74a4','#278066','#8c4aa1','#db8e2e','#de658e','#303e68','#edf1e8'];
export const ACCESSORIES=[{id:'none',label:'Sin accesorio',points:0},{id:'scarf',label:'Bufanda de explorador',points:0},{id:'goggles',label:'Gafas de inventora',points:500},{id:'crown',label:'Corona estelar',points:1500},{id:'cape',label:'Capa del guardián',points:3000},{id:'wizard',label:'Sombrero del cosmos',points:5000},{id:'pumpkin',label:'Calabaza de Halloween',points:7000},{id:'winter',label:'Gorro de Navidad',points:9000},{id:'headset',label:'Auriculares de jugador',points:12000},{id:'wings',label:'Alas de aurora',points:16000}];
export const DEFAULT_AVATAR={skin:0,hair:0,style:0,outfit:0,accessory:'none',motion:'still',equipment:{},character:'boy'};
export function validAvatar(input,points){if(!input||typeof input!=='object'||![input.skin,input.hair,input.style,input.outfit].every(Number.isInteger)||input.skin<0||input.skin>=SKINS.length||input.hair<0||input.hair>=HAIRS.length||input.style<0||input.style>3||input.outfit<0||input.outfit>=OUTFITS.length)return false;if(input.outfit===7&&points<2500)return false;if(!['still','jump','thumb','dance'].includes(input.motion||'still'))return false;if(!validEquipment(input.equipment||{},points))return false;if(!['boy','girl','curly','bob'].includes(input.character||'boy'))return false;const item=ACCESSORIES.find(a=>a.id===input.accessory);return !!item&&points>=item.points}
export function avatarSvg(raw={},label='Avatar del jugador'){
 let a;try{a=typeof raw==='string'?JSON.parse(raw):raw}catch{a={}}a={...DEFAULT_AVATAR,...a};if(!validAvatar(a,Infinity))a=DEFAULT_AVATAR;
 const skin=a.character==='curly'?'#b77948':a.character==='bob'?'#efbb8a':'#f4bc8b';
 const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
 const motion=a.motion||'still';
 const layers=Object.fromEntries(Object.entries(a.equipment||{}).map(([slot,id])=>[slot,drawRewards({[slot]:id},r,skin)]));
 const frames=spriteFrames(a,layers);
 const safe=String(label).replace(/[&<>"']/g,'');return `<svg class="pupil-avatar motion-${motion}" role="img" aria-label="${safe}" viewBox="0 0 48 72" xmlns="http://www.w3.org/2000/svg">${frames}</svg>`;
}
