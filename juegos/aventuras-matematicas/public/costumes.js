// Each complete animated outfit retains the selected character's identity.
export const COSTUMES=[
 {id:'hedgehog',label:'Pijama Sonic',points:0,coins:0,variants:{boy:'/assets/costumes/hedgehog-v7.webp',girl:'/assets/costumes/hedgehog-girl-v10.webp',curly:'/assets/costumes/hedgehog-curly-v10.webp',bob:'/assets/costumes/hedgehog-bob-v10.webp'}},
 {id:'electric',label:'Pijama Pikachu',points:0,coins:0,variants:{boy:'/assets/costumes/electric-v8.webp'}}
];
export const costumeById=id=>COSTUMES.find(c=>c.id===id);
