import {translations} from './translations.mjs';
export let language='en';
const textBindings=new Map(),attributeBindings=[];
const storageGet=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const storageSet=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
const templates=[
 [/^Hold and drag wire ([A-D]) to its matching socket\.$/,['ワイヤー $1 を押さえて対応する端子へドラッグ。','按住电线 $1，拖到对应插口。']],
 [/^Wire ([A-D]) selected with keyboard\. Activate its matching right socket\.$/,['ワイヤー $1 を選択。右の対応する端子を選んでください。','已用键盘选择电线 $1。请激活右侧对应插口。']],
 [/^(\d) \/ 4 circuits connected\.$/,['$1 / 4 回路接続済み。','$1 / 4 电路已连接。']]
];
export function translate(text,lang=language){
 if(typeof text!=='string'||lang==='en')return text;
 const i=lang==='ja'?0:1,key=text.trim(),pair=translations[key]||translations[text];
 if(pair)return text.replace(key,pair[i]);
 for(const [pattern,values]of templates)if(pattern.test(text))return text.replace(pattern,values[i]);
 // Composite HUD labels retain their live counters and translate their known segments.
 let result=text;
 for(const source of Object.keys(translations).sort((a,b)=>b.length-a.length)){
  if(source.length<3)continue;
  if(result.includes(source))result=result.split(source).join(translations[source][i]);
 }
 return result;
}
export const t=text=>translate(text);
export function setText(el,text){textBindings.set(el,String(text));el.textContent=t(String(text));}
function repaint(){
 document.documentElement.lang=language;
 for(const [node,source]of textBindings){if(node.isConnected===false){textBindings.delete(node);continue;}if(node.nodeType===3)node.nodeValue=t(source);else node.textContent=t(source);}
 for(const [el,attr,value]of attributeBindings)el.setAttribute(attr,t(value));
}
export function initLanguages(){
 language=['en','ja','zh-CN'].includes(storageGet('great-escape-language'))?storageGet('great-escape-language'):'en';
 const walk=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
 while(walk.nextNode()){const n=walk.currentNode;if(n.nodeValue.trim()&&!['SCRIPT','STYLE'].includes(n.parentElement?.tagName)&&n.parentElement?.parentElement?.id!=='text-language')textBindings.set(n,n.nodeValue);}
 for(const el of document.querySelectorAll('[aria-label]'))attributeBindings.push([el,'aria-label',el.getAttribute('aria-label')]);
 const select=document.getElementById('text-language');select.value=language;
 select.onchange=()=>{language=select.value;storageSet('great-escape-language',language);repaint();};
 repaint();
}
