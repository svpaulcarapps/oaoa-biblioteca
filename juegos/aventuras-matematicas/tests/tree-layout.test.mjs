import assert from 'node:assert/strict';
import {createTree,splitNode,mergeNodes,alignTree,treeNodeX,treeBranchSigns,TREE_NODE_GAP} from '../public/engine.js';
function safe(s){
 for(const a of s.nodes)for(const b of s.nodes)if(a.id<b.id&&a.y===b.y)assert(Math.abs(a.x-b.x)>=TREE_NODE_GAP-1e-8,`Nodes ${a.id} and ${b.id} overlap`);
 for(const sign of treeBranchSigns(s))for(const n of s.nodes)if(Math.abs(n.y-sign.y)<65)assert(Math.abs(n.x-sign.x)>=72,'A plus sign overlaps a number');
 assert(s.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));return s;
}
let s=createTree({mode:'subtract',a:999,b:456});
s=safe(splitNode(s,0,[300,200,100,100,100,199]));
for(const n of [...s.nodes].filter(n=>n.active)){
 const q=Math.floor(n.value/6),parts=Array(5).fill(q).concat(n.value-5*q);
 s=safe(splitNode(s,n.id,parts));
}
assert(s.nodes.some(n=>n.x>900),'Dense rows must grow instead of being compressed');
assert.equal(treeBranchSigns(s).length,35);
const arranged=safe(alignTree(s));assert.deepEqual(alignTree(arranged),arranged);
const leaf=s.nodes.find(n=>n.active),other=s.nodes.find(n=>n.active&&n.id!==leaf.id);
leaf.x=treeNodeX(s,leaf.id,other.x);safe(s);
const selected=s.nodes.filter(n=>n.active).slice(0,3);s=safe(mergeNodes(s,selected.map(n=>n.id),selected.reduce((n,x)=>n+x.value,0)));
let add=createTree({mode:'add',a:999,b:888});add=splitNode(add,0,[300,200,100,100,100,199]);add=safe(splitNode(add,1,[100,100,100,100,100,388]));
for(const n of [...add.nodes].filter(n=>n.active&&n.value>=100))add=safe(splitNode(add,n.id,[Math.floor(n.value/2),n.value-Math.floor(n.value/2)]));
console.log('PASS: dense subtraction and addition branches, 36 nodes on a row, plus-sign clearance, repeated layout, merging and moving nodes without collisions.');
