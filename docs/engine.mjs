export const WORLD={w:2304,h:1536};
export const MAP={bounds:{x:120,y:355,w:2064,h:1050},obstacles:[],panel:{x:1800,y:610},exit:{x:2120,y:1120},start:{x:300,y:1080}};
export function direction(x,y){return Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up');}
export function normalize(x,y){const l=Math.hypot(x,y);return l?{x:x/l,y:y/l}:{x:0,y:0};}
export const ENEMY_LOOKS=['studentMale','zombie','studentMale','teacher','studentMale','zombie'];
export function enemyLook(enemy){return enemy.kind==='boss'?'boss':enemy.appearance||ENEMY_LOOKS[Math.abs(enemy.id||0)%ENEMY_LOOKS.length];}
export class Game{
 constructor(map=MAP){this.map=map;this.checkpoint=null;this.reset();}
 reset(saved=null){this.seed=739;this.time=0;this.flags={};this.charge=0;this.power=false;this.won=false;this.dead=false;this.kills=0;this.events=[];this.particles=[];this.stains=[];this.corpses=[];this.player={x:this.map.start.x,y:this.map.start.y,hp:100,stamina:100,medkits:2,dir:'right',fx:1,fy:0,walk:0,moving:false,attack:0,attackFrame:0,attackId:0,invuln:0,dodge:0,dodgeCd:0,dx:0,dy:0};
 const b=this.map.bounds;this.enemies=(this.map.spawns||[{x:630,y:1070},{x:860,y:1150},{x:1070,y:1010},{x:1230,y:1140},{x:1490,y:990},{x:1630,y:1140},{x:1820,y:1040},{x:1990,y:1150},{x:1750,y:690},{x:1880,y:670},{x:1310,y:530},{x:1510,y:510}]).map((p,i)=>this.makeEnemy(p.x,p.y,i,p.kind));
 if(saved){Object.assign(this,JSON.parse(JSON.stringify(saved)));this.events=[];this.player.attack=0;this.player.dodge=0;this.player.moving=false;this.player.invuln=1.8;this.dead=false;this.won=false;}else this.checkpoint=null;
 this.nav=null;this.navCooldown=0;this.enemies=this.enemies.filter(e=>e.x>b.x&&e.x<b.x+b.w&&e.y>b.y&&e.y<b.y+b.h);}
 makeEnemy(x,y,id,kind="normal"){return{id,x,y,kind,appearance:kind==="boss"?"boss":ENEMY_LOOKS[Math.abs(id)%ENEMY_LOOKS.length],maxHp:kind==="boss"?408:kind==="runner"?42:64,hp:kind==="boss"?408:kind==="runner"?42:64,dir:'left',walk:0,moving:false,windup:0,recovery:0,stagger:0,lastHit:-1,fx:0,fy:1,speed:kind==="boss"?72:kind==="runner"?87:43+(id%4)*6};}
 random(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}
 emit(type,data={}){this.events.push({type,...data});}
 collision(x,y,r=14){const b=this.map.bounds;if(x-r<b.x||y-r<b.y||x+r>b.x+b.w||y+r>b.y+b.h)return true;if(this.map.walkable){for(const [dx,dy]of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]])if(!this.map.walkable.some(o=>x+dx>=o[0]&&x+dx<=o[2]&&y+dy>=o[1]&&y+dy<=o[3]))return true;}return this.map.obstacles.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h);}
 moveBody(body,dx,dy,r=14){const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/7));let moved=false;for(let i=0;i<steps;i++){if(!this.collision(body.x+dx/steps,body.y,r)){body.x+=dx/steps;moved||=Math.abs(dx)>0;}if(!this.collision(body.x,body.y+dy/steps,r)){body.y+=dy/steps;moved||=Math.abs(dy)>0;}}return moved;}
 face(x,y){if(Math.hypot(x,y)<.01)return;const n=normalize(x,y);this.player.fx=n.x;this.player.fy=n.y;this.player.dir=direction(x,y);}
 attack(aim=null){const p=this.player;if(this.dead||this.won||p.attack>0||p.dodge>0||p.stamina<16)return false;if(aim)this.face(aim.x-p.x,aim.y-p.y);p.attack=.56;p.attackFrame=0;p.attackId++;p.stamina-=16;this.emit('saw');return true;}
 dodge(x=0,y=0){const p=this.player;if(this.dead||p.dodgeCd>0||p.stamina<25||p.attack>.27)return false;const d=normalize(x||y?x:p.fx,x||y?y:p.fy);p.dx=d.x;p.dy=d.y;p.dodge=.23;p.dodgeCd=.65;p.invuln=Math.max(p.invuln,.3);p.attack=0;p.stamina-=25;this.emit('dodge');return true;}
 heal(){const p=this.player;if(p.medkits<=0||p.hp>=100||this.dead)return false;p.medkits--;p.hp=Math.min(100,p.hp+45);this.emit('heal');return true;}
 blood(x,y,count=12){for(let i=0;i<count;i++){const a=this.random()*Math.PI*2,s=30+this.random()*140;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+this.random()*.3,max:.55,size:2+this.random()*4});}this.stains.push({x,y,rx:6+this.random()*13,ry:3+this.random()*7,a:this.random()*Math.PI});if(this.stains.length>90)this.stains.shift();}

 lineClear(a,b){const d=Math.hypot(a.x-b.x,a.y-b.y),steps=Math.ceil(d/20);for(let i=1;i<=steps;i++)if(this.collision(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,15))return false;return true;}
 buildNav(){const cell=40,b=this.map.bounds,w=Math.ceil(b.w/cell),h=Math.ceil(b.h/cell),dist=new Int16Array(w*h).fill(-1),pass=new Uint8Array(w*h);const idx=(x,y)=>Math.floor((y-b.y)/cell)*w+Math.floor((x-b.x)/cell);for(let y=0;y<h;y++)for(let x=0;x<w;x++)pass[y*w+x]=!this.collision(b.x+(x+.5)*cell,b.y+(y+.5)*cell,16);let start=idx(this.player.x,this.player.y);if(!pass[start]){let best=Infinity;for(let i=0;i<pass.length;i++)if(pass[i]){const d=Math.hypot(b.x+(i%w+.5)*cell-this.player.x,b.y+(Math.floor(i/w)+.5)*cell-this.player.y);if(d<best){best=d;start=i;}}}const q=[start];dist[start]=0;for(let head=0;head<q.length;head++){const i=q[head],x=i%w,y=Math.floor(i/w);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,j=ny*w+nx;if(nx<0||ny<0||nx>=w||ny>=h||!pass[j]||dist[j]>=0)continue;dist[j]=dist[i]+1;q.push(j);}}this.nav={cell,b,w,h,dist,idx};}
 pursuit(e){if(this.lineClear(e,this.player))return normalize(this.player.x-e.x,this.player.y-e.y);const n=this.nav;if(!n)return {x:0,y:0};const index=n.idx(e.x,e.y),cx=index%n.w,cy=Math.floor(index/n.w);let best=Infinity,target=null;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=n.w||y>=n.h)continue;const i=y*n.w+x,d=n.dist[i];if(d<0)continue;const p={x:n.b.x+(x+.5)*n.cell,y:n.b.y+(y+.5)*n.cell};if(!this.lineClear(e,p))continue;const score=d*40+Math.hypot(e.x-p.x,e.y-p.y)*.4;if(score<best){best=score;target=p;}}return target?normalize(target.x-e.x,target.y-e.y):{x:0,y:0};}
 hurt(n,enemy){const p=this.player;if(p.invuln>0||this.dead)return;p.hp=Math.max(0,p.hp-n);p.invuln=1.05;this.blood(p.x,p.y-20,10);const v=normalize(p.x-enemy.x,p.y-enemy.y);this.moveBody(p,v.x*23,v.y*23);this.emit('hurt');if(p.hp<=0){this.dead=true;this.emit('death');}}
 nearbyThreat(x,y,r=240){return this.enemies.some(e=>e.hp>0&&Math.hypot(e.x-x,e.y-y)<r);}
 restorePower(){if(this.power)return false;this.power=true;this.player.hp=100;this.player.stamina=100;this.player.medkits=Math.max(1,this.player.medkits);const positions=this.map.wave||[{x:1610,y:1040},{x:1810,y:1120},{x:2030,y:1090},{x:2000,y:1145},{x:1840,y:940}];this.enemies.push(...positions.map((p,i)=>this.makeEnemy(p.x,p.y,100+i,p.kind)));this.emit('power');this.checkpoint=this.snapshot();return true;}
 snapshot(){return JSON.parse(JSON.stringify({flags:this.flags,charge:this.charge,time:this.time,power:this.power,kills:this.kills,seed:this.seed,player:this.player,enemies:this.enemies,stains:this.stains,corpses:this.corpses,particles:[]}));}
 escape(){if(!this.power||this.dead||(this.map.final&&(this.charge<30||this.enemies.some(e=>e.kind==="boss"&&e.hp>0))))return false;const p=this.player,e=this.map.exit;if(Math.hypot(p.x-e.x,p.y-e.y)>110||this.nearbyThreat(e.x,e.y,150))return false;this.won=true;this.emit('victory');return true;}
 update(dt,input={}){dt=Math.min(dt,.04);if(this.dead||this.won)return;this.time+=dt;if(this.map.final&&this.power)this.charge=Math.min(30,this.charge+dt);const p=this.player;this.navCooldown-=dt;if(this.navCooldown<=0){this.buildNav();this.navCooldown=.3;}
 p.invuln=Math.max(0,p.invuln-dt);p.dodgeCd=Math.max(0,p.dodgeCd-dt);
 let dx=input.x||0,dy=input.y||0;const n=normalize(dx,dy);p.moving=false;
 if(p.dodge>0){p.dodge=Math.max(0,p.dodge-dt);p.moving=this.moveBody(p,p.dx*480*dt,p.dy*480*dt);p.walk+=dt*15;}
 else if(dx||dy){if(p.attack<=0)this.face(dx,dy);const running=input.run&&p.stamina>5&&p.attack<=0;const speed=p.attack>0?74:running?220:156;p.moving=this.moveBody(p,n.x*speed*dt,n.y*speed*dt);if(p.moving){p.walk+=dt*(running?12:8);if(running)p.stamina=Math.max(0,p.stamina-16*dt);}}
 if(!p.moving)p.walk=0;
 if(p.attack>0){p.attack=Math.max(0,p.attack-dt);const elapsed=.56-p.attack;p.attackFrame=Math.min(5,Math.floor(elapsed/.56*6));if(elapsed>=.28&&elapsed<=.46){for(const e of this.enemies){if(e.hp<=0||e.lastHit===p.attackId)continue;const ex=e.x-p.x,ey=e.y-p.y,dist=Math.hypot(ex,ey);const dot=dist?(ex*p.fx+ey*p.fy)/dist:1;if(dist<106&&dot>-.05){e.lastHit=p.attackId;e.hp-=34;if(e.kind!=="boss"){e.stagger=.3;e.windup=0;e.recovery=.45;}this.blood(e.x,e.y-22,16);const push=normalize(ex,ey);if(e.kind!=="boss")this.moveBody(e,push.x*28,push.y*28);this.emit('hit');if(e.hp<=0){this.kills++;this.corpses.push({x:e.x,y:e.y,dir:e.dir,kind:e.kind,appearance:enemyLook(e)});this.emit('kill',{id:e.id,kind:e.kind});}}}}}
 if(p.attack<=0&&p.dodge<=0&&!(input.run&&p.moving))p.stamina=Math.min(100,p.stamina+23*dt);
 for(const e of this.enemies){if(e.hp<=0)continue;e.moving=false;e.stagger=Math.max(0,e.stagger-dt);e.recovery=Math.max(0,e.recovery-dt);if(e.stagger>0)continue;const ex=p.x-e.x,ey=p.y-e.y,dist=Math.hypot(ex,ey);
 if(e.kind==='boss'){
 if(e.windup>0){e.windup-=dt;if(e.windup<=0){if(Math.hypot(p.x-e.targetX,p.y-e.targetY)<125)this.hurt(28,e);e.recovery=1.6;this.emit('slam',{x:e.targetX,y:e.targetY});}continue;}
 if(e.recovery>0)continue;
 if(dist<165){e.windup=e.hp<204?.85:1.15;e.targetX=p.x;e.targetY=p.y;this.emit('warning');continue;}
 const v=this.pursuit(e);e.moving=this.moveBody(e,v.x*e.speed*(e.hp<204?1.35:1)*dt,v.y*e.speed*(e.hp<204?1.35:1)*dt,20);e.dir=direction(v.x,v.y);if(e.moving)e.walk+=dt*4;continue;
 }
 if(e.windup>0){e.windup-=dt;if(e.windup<=0){if(dist<64)this.hurt(12,e);e.recovery=.8;this.emit('claw',{x:e.x,y:e.y});}continue;}
 if(dist<53&&e.recovery<=0){e.windup=.6;e.fx=ex/(dist||1);e.fy=ey/(dist||1);e.dir=direction(ex,ey);continue;}
 if(dist<520&&dist>39){const v=this.pursuit(e);let sx=0,sy=0;for(const other of this.enemies){if(other===e||other.hp<=0)continue;const ox=e.x-other.x,oy=e.y-other.y,od=Math.hypot(ox,oy);if(od<37&&od>0){sx+=ox/od*(37-od)/37;sy+=oy/od*(37-od)/37;}}
 const travel=normalize(v.x+sx*.8,v.y+sy*.8);const speed=e.speed*(e.recovery>0?.55:1);e.moving=this.moveBody(e,travel.x*speed*dt,travel.y*speed*dt,13);if(!e.moving){const turn=e.id%2?1:-1;e.moving=this.moveBody(e,-v.y*speed*dt*turn,v.x*speed*dt*turn,13);}if(e.moving){e.dir=direction(travel.x,travel.y);e.walk+=dt*5;}}
 }
 for(const s of this.particles){s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=.88;s.vy*=.88;}this.particles=this.particles.filter(s=>s.life>0);}
}
