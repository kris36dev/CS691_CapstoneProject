export const PROLOGUE=[
 ['AFTER CLASS · 18:07','One bell before closing. High-school student Reina stays behind with Yui to finish their homework. Outside, the last train rolls past the school.'],
 ['MS MIZUNO · SCHOOL PA','Everyone, step away from the ventilation grilles. I have asked Headmaster Kuroda to release the gates. Stay with your classmates.'],
 ['YUI','Reina… that boy by the stairs. He was on the floor a second ago. Why is he getting up like that?'],
 ['YOU','Don’t go near him. Come here. Now.'],
 ['MS MIZUNO · SCHOOL PA','The shutters are coming down. Take the service route through the infirmary. Whatever you hear, do not return to the classrooms.'],
 ['YOU','The groundskeeper left his saw in the store room. Fine. If they won’t let us out, I’ll make a way.']
];
export function portraitFor(speaker){if(speaker==='YOU')return 'hero';if(speaker.startsWith('YUI'))return 'yui';if(speaker.startsWith('MS MIZUNO'))return 'teacher';return 'narrator';}
export const CHAPTERS=[
 {title:'THE LOCKDOWN',image:'school',intro:[['YOU','The front gate is dead. The corridors aren’t.'],['YUI · STAIRWELL RADIO','The shutters sealed the service wing. Repair the east-classroom circuit. We can reach the courtyard through the infirmary.'],['YOU','Stay behind that door. If anything knocks, make sure it’s me.']],goal:'Repair the east-classroom circuit.'},
 {title:'DEAD AIR',image:'infirmary',intro:[['YUI · RADIO','I’m at the infirmary exit. The window cut my arm. Glass, not a bite. I need a bandage.'],['YOU','I’ll find the trauma kit. Keep pressure on it.'],['YUI · RADIO','The courtyard door needs a maintenance card and a relay sequence. Check the nurse’s station.']],goal:'Find the trauma kit and maintenance card.'},
 {title:'THE LAST BELL',image:'courtyard',intro:[['YUI · RADIO','The bandage is holding. I’ve got the others by the gate.'],['YOU','That backup generator can release the lock. When it opens, don’t wait for the bell.'],['YUI · RADIO','Something followed you out. Headmaster Kuroda… he’s changed.']],goal:'Start the backup generator.'}
];
export const NOTES={
 test:{title:'A notice that never went up',text:'The school trialled an aerosol disinfectant after hours. A lab warning describes violent neurological reactions. Someone stamped it “hold until Monday”. These people were exposed, not possessed.'},
 log:{title:'Emergency log',text:'17:42 — First collapse near the ventilation intake. 17:46 — Automatic quarantine sealed the shutters. 17:51 — Manual evacuation request denied. The lockdown trapped everyone with the exposure.'},
 card:{title:'Maintenance card · relay sequence',text:'Emergency courtyard release: isolate terminals in order 3 → 1 → 4 → 2. The backup generator outside needs thirty seconds to charge the gate motor. Keep the release area clear.'},
 evidence:{title:'Signed delivery receipt',text:'The same batch number appears on the trial notice and the delivery receipt. The supplier was told about the failed safety test. You photograph both records and send them to the emergency response team.'}
};
// Image coordinates are scaled by 1.5 into the 2304 × 1536 world.
const scale=rects=>rects.map(r=>r.map(n=>n*1.5));
export const INFIRMARY={bounds:{x:0,y:0,w:2304,h:1536},walkable:scale([[96,510,1438,720],[132,235,749,457],[812,235,1402,457],[353,430,509,551],[1011,430,1182,551],[0,550,120,662],[1410,550,1536,662]]),start:{x:170,y:910},panel:{x:1990,y:415},exit:{x:2200,y:910},obstacles:[],spawns:[{x:620,y:900},{x:1050,y:980,kind:'runner'},{x:1360,y:900},{x:1710,y:990},{x:1950,y:890},{x:810,y:520},{x:1510,y:580,kind:'runner'}],wave:[{x:1890,y:910,kind:'runner'},{x:1560,y:990},{x:1100,y:900}],items:[{id:'medicine',x:310,y:410,label:'Take trauma kit',symbol:'+'},{id:'card',x:1390,y:420,label:'Read maintenance card',symbol:'▣'},{id:'evidence',x:730,y:1000,label:'Read delivery receipt',symbol:'?'}]};
export const COURTYARD={final:true,bounds:{x:0,y:0,w:2304,h:1536},walkable:scale([[128,165,1408,810],[635,790,898,1024],[632,111,904,185]]),start:{x:1140,y:1370},panel:{x:1940,y:290},exit:{x:1150,y:220},obstacles:[],spawns:[{x:600,y:980},{x:1660,y:950},{x:950,y:650,kind:'runner'},{x:1400,y:630}],wave:[{x:1150,y:650,kind:'boss'},{x:650,y:1080},{x:1610,y:1090,kind:'runner'},{x:720,y:680}]};
export function saveEnvelope(chapter,game,totals,notes,completed=false){return{format:1,chapter,checkpoint:game.checkpoint||game.snapshot(),totals:{...totals},notes:[...notes],completed};}
export function validSave(s){const c=s?.checkpoint,p=c?.player;return s?.format===1&&Number.isInteger(s.chapter)&&s.chapter>=0&&s.chapter<3&&typeof s.completed==='boolean'&&p&&['x','y','hp','stamina','medkits'].every(k=>Number.isFinite(p[k]))&&p.hp>0&&p.hp<=100&&Array.isArray(c.enemies)&&c.enemies.length<=100&&c.enemies.every(e=>['x','y','hp','speed','id'].every(k=>Number.isFinite(e[k])))&&Array.isArray(s.notes)&&s.notes.every(n=>Object.hasOwn(NOTES,n))&&Number.isFinite(s.totals?.kills)&&Number.isFinite(s.totals?.time);}

// Illustrated, timed story sequences. Seconds count only while the scene is active.
export const CUTSCENES={
 infirmary:{title:'BEYOND THE SHUTTER',endLabel:'ENTER THE INFIRMARY',shots:[
  {speaker:'THE EAST SHUTTER',text:'The motor screams. Reina slips under the steel shutter as hands hammer against the other side.',image:'school',focus:'hero',position:'86% 75%',seconds:5,sound:'metal'},
  {speaker:'YUI · RADIO',text:'I’m through the infirmary window. Glass cut my arm — not a bite. I can see the courtyard door, but it’s locked.',image:'infirmary',focus:'yui',position:'25% 45%',seconds:6},
  {speaker:'YOU',text:'Keep pressure on it. I’m getting you a trauma kit. We finish this together.',image:'infirmary',focus:'hero',position:'45% 48%',seconds:5},
  {speaker:'YUI · RADIO',text:'The nurse’s station has a maintenance card. You’ll need it to release the courtyard door. Reina… be careful in the wards.',image:'infirmary',focus:'yui',position:'75% 38%',seconds:6}
 ]},
 courtyard:{title:'NO ONE LEFT BEHIND',endLabel:'ENTER THE COURTYARD',shots:[
  {speaker:'THE INFIRMARY EXIT',text:'Reina pushes the door open. Yui takes the clean bandage from the trauma pack and binds her arm. For the first time, the radio is quiet.',image:'infirmary',focus:'yui',position:'90% 60%',seconds:6},
  {speaker:'YUI',text:'There are other students outside. I’ll get them to the gate. You find the power.',image:'courtyard',focus:'yui',position:'50% 35%',seconds:5,sound:'rain'},
  {speaker:'YOU',text:'That generator in the corner should release the lock. Stay together. When it opens, run.',image:'courtyard',focus:'hero',position:'90% 18%',seconds:5},
  {speaker:'BEHIND THE DOOR',text:'A heavy footstep. Then another. Something in Kuroda’s borrowed security coat ducks through the shattered doorway.',image:'courtyard',focus:'boss',position:'50% 95%',seconds:5,sound:'thud'}
 ]},
 bossIntro:{title:'HEADMASTER KURODA',endLabel:'FACE THE HEADMASTER',shots:[
  {speaker:'THE BACKUP GENERATOR',text:'The engine catches. Red lamps burn across the courtyard. The gate motor begins to charge.',image:'courtyard',focus:'hero',position:'88% 15%',seconds:4,sound:'metal'},
  {speaker:'YUI · RADIO',text:'Reina, behind you! That’s the Headmaster. What happened to him?',image:'courtyard',focus:'yui',position:'50% 70%',seconds:5},
  {speaker:'HEADMASTER KURODA',text:'He raises both arms. The concrete splits beneath his fists. The students scatter behind the gate pillars.',image:'courtyard',focus:'boss',pose:2,position:'50% 48%',seconds:5,sound:'thud'},
  {speaker:'YOU',text:'You locked us in. Now get out of our way.',image:'courtyard',focus:'hero',position:'52% 52%',seconds:4}
 ]},
 bossDown:{title:'THE LAST OBSTACLE',endLabel:'RETURN TO THE GATE',shots:[
  {speaker:'THE COURTYARD',text:'Kuroda falls to his knees. The chainsaw winds down. For a moment, only rain touches the concrete.',image:'courtyard',focus:'boss',pose:4,position:'50% 50%',seconds:5,sound:'rain'},
  {speaker:'YUI · RADIO',text:'Reina! We’re still here. All of us. Get to the north gate!',image:'courtyard',focus:'yui',position:'50% 12%',seconds:5},
  {speaker:'YOU',text:'Keep clear of the infected. I’m coming.',image:'courtyard',focus:'hero',position:'50% 22%',seconds:4}
 ]}
};
