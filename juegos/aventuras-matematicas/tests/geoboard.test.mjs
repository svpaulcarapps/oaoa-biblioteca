import assert from 'node:assert/strict';
import {polygon,geoboardChallenge,validateGeoboard,geoboardEvidence,checkGeoboard,pathMetrics} from '../public/geoboard.js';
let count=0;
for(let grade=1;grade<=6;grade++)for(let level=1;level<=4;level++)for(let seed=0;seed<32;seed++){
 const op={a:grade,b:seed,level},task=geoboardChallenge(op),answer=task.answer?.value??null;
 try{assert.equal(validateGeoboard(op,[geoboardEvidence(task.solution,answer)]),true);count++}catch(e){throw Error(`Curso ${grade}, nivel ${level}, variante ${seed}: ${e.message}`)}
 // Same polygon, opposite winding and another starting point are equally valid.
 assert.equal(checkGeoboard(task,[...task.solution].reverse(),answer),true);
 if(task.answer)assert.throws(()=>checkGeoboard(task,task.solution,answer+1));
 assert(task.source.includes(`OAOA ${grade}.º`));
}
assert.throws(()=>polygon([[0,0],[2,2],[0,2],[2,0]]));
assert.throws(()=>polygon([[0,0],[1,0],[2,0],[2,2],[0,2]]));
assert.throws(()=>polygon([[0,0],[0,0],[2,2]]));
assert.throws(()=>polygon([[0,0],[99,0],[1,1]],11));
assert.throws(()=>validateGeoboard({a:1,b:0,level:1},[]));
assert.throws(()=>geoboardChallenge({a:7,b:0,level:1}));
assert.throws(()=>geoboardChallenge({a:1,b:1.5,level:1}));
assert.equal(polygon([[0,0],[4,0],[0,3]]).area,6);
assert.equal(polygon([[0,0],[4,0],[0,3]]).perimeter,12);
assert.equal(polygon([[5,3],[8,6],[5,9],[2,6]],11).area,18);
assert.deepEqual(pathMetrics([[0,0],[0,3],[2,3]]),{horizontal:1,vertical:1,diagonal:0,segments:2});
// Open construction challenges accept different valid solutions, not just the example.
assert.equal(checkGeoboard(geoboardChallenge({a:5,b:0,level:2}),[[0,0],[4,0],[4,2],[0,2]]),true);
console.log(`PASS: ${count} course/level/variant combinations, reverse winding, open solutions, areas, perimeter, coordinates, malformed submissions and crossed edges.`);
