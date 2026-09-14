// Limited-animation timing is independent of gameplay and auto-advance timing.
export function expressionFrame(time,speaking,duration,offset=0){
 const blinkPhase=(time+offset)%4.7;
 if(blinkPhase>3.9&&blinkPhase<4.08)return 3;
 if(!speaking||time>=duration)return 0;
 // Short closed-mouth holds break up the speech cycle.
 const phrase=time%2.25;
 if(phrase>1.85)return 0;
 return [1,0,2,1,0,1,2,0][Math.floor(time*8)%8];
}
export function bossScenePose(scene,time){
 if(scene==='bossDown')return time<.4?3:4;
 if(scene==='bossIntro'){
  if(time<.8)return 0;
  if(time<1.9)return 2;
  if(time<2.25)return 3;
  if(time<3.2)return 4;
  return 0;
 }
 return [0,1,0,1][Math.floor(time*2.6)%4];
}
export function speechDuration(text){return Math.max(2.5,Math.min(13,text.length/23));}
// Remove the neutral checker backing at render-load time, like a keyed sprite texture.
// Only edge-connected neutral pixels are keyed; enclosed pale clothing is preserved.
export function keySpriteBacking(data,width,height,cellWidth,cellHeight){
 const count=width*height,seen=new Uint8Array(count),queue=new Int32Array(count);let head=0,tail=0;
 const offer=(x,y)=>{if(x<0||y<0||x>=width||y>=height)return;const i=y*width+x;if(seen[i])return;seen[i]=1;const j=i*4,r=data[j],g=data[j+1],b=data[j+2];if(Math.min(r,g,b)>=175&&Math.max(r,g,b)-Math.min(r,g,b)<=4){queue[tail++]=i;data[j+3]=0;}};
 for(let cy=0;cy<height;cy+=cellHeight)for(let cx=0;cx<width;cx+=cellWidth){for(let x=cx;x<Math.min(width,cx+cellWidth);x++){offer(x,cy);offer(x,Math.min(height-1,cy+cellHeight-1));}for(let y=cy;y<Math.min(height,cy+cellHeight);y++){offer(cx,y);offer(Math.min(width-1,cx+cellWidth-1),y);}}

 // A tiny enclosed gap between hair strands can contain checker tiles too.
 // Seed only a measured alternating gray checker pattern, never a flat eye/clothing highlight.
 const gray=(x,y)=>{const j=(y*width+x)*4,r=data[j],g=data[j+1],b=data[j+2];return Math.max(r,g,b)-Math.min(r,g,b)<=4&&Math.min(r,g,b)>=175?r:-999;};
 for(let y=0;y<height-10;y+=5)for(let x=0;x<width-10;x+=5){const a=gray(x,y),b=gray(x+10,y),c=gray(x,y+10),d=gray(x+10,y+10);if(Math.min(a,b,c,d)>0&&Math.abs(a-d)<10&&Math.abs(b-c)<10&&Math.abs(a-b)>20)offer(x,y);}
 while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);offer(x-1,y);offer(x+1,y);offer(x,y-1);offer(x,y+1);}return data;
}

// Finish a keyed texture with an opaque black matte, including trapped checker islands.
export function blackMatteSprite(data,width,height,character='hero'){
 const count=width*height,seen=new Uint8Array(count),queue=new Int32Array(count),remove=new Uint8Array(count);
 const original=new Uint8ClampedArray(data),cell=width/2;
 // Explicit facial protection applies to every expression, including closed eyes.
 const polygons=character==='yui'?[
 [[300,205],[337,178],[407,115],[455,196],[459,230],[433,269],[385,334],[307,292]],
 [[250,183],[291,181],[308,319],[377,337],[379,389],[256,415]],
 [[102,409],[158,375],[262,347],[424,337],[506,371],[552,393],[580,518],[568,549],[601,617],[99,617],[85,553]]
 ]:[
 [[268,216],[372,121],[390,206],[450,240],[427,302],[372,383],[282,339]],
 [[204,193],[243,197],[269,304],[341,372],[363,439],[216,373],[215,287]],
 [[12,493],[60,420],[145,391],[213,370],[298,411],[446,466],[512,477],[567,550],[594,626],[3,626]]
 ];
 const inside=(x,y,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [a,b]=poly[i],[c,d]=poly[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;};
 const protection=new Uint8Array(count);
 for(let i=0;i<count;i++){const x=i%width%cell,y=Math.floor(i/width)%cell;protection[i]=inside(x,y,polygons[0])||(original[i*4+3]!==0&&polygons.slice(1).some(p=>inside(x,y,p)));}
 const protectedFace=i=>{const x=i%width%cell,y=Math.floor(i/width)%cell;return protection[i]&&!(character==='yui'&&x<279&&y>255&&y<346);};
 const neutral=i=>{if(protectedFace(i))return false;const j=i*4,r=data[j],g=data[j+1],b=data[j+2];return Math.min(r,g,b)>=175&&Math.max(r,g,b)-Math.min(r,g,b)<=10;};
 for(let seed=0;seed<count;seed++){
  if(protectedFace(seed))continue;
  const j=seed*4,r=data[j],g=data[j+1],b=data[j+2],y=Math.floor(seed/width)%cell;
  // Hair silhouettes contain no white costume details. Remove isolated pale
  // remnants here as well as connected backing; preserve the facial region.
  if(data[j+3]===0||(y<350&&Math.min(r,g,b)>=165&&Math.max(r,g,b)-Math.min(r,g,b)<=55))remove[seed]=1;
  if(seen[seed]||!neutral(seed))continue;
  let head=0,tail=1,bright=0,gray=0,jumps=0;queue[0]=seed;seen[seed]=1;
  while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width),v=data[i*4];if(v>244)bright++;if(v>=185&&v<230)gray++;
   for(const next of [x?i-1:-1,x<width-1?i+1:-1,y?i-width:-1,y<height-1?i+width:-1]){if(next<0||!neutral(next))continue;if(Math.abs(v-data[next*4])>20)jumps++;if(!seen[next]){seen[next]=1;queue[tail++]=next;}}
  }
  if(bright>4&&gray>4&&jumps>4)for(let k=0;k<tail;k++)remove[queue[k]]=1;
 }
 // Follow pale fringe connected to the matte, including tinted antialiasing and
 // thin white islands at hair tips. Enclosed eyes and clothing stay untouched.
 const fringe=i=>{if(protectedFace(i))return false;const j=i*4,r=data[j],g=data[j+1],b=data[j+2];return Math.min(r,g,b)>=110&&Math.max(r,g,b)-Math.min(r,g,b)<=55;};
 let head=0,tail=0;
 for(let i=0;i<count;i++)if(remove[i])queue[tail++]=i;
 while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);
  for(const next of [x?i-1:-1,x<width-1?i+1:-1,y?i-width:-1,y<height-1?i+width:-1]){
   if(next<0||remove[next]||!fringe(next))continue;remove[next]=1;queue[tail++]=next;
  }
 }
 // Small inward feather covers antialiased white rims instead of displaying a ragged cutout.
 const edge=new Uint8Array(remove);
 for(let i=0;i<count;i++)if(remove[i]){const x=i%width,y=Math.floor(i/width);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(dx*dx+dy*dy>4||x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;edge[(y+dy)*width+x+dx]=1;}}
 for(let i=0;i<count;i++){const j=i*4;if(protectedFace(i)){data[j]=original[j];data[j+1]=original[j+1];data[j+2]=original[j+2];}else if(edge[i]){data[j]=7;data[j+1]=9;data[j+2]=13;}data[j+3]=255;}
 return data;
}
