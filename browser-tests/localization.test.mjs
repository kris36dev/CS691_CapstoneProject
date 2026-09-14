import assert from 'node:assert/strict';
import {translate} from '../docs/i18n.mjs';
import {translations} from '../docs/translations.mjs';
import {CHAPTERS,NOTES,PROLOGUE,CUTSCENES} from '../docs/campaign.mjs';
import {saveRequest} from '../docs/save-client.mjs';
for(const [key,pair]of Object.entries(translations)){assert.equal(pair.length,2);for(const value of pair)assert(value.trim()&&value!==key,`Missing translation: ${key}`);}
const story=[...PROLOGUE,...CHAPTERS.flatMap(c=>c.intro),...Object.values(CUTSCENES).flatMap(c=>c.shots.map(s=>[s.speaker,s.text])),...Object.values(NOTES).map(n=>[n.title,n.text])];
for(const [speaker,line]of story)for(const lang of ['ja','zh-CN'])assert.notEqual(translate(line,lang),line,`Untranslated story: ${line}`);
assert.equal(translate('BREATH CONTROL  2 / 6','ja'),'呼吸制御  2 / 6');
assert.equal(translate('H · 2 MEDKITS','zh-CN'),'H · 2 急救包');
assert.equal(translate('2 / 4 circuits connected.','ja'),'2 / 4 回路接続済み。');
globalThis.GREAT_ESCAPE_LOCAL_SAVE=true;const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
assert.deepEqual(await (await saveRequest('/api/save')).json(),{revision:0,save:null});
const put=revision=>saveRequest('/api/save',{method:'PUT',body:JSON.stringify({revision,save:{chapter:2}})});
assert.equal((await put(0)).status,200);assert.equal((await put(0)).status,409);assert.deepEqual(await (await saveRequest('/api/save')).json(),{revision:1,save:{chapter:2}});
globalThis.localStorage.setItem=()=>{throw Error('Storage blocked');};await assert.rejects(put(1),/Storage blocked/);
console.log('PASS: bilingual story catalog, dynamic counters, persistent local saves, stale-write rejection, storage failure.');
