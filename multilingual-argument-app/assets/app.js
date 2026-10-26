const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const LANGS = {
  en:"English", hi:"Hindi", gu:"Gujarati", es:"Spanish", fr:"French",
  de:"German", it:"Italian", pt:"Portuguese", ja:"Japanese", ko:"Korean"
};

const demoTranslations = {
  "hi|You promised you would be here on time.":"तुमने वादा किया था कि तुम समय पर यहाँ आओगे।",
  "gu|You promised you would be here on time.":"તમે વચન આપ્યું હતું કે તમે સમયસર અહીં હશો.",
  "es|You promised you would be here on time.":"Prometiste que estarías aquí a tiempo.",
  "fr|You promised you would be here on time.":"Tu avais promis d'être ici à l'heure.",
  "hi|Why are you always late?":"तुम हमेशा देर से क्यों आते हो?",
  "gu|Why are you always late?":"તમે હંમેશા મોડા કેમ આવો છો?",
  "hi|I am sorry. Traffic was terrible.":"मुझे माफ़ कर दो। ट्रैफ़िक बहुत खराब था।",
  "gu|I am sorry. Traffic was terrible.":"મને માફ કર. ટ્રાફિક બહુ ખરાબ હતો.",
  "hi|You could have called me.":"तुम मुझे फोन कर सकते थे।",
  "gu|You could have called me.":"તમે મને ફોન કરી શકતા હતા.",
  "hi|I know. I should have called.":"मुझे पता है। मुझे फोन करना चाहिए था।",
  "gu|I know. I should have called.":"મને ખબર છે. મારે ફોન કરવો જોઈતો હતો."
};

let running=false, seconds=0, timerId=null, listening=false;
let muted={a:false,b:false};
let lastSpeaker="b";

function langName(code){return LANGS[code] || code}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

function translate(text, target){
  const key=`${target}|${text.trim()}`;
  if(demoTranslations[key]) return demoTranslations[key];
  return null;
}

async function translateLive(text, target){
  const demo=translate(text,target);
  if(demo) return demo;
  // Optional MyMemory fallback. It works without a key for small demo traffic.
  try{
    const source=document.querySelector("#speaker").value==="a"?$("#langA").value:$("#langB").value;
    if(source===target) return text;
    const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(source)}|${encodeURIComponent(target)}`;
    const res=await fetch(url);
    const data=await res.json();
    return data?.responseData?.translatedText || text;
  }catch(e){ return text; }
}

function addMessage(side,text,interrupted=false){
  const messages=$("#messages");
  const empty=messages.querySelector(".empty-chat"); if(empty) empty.remove();
  const source=side==="a"?$("#langA").value:$("#langB").value;
  const target=side==="a"?$("#langB").value:$("#langA").value;
  const id="m"+Date.now()+Math.random();
  const el=document.createElement("div");
  el.className=`msg ${side}${interrupted?" interrupt":""}`;
  el.id=id;
  el.innerHTML=`<div class="bubble-wrap"><div class="meta">${side==="a"?"Person A":"Person B"} · ${langName(source)}${interrupted?" · INTERRUPTED":""}</div><div class="bubble">${escapeHtml(text)}</div><div class="translation">Translating to ${langName(target)}…</div></div>`;
  messages.appendChild(el); messages.scrollTop=messages.scrollHeight;
  translateLive(text,target).then(t=>{
    const node=el.querySelector(".translation");
    if(node) node.textContent=`↳ ${t}`;
    if(!muted[target] && t && t!==text) speak(t,target);
  });
  lastSpeaker=side;
  $("#turnState").innerHTML=`<i></i> ${side==="a"?"Person B":"Person A"}'s turn`;
}

function speak(text,lang){
  if(!("speechSynthesis" in window)) return;
  const u=new SpeechSynthesisUtterance(text); u.lang={en:"en-US",hi:"hi-IN",gu:"gu-IN",es:"es-ES",fr:"fr-FR",de:"de-DE",it:"it-IT",pt:"pt-BR",ja:"ja-JP",ko:"ko-KR"}[lang]||lang;
  u.rate=.98; speechSynthesis.cancel(); speechSynthesis.speak(u);
}

function start(){
  running=true; seconds=0; $("#arena").classList.remove("hidden"); $("#setupBtn");
  $("#langALabel").textContent=langName($("#langA").value);
  $("#langBLabel").textContent=langName($("#langB").value);
  $("#startBtn").innerHTML="<span>Restart the argument</span><b>↻</b>";
  timerId=setInterval(()=>{seconds++;$("#timer").textContent=new Date(seconds*1000).toISOString().slice(14,19)},1000);
  $("#liveA").textContent="Your turn — start the argument.";
  $("#liveB").textContent="Listening...";
  window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
}

function stop(){
  running=false; clearInterval(timerId); timerId=null;
  $("#turnState").innerHTML="<i></i> Session ended";
  $("#liveA").textContent="Session ended."; $("#liveB").textContent="Session ended.";
}

$("#startBtn").addEventListener("click",()=>{ if(running) stop(); else start(); });
$("#endBtn").addEventListener("click",stop);
$("#resetBtn").addEventListener("click",()=>location.reload());
$("#clearBtn").addEventListener("click",()=>{$("#messages").innerHTML=`<div class="empty-chat"><div>◌</div><p>The floor is yours.</p><span>Type a message below or use your microphone.</span></div>`;});
$$(".topic").forEach(btn=>btn.addEventListener("click",()=>{$$(".topic").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$("#messageInput").placeholder=btn.dataset.topic;}));

$("#sendBtn").addEventListener("click",send);
$("#messageInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();send();}});
function send(){
  if(!running){start();}
  const input=$("#messageInput"), text=input.value.trim(); if(!text)return;
  addMessage($("#speaker").value,text,false); input.value="";
  const side=$("#speaker").value;
  $("#live"+side.toUpperCase()).textContent="Speaking...";
  setTimeout(()=>{$("#live"+side.toUpperCase()).textContent="Ready.";},700);
  $("#speaker").value=side==="a"?"b":"a";
}

$("#interruptBtn").addEventListener("click",()=>{
  if(!running) start();
  const side=lastSpeaker==="a"?"b":"a";
  $("#speaker").value=side;
  const phrase=side==="a"?"Wait—let me finish!":"No, that's not what happened!";
  addMessage(side,phrase,true);
  $("#messageInput").focus();
});

$$(".mute").forEach(btn=>btn.addEventListener("click",()=>{
  const side=btn.dataset.side; muted[side]=!muted[side]; btn.textContent=muted[side]?"🔇":"🔊";
}));

$("#micBtn").addEventListener("click",()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("Speech recognition is not supported in this browser. Try Chrome or Edge, or type your message.");return;}
  if(listening) return;
  const side=$("#speaker").value, lang=side==="a"?$("#langA").value:$("#langB").value;
  const rec=new SR(); rec.lang={en:"en-US",hi:"hi-IN",gu:"gu-IN",es:"es-ES",fr:"fr-FR",de:"de-DE",it:"it-IT",pt:"pt-BR",ja:"ja-JP",ko:"ko-KR"}[lang]||lang;
  rec.interimResults=true; rec.continuous=false; listening=true; $("#micBtn").classList.add("listening");
  rec.onresult=e=>{let final="", interim=""; for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;e.results[i].isFinal?final+=t:interim+=t;} $("#messageInput").value=final||interim;};
  rec.onerror=()=>{listening=false;$("#micBtn").classList.remove("listening");};
  rec.onend=()=>{listening=false;$("#micBtn").classList.remove("listening"); if($("#messageInput").value.trim()) send();};
  rec.start();
});
