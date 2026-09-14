const KEY='great-escape-checkpoint-v1';
// The hosted Site keeps its authenticated API; Pages uses this browser's storage.
export async function saveRequest(url,options={}){
 if(!globalThis.GREAT_ESCAPE_LOCAL_SAVE)return fetch(url,options);
 const raw=localStorage.getItem(KEY);
 const current=raw?JSON.parse(raw):{revision:0,save:null};
 if(!Number.isInteger(current.revision)||current.revision<0)throw Error('Invalid local checkpoint');
 if(options.method==='PUT'){
  const next=JSON.parse(options.body);
  if(next.revision!==current.revision)return {ok:false,status:409,json:async()=>current};
  const saved={revision:current.revision+1,save:next.save};
  localStorage.setItem(KEY,JSON.stringify(saved));
  return {ok:true,status:200,json:async()=>saved};
 }
 return {ok:true,status:200,json:async()=>current};
}
