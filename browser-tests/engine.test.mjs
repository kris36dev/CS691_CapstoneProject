import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,MAP} from '../docs/engine.mjs';
Object.assign(MAP,JSON.parse(fs.readFileSync(new URL('../docs/assets/map.json',import.meta.url))));
const tick=(g,t,input={})=>{for(let i=0;i<t*100;i++)g.update(.01,input);};
const clean=()=>{const g=new Game(MAP);g.enemies=[];return g;};
{
 const g=clean();g.player.x=700;g.player.y=1070;tick(g,.4,{x:1,y:0});const straight=Math.hypot(g.player.x-700,g.player.y-1070);g.player.x=700;g.player.y=1070;tick(g,.4,{x:1,y:1});assert(Math.abs(Math.hypot(g.player.x-700,g.player.y-1070)-straight)<.01,'diagonal speed');
 g.player.x=690;g.player.y=MAP.bounds.y+14;tick(g,.2,{y:-1});assert.equal(g.player.moving,false);assert.equal(g.player.walk,0,'no walking against wall');
}
{
 const g=clean();g.player.x=600;g.player.y=1050;g.face(1,0);g.enemies=[g.makeEnemy(660,1050,0),g.makeEnemy(530,1050,1)];g.attack();tick(g,.5);assert.equal(g.enemies[0].hp,30,'one hit per swing');assert.equal(g.enemies[1].hp,64,'attack respects facing');tick(g,.2);g.enemies[0].x=660;g.attack();tick(g,.4);assert.equal(g.kills,1);assert.equal(g.enemies[0].hp,-4);assert(g.player.stamina>=0&&g.player.stamina<=100);
}
{
 const g=clean();g.player.x=600;g.player.y=1050;const e=g.makeEnemy(620,1050,0);assert(g.dodge(1,0));g.hurt(12,e);assert.equal(g.player.hp,100);tick(g,.35);g.hurt(12,e);assert.equal(g.player.hp,88);g.hurt(12,e);assert.equal(g.player.hp,88,'hurt grace');g.player.hp=20;assert(g.heal());assert.equal(g.player.hp,65);assert.equal(g.player.medkits,1);
}
{
 const g=clean();assert.equal(g.escape(),false);g.player.x=MAP.panel.x;g.player.y=MAP.panel.y;assert(g.restorePower());assert.equal(g.restorePower(),false);assert.equal(g.enemies.length,5);const checkpoint=g.checkpoint;g.player.hp=0;g.dead=true;g.reset(checkpoint);assert(g.power);assert.equal(g.player.hp,100);assert.equal(g.enemies.length,5);assert.equal(g.dead,false);g.player.x=MAP.exit.x;g.player.y=MAP.exit.y;g.enemies[0].x=MAP.exit.x-70;g.enemies[0].y=MAP.exit.y;assert.equal(g.escape(),false,'threat blocks gate');g.enemies=[];assert(g.escape());assert(g.won);
}
{
 const g=new Game(MAP);for(const e of g.enemies)assert(!g.collision(e.x,e.y,13),'enemy spawn clear '+e.id);assert(!g.collision(g.player.x,g.player.y));assert(!g.collision(MAP.panel.x,MAP.panel.y));assert(!g.collision(MAP.exit.x,MAP.exit.y));g.buildNav();const nav=g.nav;assert(nav.dist[nav.idx(MAP.panel.x,MAP.panel.y)]>=0,'panel reachable');assert(nav.dist[nav.idx(MAP.exit.x,MAP.exit.y)]>=0,'exit reachable');
 // A pursuer must route through the actual classroom door, not through its wall.
 g.enemies=[g.makeEnemy(1640,660,0)];g.enemies[0].speed=100;g.player.x=1610;g.player.y=1010;tick(g,8);assert(g.enemies[0].y>930,'enemy reached corridor through doorway');
}
{
 const g=new Game(MAP);g.player.x=MAP.panel.x;g.player.y=MAP.panel.y;g.buildNav();for(const e of g.enemies)assert(g.nav.dist[g.nav.idx(e.x,e.y)]>=0,'enemy navigation connected '+e.id);
}
const hero=JSON.parse(fs.readFileSync(new URL('../docs/assets/hero.json',import.meta.url)));const zombie=JSON.parse(fs.readFileSync(new URL('../docs/assets/zombie.json',import.meta.url)));assert.equal(hero.frames.length,36);assert.equal(zombie.frames.length,18);assert(hero.frames.slice(0,18).every(f=>f.legs.length===2),'both legs articulated in every walk frame');
console.log('PASS: collision, diagonal speed, stopped gait, directional damage, single-hit windows, dodge, hurt recovery, healing, power gate, checkpoint, spawns, map routes, enemy pursuit, animation metadata.');
