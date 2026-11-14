import {spriteFrames} from './professional-sprites.js';
import {validEquipment,drawRewards} from './rewards.js';
export const SKINS=['#f8d5ae','#eeb789','#d89765','#ba7952','#8c513a','#60382d'];
export const HAIRS=['#342c32','#684331','#a75d2e','#eac35b','#b72f4f','#4165a0','#eeedf5','#293c6b'];
export const OUTFITS=['#c43b43','#2a74a4','#278066','#8c4aa1','#db8e2e','#de658e','#303e68','#edf1e8'];
export const ACCESSORIES=[{id:'none',label:'Sin accesorio',points:0},{id:'scarf',label:'Bufanda de explorador',points:0},{id:'goggles',label:'Gafas de inventora',points:500},{id:'crown',label:'Corona estelar',points:1500},{id:'cape',label:'Capa del guardián',points:3000},{id:'wizard',label:'Sombrero del cosmos',points:5000},{id:'pumpkin',label:'Calabaza de Halloween',points:7000},{id:'winter',label:'Gorro de Navidad',points:9000},{id:'headset',label:'Auriculares de jugador',points:12000},{id:'wings',label:'Alas de aurora',points:16000}];
export const DEFAULT_AVATAR={skin:0,hair:0,style:0,outfit:0,accessory:'none',motion:'still',equipment:{},character:'boy'};
export function validAvatar(input,points){if(!input||typeof input!=='object'||![input.skin,input.hair,input.style,input.outfit].every(Number.isInteger)||input.skin<0||input.skin>=SKINS.length||input.hair<0||input.hair>=HAIRS.length||input.style<0||input.style>3||input.outfit<0||input.outfit>=OUTFITS.length)return false;if(input.outfit===7&&points<2500)return false;if(!['still','jump','thumb','dance'].includes(input.motion||'still'))return false;if(!validEquipment(input.equipment||{},points))return false;if(!['boy','girl'].includes(input.character||'boy'))return false;const item=ACCESSORIES.find(a=>a.id===input.accessory);return !!item&&points>=item.points}
export function avatarSvg(raw={},label='Avatar del jugador'){
 let a;try{a=typeof raw==='string'?JSON.parse(raw):raw}catch{a={}}a={...DEFAULT_AVATAR,...a};if(!validAvatar(a,Infinity))a=DEFAULT_AVATAR;
 const skin=SKINS[a.skin],hair=HAIRS[a.hair],cloth=OUTFITS[a.outfit],acc=a.accessory;
 const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
 let p=r(6,61,36,2,'#11274244');
 if(acc==='cape')p+='<path d="M15 28H33L42 56H6Z" fill="#9c344a"/>'+r(10,45,3,9,'#cf5760')+r(35,45,3,9,'#692f45');
 if(acc==='wings')p+='<path d="M15 30L3 22V37L11 47H15ZM33 30L45 22V37L37 47H33Z" fill="#7cdddc"/>'+r(5,27,3,11,'#d7f7d9')+r(40,27,3,11,'#d7f7d9');
 p+=r(15,45,8,13,'#263d5c')+r(25,45,8,13,'#263d5c')+r(17,47,3,10,'#415c7c')+r(27,47,3,10,'#415c7c')+r(13,57,10,4,'#192a3b')+r(25,57,11,4,'#192a3b')+r(14,57,7,1,'#627b8e')+r(27,57,7,1,'#627b8e');
 p+=r(13,29,22,19,'#152c49')+r(15,29,18,17,cloth)+r(16,30,3,14,'#ffffff28')+r(29,32,3,13,'#11274244')+r(13,45,22,3,a.outfit===0?'#1c365a':'#553c35')+(a.outfit===0?r(15,45,18,1,'#42658b'):r(22,45,5,3,'#f2cd71')+r(23,46,3,1,'#9b6c3b'));
 if(a.outfit===0)p+=r(16,30,3,2,'#e5e7df')+r(28,30,3,2,'#e5e7df')+r(16,35,3,4,'#d6c36c')+r(17,36,1,2,'#35547b')+r(15,34,18,11,'#244c83')+r(15,33,18,2,'#f2e9d8')+r(17,34,1,10,'#4b75a0')+r(30,34,2,10,'#193b6e');
 if(a.outfit===7)p+=r(15,29,18,16,'#233d60')+'<path d="M20 29L24 34L28 29L26 40H22Z" fill="#f3ecd7"/>'+r(23,33,2,7,'#b63e42')+r(17,35,3,3,'#e6bf67');
 p+=r(9,30,5,14,cloth)+r(34,30,5,14,cloth)+r(10,43,4,6,skin)+r(34,43,4,6,skin)+r(10,47,3,2,'#442d3422')+r(35,47,3,2,'#442d3422');
 p+=r(20,25,8,7,skin)+r(20,28,8,2,'#6b3b3933')+'<path d="M18 29L24 33L30 29L28 35H20Z" fill="#f5edcd"/>'+r(23,33,2,10,a.outfit===0?'#d6ddea':'#e9c159');
 p+=r(13,9,22,18,'#172638')+r(15,9,18,19,skin)+r(12,16,3,7,skin)+r(33,16,3,7,skin)+r(15,24,3,3,'#6b3b3922')+r(30,24,3,3,'#6b3b3922')+r(19,26,10,2,skin);
 p+=r(16,16,6,2,hair)+r(27,16,5,2,hair)+r(18,19,4,4,'#f8f7e7')+r(27,19,4,4,'#f8f7e7')+r(19,19,2,3,'#263343')+r(27,19,2,3,'#263343')+r(19,19,1,1,'#fff')+r(27,19,1,1,'#fff')+r(23,22,2,2,'#6b3b3922')+r(21,25,6,1,'#864d4c')+r(21,25,2,1,'#d48179');
 p+=r(14,7,20,7,hair)+r(16,5,16,3,hair)+r(14,12,4,5,hair)+r(30,11,4,6,hair)+r(17,8,3,2,'#ffffff24')+r(21,7,7,1,'#ffffff24');
 if(a.style===0)p+=r(18,12,7,3,hair)+r(24,12,3,2,hair);
 if(a.style===1)p+=r(11,8,5,18,hair)+r(33,8,5,18,hair)+r(12,12,1,10,'#ffffff22')+r(35,12,1,10,'#ffffff22');
 if(a.style===2)p+=r(18,2,4,5,hair)+r(24,0,4,7,hair)+r(30,3,3,5,hair);
 if(a.style===3)p+=r(8,9,6,7,hair)+r(35,9,6,7,hair)+r(9,13,4,5,hair)+r(36,13,4,5,hair);
 if(acc==='scarf')p+=r(17,29,14,4,'#f1b64b')+r(28,32,4,11,'#df9639')+r(28,39,4,2,'#f9ce68');
 if(acc==='goggles')p+=r(13,12,22,3,'#a8783b')+r(16,11,7,6,'#e9c472')+r(26,11,7,6,'#e9c472')+r(17,12,5,4,'#6ac6d8')+r(27,12,5,4,'#6ac6d8')+r(18,12,2,1,'#e8fbfa')+r(28,12,2,1,'#e8fbfa');
 if(acc==='crown')p+='<path d="M14 5L18 8L23 2L28 8L34 5V13H14Z" fill="#f7cb55"/>'+r(16,11,16,2,'#ac6c35')+r(23,8,3,3,'#64c8d5');
 if(acc==='wizard')p+='<path d="M13 10L24 0L34 10Z" fill="#6956ad"/>'+r(10,10,28,3,'#4c428c')+r(22,4,2,2,'#ffe58c')+r(28,8,2,2,'#c5c2ff');
 if(acc==='pumpkin')p+=r(32,38,10,11,'#dc7c30')+r(34,36,6,2,'#528256')+r(34,41,2,2,'#3d3940')+r(39,41,2,2,'#3d3940')+r(36,45,4,2,'#67402c');
 if(acc==='winter')p+='<path d="M14 10V5H28L35 10Z" fill="#c93f49"/>'+r(12,10,24,4,'#f2f1dd')+r(31,5,5,5,'#fff9dd')+r(17,5,3,4,'#e66b68');
 if(acc==='headset')p+=r(12,8,3,17,'#273952')+r(33,8,3,17,'#273952')+r(15,5,18,3,'#273952')+r(10,17,5,10,'#55c1c8')+r(33,17,5,10,'#55c1c8')+r(34,26,2,3,'#273952')+r(28,28,7,2,'#273952');
 const motion=a.motion||'still';
 const frames=spriteFrames(a,drawRewards(a.equipment,r,skin));
 const safe=String(label).replace(/[&<>"']/g,'');return `<svg class="pupil-avatar motion-${motion}" role="img" aria-label="${safe}" viewBox="0 0 48 72" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${frames}</svg>`;
}
