// Code-native pixel pictograms. Text labels remain ordinary, readable text.
const ink='#173553';
export function pixelIcon(name){const art={
 tree:`<path fill="#71a943" d="M5 1h6v2h3v7h-3v2H4v-2H1V4h4z"/><path fill="#3d7d3c" d="M1 6h4v4h6v2H4v-2H1z"/><path fill="#99603c" d="M7 10h3v6H7z"/>`,
 climb:`<path fill="#73839a" d="M1 14h3v-3h3V8h3V5h3V2h2v14H1z"/><path fill="#ffc451" d="M5 2h3v3H5zM4 6h5v2H4zM3 8h3v4H3zM8 8h3v3H8z"/>`,
 dress:`<path fill="#64b9b4" d="M5 1h2v2h2V1h2v6l4 8H1l4-8z"/><path fill="#277b89" d="M6 7h4v2H6zM5 10h2v4H4z"/>`,
 bag:`<path fill="#e1b557" d="M5 1h7l-2 4 4 4v5l-2 2H3l-2-2V9l4-4z"/><path fill="#aa7f35" d="M4 4h7v2H4zM2 12h2v2h8v2H3l-2-2z"/><path fill="#745226" d="M7 7h2v7H7zM5 8h6v2H5zM5 11h6v2H5z"/>`,
 target:`<path fill="#e55b46" d="M4 1h8v2h2v2h2v7h-2v2h-2v2H4v-2H2v-2H0V5h2V3h2z"/><path fill="#fff6df" d="M5 4h6v2h2v5h-2v2H5v-2H3V6h2z"/><path fill="#cc3939" d="M6 6h4v4H6z"/><path fill="#173553" d="M8 7h2V5h2V3h2V1h2v4h-2v2h-2v2H8z"/>`,
 ball:`<path fill="#4c9bde" d="M5 1h6v1h2v2h2v8h-2v2h-2v1H5v-1H3v-2H1V4h2V2h2z"/><path fill="#2264a1" d="M2 10h3v2h6v-2h3v3h-3v2H5v-1H3v-2H2z"/><path fill="#bfe8fa" d="M5 3h5v2H5zM3 5h2v2H3z"/>`,
 trophy:`<path fill="#ffd05a" d="M4 1h8v7l-3 3v2h4v3H3v-3h4v-2L4 8z"/><path fill="#d4962d" d="M9 2h3v6l-3 3z"/><path fill="#efb536" d="M1 2h3v2H2v3h3v2H2L0 7V2zM12 2h4v5l-2 2h-3V7h3V4h-2z"/>`,
 clock:`<path fill="#fff8df" d="M4 1h8v2h2v2h1v7h-2v2h-2v1H4v-2H2v-2H1V5h1V3h2z"/><path fill="#355a78" d="M7 3h2v5h4v2H7zM4 0h8v2H4zM4 14h8v2H4zM0 4h2v8H0zM14 4h2v8h-2z"/>`,
 book:`<path fill="#fff2c1" d="M1 2h5l2 2 2-2h5v12h-5l-2 1-2-1H1z"/><path fill="#db7148" d="M0 2h2v11h4l2 1 2-1h4V2h2v13h-6l-2 1-2-1H0z"/><path fill="#b29a63" d="M7 4h2v10H7zM3 5h3v1H3zM10 5h3v1h-3z"/>`,
 speaker:`<path fill="#426c91" d="M1 6h3l5-4v12l-5-4H1z"/><path fill="#73b4d3" d="M11 5h2v6h-2zM14 3h2v10h-2z"/>`,
 mute:`<path fill="#426c91" d="M1 6h3l5-4v12l-5-4H1z"/><path fill="#d64c3b" d="M11 5h2v2h2v2h-2v2h-2V9h2V7h-2z"/>`,
 bulb:`<path fill="#ffda65" d="M5 1h6v2h2v6h-2v3H5V9H3V3h2z"/><path fill="#946f2b" d="M5 12h6v2H5zM6 15h4v1H6z"/><path fill="#fff6bc" d="M5 3h3v2H5z"/>`,
 star:`<path fill="#ffcd4c" d="M7 0h2v4h3v2h4v2h-3v3h-2v4H9v-2H7v2H5v-4H3V8H0V6h4V4h3z"/><path fill="#ffeaae" d="M7 4h2v4H5V6h2z"/>`,
 plant:`<path fill="#bd6a3c" d="M3 9h10v3h-1v4H4v-4H3z"/><path fill="#e8a36a" d="M2 9h12v2H2z"/><path fill="#5c9a45" d="M7 4h2v5H7zM1 2h4v2h2v3H3V5H1zM10 0h4v4h-2v2H9V3h1z"/>`,
 basket:`<path fill="#b17a3b" d="M1 7h14v2h-1v6H2V9H1zM4 1h8v2H4zM2 3h2v4H2zM12 3h2v4h-2z"/><path fill="#f5cf76" d="M3 9h2v5H3zM7 9h2v5H7zM11 9h2v5h-2z"/>`,
 shirt:`<path fill="#d44237" d="M5 1h2v2h2V1h2l5 4-3 4-2-1v8H5V8L3 9 0 5z"/><path fill="#fbf0d3" d="M6 5h4v2H6z"/>`,
 box:`<path fill="#d8a25a" d="M1 4l7-3 7 3v10l-7 2-7-2z"/><path fill="#9c6636" d="M7 7h2v9H7z"/><path fill="#f3d697" d="M1 4l7 3 7-3v2L8 9 1 6zM7 1h2v6H7z"/>`,
 bus:`<path fill="#edb83d" d="M1 2h13l2 3v8H0V3z"/><path fill="#8dd0e7" d="M2 4h3v4H2zM6 4h3v4H6zM10 4h3v4h-3z"/><path fill="#243f59" d="M2 12h3v4H2zM11 12h3v4h-3z"/>`,
 plate:`<path fill="#d7e4ee" d="M5 1h6v2h3v10h-3v2H5v-2H2V3h3z"/><path fill="#fdf8e8" d="M5 4h6v8H5z"/><path fill="#71899a" d="M0 1h1v15H0zM15 1h1v15h-1z"/>`,
 gift:`<path fill="#de5848" d="M1 6h14v9H1z"/><path fill="#f7c65a" d="M7 5h2v10H7zM0 4h16v3H0z"/><path fill="#d6a244" d="M4 0h3v2h2V0h3v2h-2v2H6V2H4z"/>`
};return `<svg class="pixel-icon" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${art[name]||art.star}</svg>`}
const glyphs={'🌳':'tree','🌿':'tree','🌱':'plant','🧗':'climb','👗':'dress','💰':'bag','🎯':'target','🔵':'ball','🏆':'trophy','🥇':'trophy','🥈':'trophy','🥉':'trophy','⏱':'clock','📖':'book','📚':'book','🔊':'speaker','🔇':'mute','💡':'bulb','✨':'star','⭐':'star','🪴':'plant','🧺':'basket','👕':'shirt','📦':'box','🍽️':'plate','🚌':'bus','🎁':'gift'};
const regex=new RegExp(Object.keys(glyphs).sort((a,b)=>b.length-a.length).join('|'),'gu');
export function installPixelIcons(){function replace(root){if(root.nodeType===1&&root.closest('svg,script,style,textarea,input,option'))return;const nodes=[];if(root.nodeType===3)nodes.push(root);else{const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);for(let n;n=walk.nextNode();)if(!n.parentElement?.closest('svg,script,style,textarea,input,option'))nodes.push(n)}for(const n of nodes){const text=n.nodeValue;regex.lastIndex=0;if(!regex.test(text))continue;regex.lastIndex=0;const fragment=document.createDocumentFragment();let offset=0;for(const match of text.matchAll(regex)){fragment.append(document.createTextNode(text.slice(offset,match.index)));const holder=document.createElement('span');holder.className='pixel-icon-wrap';holder.innerHTML=pixelIcon(glyphs[match[0]]);fragment.append(holder);offset=match.index+match[0].length}fragment.append(document.createTextNode(text.slice(offset)));n.replaceWith(fragment)}}replace(document.body);new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.isConnected)replace(node)}).observe(document.body,{childList:true,subtree:true})}
