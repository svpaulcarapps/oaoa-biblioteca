export const ROD_UNIT=16;
export const rodSize=n=>({width:(n.vertical?1:n.size)*ROD_UNIT,height:(n.vertical?n.size:1)*ROD_UNIT});
export function rodsOverlap(a,b){const x=rodSize(a),y=rodSize(b);return a.x<b.x+y.width&&a.x+x.width>b.x&&a.y<b.y+y.height&&a.y+x.height>b.y;}
export function rodPositionFree(n,items,width,height){const s=rodSize(n);return n.x>=0&&n.y>=0&&n.x+s.width<=width&&n.y+s.height<=height&&!items.some(v=>v.id!==n.id&&rodsOverlap(n,v));}
export function findRodPosition(n,items,width,height=4096){const s=rodSize(n),candidate={...n,x:Math.max(0,Math.min(Math.floor((width-s.width)/16)*16,Math.round(n.x/16)*16)),y:Math.max(0,Math.round(n.y/16)*16)};if(rodPositionFree(candidate,items,width,height))return candidate;for(let y=0;y+s.height<=height;y+=16)for(let x=0;x+s.width<=width;x+=16){const next={...n,x,y};if(rodPositionFree(next,items,width,height))return next}return null;}
export function packRods(items,width,height=4096){const placed=[];for(const n of items){const next=findRodPosition(n,placed,width,height);if(!next)throw Error('No queda espacio libre en el tablero.');placed.push(next)}return placed;}
