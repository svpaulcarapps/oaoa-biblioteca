import assert from 'node:assert/strict';
import fs from 'node:fs';import ts from 'typescript';
import {wordProblem,problemMethods,checkWordDiagram,checkWordSteps} from '../public/word-problems.js';
import {nextOperation,OperationHistory,createTree,splitNode,mergeNodes,activeNodes,removeNodes,finishTree,createClimb,setClimbStart,addJump,crossClimbStart,branchClimb,finishClimb,createDresses,dressRow,finishDresses} from '../public/engine.js';
let code=ts.transpileModule(fs.readFileSync('lib/math-ranking.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
for(const name of ['engine','word-problems','geoboard'])code=code.replace('../public/'+name+'.js',new URL('../public/'+name+'.js',import.meta.url).href);
const {validateSolution,rankingQuery}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const kinds=new Set();let count=0;
for(let level=1;level<=4;level++)for(let n=0;n<35;n++){
 const seed=nextOperation('problems',level<3?2:3,new OperationHistory(),level),p=wordProblem(seed);kinds.add(p.kind);
 for(const method of problemMethods(p)){
  const op={...seed,mode:method};let s;
  if(method==='add'){s=splitNode(createTree(op),0,[op.a-1,1]);s=mergeNodes(s,activeNodes(s).map(n=>n.id),p.answer)}
  else if(method==='subtract'){s=splitNode(createTree(op),0,[op.b,p.answer]);s=removeNodes(s,[2]);s=finishTree(s,p.answer)}
  else if(method==='climb'){s=setClimbStart(createClimb(op,true),op.b);s=addJump(s,p.answer,op.a);s=crossClimbStart(s);s=branchClimb(s);s=finishClimb(s,p.answer)}
  else{s=createDresses(op);for(let r=0;r<2;r++){const v=r?op.b:op.a;s=dressRow(s,r,[Math.floor(v/100)*100,Math.floor(v/10)%10*10,v%10])}s=finishDresses(s,[0,1,2].map(i=>s.rows[0][i]+s.rows[1][i]),p.answer)}
  const actions=[{type:'problemDiagram',model:'bars',values:p.values},{type:'problemOperation',operation:p.operation},{type:'problemMethod',method},...s.actions,{type:'problemAnswer',answer:p.answer}];
  assert(validateSolution(seed,actions));assert.throws(()=>validateSolution(seed,s.actions));assert.throws(()=>validateSolution(seed,actions.slice(0,-1)));const bad=structuredClone(actions);bad.at(-1).answer++;assert.throws(()=>validateSolution(seed,bad));count++;
 }
 assert(checkWordDiagram(p,{model:'parts',values:p.values}));assert.throws(()=>checkWordDiagram(p,{model:'bars',values:[p.answer,0,0]}));
}
assert.deepEqual([...kinds].sort(),['compare','join','missing']);assert(rankingQuery(new URLSearchParams('mode=problems')).values.includes('problems'));
console.log('PASS',count,'complete word-problem strategies, four levels, three relationships, wrong/missing steps rejected, ranking filter.');

