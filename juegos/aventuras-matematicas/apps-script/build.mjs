import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),esbuild=require('../node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild/lib/main.js');
const out=path.resolve('../apps-script-transfer');fs.mkdirSync(out,{recursive:true});
const deps=await esbuild.build({entryPoints:['apps-script/dependencies-entry.js'],bundle:true,write:false,format:'iife',globalName:'OAOADeps',platform:'browser',target:'es2020'});
let server=fs.readFileSync('apps-script/server.js','utf8').replace('HtmlService.createHtmlOutput(OAOA_CLIENT_HTML)',"HtmlService.createTemplateFromFile('Index').evaluate()");
fs.writeFileSync(out+'/Code.gs',deps.outputFiles[0].text+'\n'+server+"\nfunction include_(name){return HtmlService.createHtmlOutputFromFile(name).getContent();}\n");
const client=await esbuild.build({entryPoints:['public/app.js'],bundle:true,write:false,format:'iife',platform:'browser',target:'es2020'});
const route=fs.readFileSync('app/route.ts','utf8');let html=JSON.parse(route.slice('const html='.length,route.indexOf(';\n')));
let css=fs.readFileSync('public/style.css','utf8')+'\n'+fs.readFileSync('public/pixel-theme.css','utf8');
const base='https://rutas-de-calculo-oaoa.carlos-mercader-cone.chatgpt.site';
css=css.replaceAll("url('/assets/","url('"+base+"/assets/").replaceAll('url("/assets/','url("'+base+'/assets/');
html=html.replace('<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/pixel-theme.css">','<style>'+css+'</style>').replaceAll('src="/assets/','src="'+base+'/assets/').replaceAll('href="/assets/','href="'+base+'/assets/');
const assetFiles={SpritesSport:['/assets/pixel/avatars-sports-v3.webp'],SpritesFormal:['/assets/pixel/avatars-formal-v3.webp'],SpritesSummer:['/assets/pixel/avatars-summer-v4.webp']};
// Public artwork is versioned in the game's own GitHub repository. Student data remains private.
const artAssets=Object.fromEntries(fs.readdirSync('public/assets/art').map(file=>['/assets/art/'+file,'https://svpaulcarapps.github.io/aventuras-matematicas/assets/art/'+file]));
const assets={};for(const names of Object.values(assetFiles))for(const name of names)assets[name]='data:image/webp;base64,'+fs.readFileSync('public'+name).toString('base64');

const logo='data:image/webp;base64,'+fs.readFileSync('public/assets/art/oaoa-logo-v5.webp').toString('base64');html=html.replaceAll(base+'/assets/art/oaoa-logo-v5.webp',logo);
const bridge=`window.OAOA_ASSETS=${JSON.stringify(artAssets)};<?!= include_('SpritesSport') ?><?!= include_('SpritesFormal') ?><?!= include_('SpritesSummer') ?>(()=>{const nativeFetch=window.fetch.bind(window);window.fetch=(input,options={})=>{const url=typeof input==='string'?input:String(input);if(!url.startsWith('/api/'))return nativeFetch(input,options);const u=new URL(url,'https://oaoa.local');const query=Object.fromEntries(u.searchParams);let body=null;try{body=options.body?JSON.parse(options.body):null}catch{}const token=sessionStorage.getItem('oaoa-session')||'';return new Promise((resolve,reject)=>google.script.run.withSuccessHandler(result=>{if(result.body&&Object.hasOwn(result.body,'sessionToken')){if(result.body.sessionToken)sessionStorage.setItem('oaoa-session',result.body.sessionToken);else sessionStorage.removeItem('oaoa-session');delete result.body.sessionToken}resolve(new Response(JSON.stringify(result.body),{status:result.status,headers:{'Content-Type':'application/json'}}))}).withFailureHandler(e=>reject(Error(e.message||'No se ha podido conectar con el juego.'))).oaoaRpc({path:u.pathname,method:options.method||'GET',query,body,headers:options.headers||{},token}))}})();`;
const js=bridge+'\n'+client.outputFiles[0].text;
html=html.replace('<script type="module" src="/app.js"></script>',()=>'<script>'+js.replaceAll('</script','<\\/script')+'</script>');
fs.writeFileSync(out+'/Index.html',html);
fs.writeFileSync(out+'/appsscript.json',JSON.stringify({timeZone:'Europe/Madrid',dependencies:{},exceptionLogging:'STACKDRIVER',runtimeVersion:'V8',webapp:{executeAs:'USER_DEPLOYING',access:'ANYONE_ANONYMOUS'}},null,2));
for(const [file,names] of Object.entries(assetFiles))fs.writeFileSync(out+'/'+file+'.html',names.map(name=>'window.OAOA_ASSETS['+JSON.stringify(name)+']='+JSON.stringify(assets[name])+';').join('\n'));
for(const file of ['Code.gs','Index.html','SpritesSport.html','SpritesFormal.html','SpritesSummer.html']){fs.writeFileSync(out+'/transfer-'+file+'.html','<!doctype html><meta charset="utf-8"><title>Transferir '+file+'</title><h1>'+file+'</h1><p>Código preparado para el proyecto JUEGOS OAOA.</p><button onclick="document.querySelector(\'textarea\').hidden=false">Ver código preparado</button><textarea aria-label="Código preparado" style="width:95vw;height:75vh" hidden>'+fs.readFileSync(out+'/'+file,'utf8').replaceAll('&','&amp;').replaceAll('<','&lt;')+'</textarea>')}
console.log(JSON.stringify({out,codeBytes:fs.statSync(out+'/Code.gs').size,htmlBytes:fs.statSync(out+'/Index.html').size}));
