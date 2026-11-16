// Genera la versión del juego para GitHub Pages en /juego (raíz del repositorio).
// La interfaz se sirve desde GitHub y los datos siguen en el proyecto de Apps Script
// JUEGOS OAOA, al que se llama de forma anónima por POST (doPost → oaoaRpc).
// Uso: node github/build-pages.mjs   (desde juegos/aventuras-matematicas)
import fs from 'node:fs';
import path from 'node:path';

// Bust browser caches for the changed editor modules and interface styles.
const VERSION = '20261116-geoboard-v12';
const versionScripts = text => text.replace(/(['"])(\.\/[^'"]+\.js)\1/g, (m,q,file)=>q+file+'?v='+VERSION+q);

const API = 'https://script.google.com/macros/s/AKfycbzmig6AICLgEwQEpHXZt1Mkgc3opXDwvyDG1hSLKZMzZMzZqyf4ALBCoiL9AyapN4YC/exec';
// Recursos pesados que todavía no están en el repositorio (fuentes y fondos).
const REMOTE = 'https://rutas-de-calculo-oaoa.carlos-mercader-cone.chatgpt.site/assets/';
const out = path.resolve(process.argv[2] || '../../juego');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out + '/assets/pixel', {recursive: true});

function files(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(path.join(dir,f.name),prefix+f.name+'/'):[prefix+f.name])}
const local = new Set(files('public/assets'));
const fix = text => text.replace(/(['"(])\/assets\/([^'")]+)/g, (m, q, file) =>
  q + (local.has(file) ? 'assets/' + file : REMOTE + file));

for (const f of fs.readdirSync('public')) {
  if (!/\.(js|css)$/.test(f)) continue;
  fs.writeFileSync(out + '/' + f, versionScripts(fix(fs.readFileSync('public/' + f, 'utf8'))));
}
for(const f of local){fs.mkdirSync(path.dirname(out+'/assets/'+f),{recursive:true});fs.copyFileSync('public/assets/'+f,out+'/assets/'+f)}

const bridge = `<script>window.OAOA_ASSETS={};(()=>{const API=${JSON.stringify(API)};const nativeFetch=window.fetch.bind(window);window.fetch=(input,options={})=>{const url=typeof input==='string'?input:String(input);if(!url.startsWith('/api/'))return nativeFetch(input,options);const u=new URL(url,location.origin);const query=Object.fromEntries(u.searchParams);let body=null;try{body=options.body?JSON.parse(options.body):null}catch{}const token=sessionStorage.getItem('oaoa-session')||'';const req={path:u.pathname,method:options.method||'GET',query,body,headers:options.headers||{},token};return nativeFetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(req),credentials:'omit',redirect:'follow'}).then(r=>r.json()).then(result=>{if(result.body&&Object.hasOwn(result.body,'sessionToken')){if(result.body.sessionToken)sessionStorage.setItem('oaoa-session',result.body.sessionToken);else sessionStorage.removeItem('oaoa-session');delete result.body.sessionToken}return new Response(JSON.stringify(result.body),{status:result.status||200,headers:{'Content-Type':'application/json'}})},()=>{throw Error('No se ha podido conectar con el juego. Revisa la conexión y vuelve a intentarlo.')})}})();<\/script>`;

fs.writeFileSync(out+'/manifest.webmanifest',JSON.stringify({name:'Aventuras matemáticas · San Vicente de Paúl',short_name:'Aventuras OAOA',start_url:'./',scope:'./',display:'standalone',background_color:'#eef5fc',theme_color:'#14539c',lang:'es',icons:[192,512].map(n=>({src:'assets/art/app-icon-'+n+'.png',sizes:n+'x'+n,type:'image/png'}))},null,2));
const route = fs.readFileSync('app/route.ts', 'utf8');
let html = JSON.parse(route.slice('const html='.length, route.indexOf(';\n')));
html=fix(html).replace('href="/style.css"','href="style.css?v='+VERSION+'"').replace('href="/pixel-theme.css"','href="pixel-theme.css?v='+VERSION+'"').replace('href="/geoboard.css"','href="geoboard.css?v='+VERSION+'"').replace('</head>','<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="assets/art/app-icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Aventuras OAOA"></head>').replace('<script type="module" src="/app.js"></script>',()=>bridge+'<script type="module" src="app.js?v='+VERSION+'"></script>');
if (!html.includes('src="app.js?v=')) throw Error('No se encontró el script principal en la plantilla');
fs.writeFileSync(out + '/index.html', html);
console.log('Generado en', out, fs.readdirSync(out));

