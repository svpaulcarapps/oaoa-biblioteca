// Genera la versión del juego para GitHub Pages en /juego (raíz del repositorio).
// La interfaz se sirve desde GitHub y los datos siguen en el proyecto de Apps Script
// JUEGOS OAOA, al que se llama de forma anónima por POST (doPost → oaoaRpc).
// Uso: node github/build-pages.mjs   (desde juegos/aventuras-matematicas)
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://script.google.com/macros/s/AKfycbzmig6AICLgEwQEpHXZt1Mkgc3opXDwvyDG1hSLKZMzZMzZqyf4ALBCoiL9AyapN4YC/exec';
// Recursos pesados que todavía no están en el repositorio (fuentes y fondos).
const REMOTE = 'https://rutas-de-calculo-oaoa.carlos-mercader-cone.chatgpt.site/assets/';
const out = path.resolve('../../juego');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out + '/assets/pixel', {recursive: true});

const local = new Set(fs.readdirSync('public/assets/pixel').map(f => 'pixel/' + f));
const fix = text => text.replace(/(['"(])\/assets\/([^'")]+)/g, (m, q, file) =>
  q + (local.has(file) ? 'assets/' + file : REMOTE + file));

for (const f of fs.readdirSync('public')) {
  if (!/\.(js|css)$/.test(f)) continue;
  fs.writeFileSync(out + '/' + f, fix(fs.readFileSync('public/' + f, 'utf8')));
}
for (const f of local) fs.copyFileSync('public/assets/' + f, out + '/assets/' + f);

const bridge = `<script>window.OAOA_ASSETS={};(()=>{const API=${JSON.stringify(API)};const nativeFetch=window.fetch.bind(window);window.fetch=(input,options={})=>{const url=typeof input==='string'?input:String(input);if(!url.startsWith('/api/'))return nativeFetch(input,options);const u=new URL(url,location.origin);const query=Object.fromEntries(u.searchParams);let body=null;try{body=options.body?JSON.parse(options.body):null}catch{}const token=sessionStorage.getItem('oaoa-session')||'';const req={path:u.pathname,method:options.method||'GET',query,body,headers:options.headers||{},token};return nativeFetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(req),credentials:'omit',redirect:'follow'}).then(r=>r.json()).then(result=>{if(result.body&&Object.hasOwn(result.body,'sessionToken')){if(result.body.sessionToken)sessionStorage.setItem('oaoa-session',result.body.sessionToken);else sessionStorage.removeItem('oaoa-session');delete result.body.sessionToken}return new Response(JSON.stringify(result.body),{status:result.status||200,headers:{'Content-Type':'application/json'}})},()=>{throw Error('No se ha podido conectar con el juego. Revisa la conexión y vuelve a intentarlo.')})}})();<\/script>`;

fs.copyFileSync('github/icon.svg', out + '/icon.svg');
fs.writeFileSync(out + '/manifest.webmanifest', JSON.stringify({
  name: 'Aventuras matemáticas · San Vicente de Paúl', short_name: 'Aventuras OAOA',
  start_url: './', scope: './', display: 'standalone', background_color: '#1d3b35', theme_color: '#294e46', lang: 'es',
  icons: [{src: 'icon-192.png', sizes: '192x192', type: 'image/png'}, {src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable'}, {src: 'icon.svg', sizes: 'any', type: 'image/svg+xml'}]
}, null, 2));
// Los PNG (icon-180/192/512) se generan a partir de icon.svg con: rsvg-convert -w N github/icon.svg
const route = fs.readFileSync('app/route.ts', 'utf8');
let html = JSON.parse(route.slice('const html='.length, route.indexOf(';\n')));
html = html
  .replace('<link rel="icon" type="image/svg+xml" href="/assets/pixel/sv-adventure-crest.svg">', '<link rel="icon" type="image/svg+xml" href="icon.svg"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Aventuras OAOA">')
  .replaceAll('"/assets/pixel/sv-adventure-crest.svg"', '"assets/pixel/sv-adventure-crest.svg"')
  .replace('href="/style.css"', 'href="style.css"')
  .replace('href="/pixel-theme.css"', 'href="pixel-theme.css"')
  .replace('<script type="module" src="/app.js"></script>', () => bridge + '<script type="module" src="app.js"></script>');
if (!html.includes('src="app.js"')) throw Error('No se encontró el script principal en la plantilla');
fs.writeFileSync(out + '/index.html', html);
console.log('Generado en', out, fs.readdirSync(out));
