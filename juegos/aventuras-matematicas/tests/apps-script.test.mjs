import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const props=new Map([['ACCOUNTS_ADMIN_KEY','test-admin']]);const sheets=[];
function sheet(){const s={name:'',values:[],setName(n){this.name=n;return this},getDataRange(){return {getValues:()=>structuredClone(this.values)}},getRange(row,col,rows,cols){return {setValues:values=>{for(let i=0;i<values.length;i++){s.values[row-1+i]??=[];for(let j=0;j<values[i].length;j++)s.values[row-1+i][col-1+j]=values[i][j]}return {setFontWeight(){return this}}}}},setFrozenRows(){},appendRow(row){this.values.push(row)},getLastRow(){return this.values.length}};return s}
const ss={getId:()=> 'private-test-sheet',getSheets:()=>sheets,insertSheet(){const s=sheet();sheets.push(s);return s},getSheetByName:n=>sheets.find(s=>s.name===n)};sheets.push(sheet());
const backup=JSON.parse(fs.readFileSync('../student-backup-private.json','utf8'));const context=vm.createContext({console,Uint8Array,TextEncoder,TextDecoder,Date,Math,JSON,Map,Set,URL,URLSearchParams,PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},SpreadsheetApp:{create:()=>ss,openById:()=>ss,flush(){}},LockService:{getScriptLock:()=>({tryLock:()=>true,waitLock(){},releaseLock(){}})},Utilities:{getUuid:()=>crypto.randomUUID(),base64Decode:s=>[...Buffer.from(s,'base64')],newBlob:value=>({getBytes:()=>[...Buffer.from(String(value))],getDataAsString:()=>Array.isArray(value)?Buffer.from(value).toString():String(value)})},STUDENT_BACKUP_B64:Buffer.from(JSON.stringify(backup)).toString('base64')});
vm.runInContext(fs.readFileSync('../apps-script-transfer/Code.gs','utf8'),context);
assert(context.prepararOaoa().includes('1402'));assert(context.prepararOaoa().includes('sin cambios'));
const originalTotal=backup.tables.math_runs.reduce((s,r)=>s+Number(r.points||0),0);assert.equal(context.table_('math_runs').rows.reduce((s,r)=>s+Number(r.points||0),0),originalTotal);
assert.equal(context.passwordHash_('test-password','test-salt'),'test-salt:'+crypto.pbkdf2Sync('test-password','test-salt',100000,32,'sha256').toString('hex'));
const call=(path,body=null,extra={})=>context.oaoaRpc({path,method:body?'POST':'GET',body,query:{},...extra});
let r=call('/api/accounts',{action:'register',username:'testmigration',name:'Test Migration',room:'3A',password:'abcdefg'});assert.equal(r.status,201);const token=r.body.sessionToken,id=r.body.account.id;
r=call('/api/accounts',null,{token});assert.equal(r.body.account.id,id);
r=call('/api/accounts',{action:'register',username:'Upper Case',name:'Other Name',room:'3A',password:'abcdefg'});assert.equal(r.status,400);
r=call('/api/accounts',{action:'avatar',avatar:{skin:0,hair:0,style:0,outfit:0,accessory:'none',motion:'dance',character:'girl',equipment:{}}},{token});assert.equal(r.status,200);
r=call('/api/accounts',{action:'reset',id},{headers:{'X-Accounts-Key':'test-admin'}});assert.equal(r.status,200);const replacement=r.body.password;
assert.equal(call('/api/accounts',null,{token}).body.account,null);
assert.equal(call('/api/accounts',{action:'login',login:'testmigration',password:replacement}).status,200);
const ranks=call('/api/math');assert.equal(ranks.status,200);assert(ranks.body.rows.length>0);assert.equal(context.table_('math_runs').rows.length,1402);
console.log('PASS: Apps Script imports 1402 runs without losing total points, PBKDF2 matches existing hashes, usernames, sessions, avatar saves, recovery and rankings.');
// Multiple schools: same classroom/alias is distinct; usernames remain global.
context.actualizarColegiosOaoa();
const schoolRegister=call('/api/accounts',{action:'register',username:'fixtureothersch',name:'Alumno multico',room:'3A',school:'sc-cartagena',password:'fixture-pass'});
assert.equal(schoolRegister.status,201);assert.equal(schoolRegister.body.account.school,'sc-cartagena');
const otherRegister=call('/api/accounts',{action:'register',username:'fixtureotherpal',name:'Alumno multico',room:'3A',school:'sv-palmar',password:'fixture-pass'});
assert.equal(otherRegister.status,201);assert.equal(otherRegister.body.account.school,'sv-palmar');
assert.equal(call('/api/accounts',{action:'register',username:'fixtureinvalid',name:'Inválido',room:'3A',school:'unknown',password:'fixture-pass'}).status,400);
const filtered=context.oaoaRpc({path:'/api/math',method:'GET',query:{school:'sc-cartagena'}});assert.equal(filtered.status,200);assert.equal(filtered.body.rows.length,0);
assert.equal(context.table_('math_runs').rows.reduce((s,r)=>s+Number(r.points||0),0),originalTotal);
console.log('PASS: four-school migration preserves every historical point; school identities and ranking filters remain separate.');
// New complete costumes can be saved at zero points; penalties are server-computed and idempotent.
const {createSacks,joinSack,finishSack,nextOperation,OperationHistory,sum}=await import('../public/engine.js');
const zeroToken=otherRegister.body.sessionToken,sonicAvatar={...context.OAOADeps.DEFAULT_AVATAR,costume:'hedgehog'};
assert.equal(call('/api/accounts',{action:'avatar',avatar:sonicAvatar},{token:zeroToken}).status,200);
assert.equal(call('/api/accounts',{action:'avatar',avatar:{...sonicAvatar,costume:'unknown'}},{token:zeroToken}).status,400);
const seed=nextOperation('sacks',2,new OperationHistory(),1);let sack=createSacks(seed);sack=joinSack(sack,sack.pieces.map(p=>p.id),sum(sack.amounts));sack=finishSack(sack,sum(sack.amounts));
const begun=call('/api/math',{action:'start',mode:'sacks',level:1,a:seed.a,b:seed.b},{token:zeroToken});assert.equal(begun.status,200);
const scored=call('/api/math',{action:'finish',id:begun.body.id,actions:sack.actions,mistakes:2},{token:zeroToken});assert.equal(scored.status,200,JSON.stringify(scored.body));assert.equal(scored.body.penalty,20);assert.equal(scored.body.points,scored.body.base+scored.body.bonus-20);
const repeated=call('/api/math',{action:'finish',id:begun.body.id,actions:sack.actions,mistakes:0},{token:zeroToken});assert.equal(repeated.body.points,scored.body.points);assert.equal(context.table_('math_runs').rows.slice(0,1402).reduce((s,r)=>s+Number(r.points||0),0),originalTotal);
console.log('PASS: free Sonic at zero points; two failed attempts deduct 20; retries do not change saved points; historical scores preserved.');
