import assert from 'node:assert/strict';
import {Game,enemyLook} from '../docs/engine.mjs';
import {INFIRMARY,COURTYARD,saveEnvelope,validSave} from '../docs/campaign.mjs';
for(const map of [INFIRMARY,COURTYARD]){
 const g=new Game(map);assert(!g.collision(g.player.x,g.player.y),'player spawn');g.buildNav();for(const point of [map.panel,map.exit,...(map.items||[]),...map.spawns,...map.wave]){assert(!g.collision(point.x,point.y,16),'point inside walkable floor '+JSON.stringify(point));assert(g.nav.dist[g.nav.idx(point.x,point.y)]>=0,'point reachable '+JSON.stringify(point));}
 g.player.x=map.panel.x;g.player.y=map.panel.y;g.restorePower();assert.equal(g.enemies.filter(e=>e.id>=100).length,map.wave.length);g.reset(g.checkpoint);assert(g.power);assert.equal(g.player.hp,100);
}
{
 const g=new Game(COURTYARD);g.enemies=[];g.player.x=1200;g.player.y=650;g.restorePower();g.enemies=g.enemies.filter(e=>e.kind==='boss');const boss=g.enemies[0];g.update(.04);assert(boss.windup>0,'boss telegraphs before slam');assert.equal(g.player.hp,100);for(let i=0;i<32;i++)g.update(.04);assert.equal(g.player.hp,72,'slam does 28 with grace');assert(boss.recovery>0,'counterattack window');g.player.x=COURTYARD.exit.x;g.player.y=COURTYARD.exit.y;g.charge=30;assert(!g.escape(),'boss blocks ending');boss.hp=0;g.charge=29;assert(!g.escape(),'charge blocks ending');g.update(.04);g.charge=30;assert(g.escape(),'final gate complete');
}
{
 const g=new Game(INFIRMARY);g.flags.medicine=true;g.flags.card=true;g.checkpoint=g.snapshot();const s=saveEnvelope(1,g,{kills:12,time:80},new Set(['card']));assert(validSave(s));const copy=structuredClone(s);copy.checkpoint.player.hp=NaN;assert(!validSave(copy));const restored=new Game(INFIRMARY);restored.reset(s.checkpoint);assert(restored.flags.card&&restored.flags.medicine);assert.equal(restored.enemies.length,g.enemies.length);
}
console.log('PASS: all campaign objective/spawn paths, stage checkpoints, boss telegraph/damage/recovery, ending gates and save restoration.');

{const g=new Game(INFIRMARY);assert.equal(new Set(g.enemies.map(enemyLook)).size,3,'students, teachers and custodians');const oldSave=g.snapshot();for(const e of oldSave.enemies)delete e.appearance;g.reset(oldSave);assert.equal(new Set(g.enemies.map(enemyLook)).size,3,'old checkpoints gain cast variety without reset');const boss=g.makeEnemy(0,0,100,'boss');assert.equal(enemyLook(boss),'boss');assert.equal(boss.hp,408,'boss balance preserved');}
