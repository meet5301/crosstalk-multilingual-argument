const $ = s => document.querySelector(s);
const LANG = {en:"English",hi:"Hindi",gu:"Gujarati",es:"Spanish",fr:"French",de:"German",it:"Italian",pt:"Portuguese",ja:"Japanese",ko:"Korean"};
const LOCALE = {en:"en-US",hi:"hi-IN",gu:"gu-IN",es:"es-ES",fr:"fr-FR",de:"de-DE",it:"it-IT",pt:"pt-BR",ja:"ja-JP",ko:"ko-KR"};
let voiceEnabled = true;

function getLang(side){ return side==="a" ? $("#langA").value : $("#langB").value; }
function escapeHTML(value){return value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

$("#startBtn").addEventListener("click",()=>{
  $("#languageSummary").textContent = `${LANG[$("#langA").value]} ↔ ${LANG[$("#langB").value]}`;
  $("#chat").classList.remove("hidden");
  $("#chat").scrollIntoView({behavior:"smooth",block:"start"});
  $("#messageInput").focus();
});
$("#resetBtn").addEventListener("click",()=>{
  $("#messages").innerHTML = `<div class="welcome"><div class="welcome-icon">💬</div><h2>What do you need to say?</h2><p>Pick who is speaking below. Your message and its translation will appear here.</p></div>`;
  $("#chat").classList.add("hidden");
  $("#messageInput").value="";
});
$("#sendBtn").addEventListener("click",()=>sendMessage(false));
$("#interruptBtn").addEventListener("click",()=>sendMessage(true));
$("#messageInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();sendMessage(false);}});

async function translateText(text, source, target){
  if(source===target) return text;
  try{
    const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(source)}%7C${encodeURIComponent(target)}`;
    const response=await fetch(url);
    if(!response.ok) throw new Error("Translation unavailable");
    const data=await response.json();
    const translated=data?.responseData?.translatedText;
    if(translated && !translated.toLowerCase().includes("please select two different languages")) return translated;
  }catch(error){}
  return "Translation unavailable right now. Check your internet connection and try again.";
}

function speak(text,language){
  if(!voiceEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=LOCALE[language]||language;
  window.speechSynthesis.speak(utterance);
}

async function sendMessage(isInterrupt){
  const text=$("#messageInput").value.trim();
  if(!text){$("#messageInput").focus();return;}
  const side=$("#speaker").value;
  const source=getLang(side);
  const target=getLang(side==="a"?"b":"a");
  if(source===target){alert("Please choose two different languages.");return;}

  const welcome=$("#messages .welcome");
  if(welcome) welcome.remove();
  const item=document.createElement("div");
  item.className=`message ${side}${isInterrupt?" interrupted":""}`;
  item.innerHTML=`<div class="message-content">
    <div class="message-meta">${side==="a"?"Person A":"Person B"} · ${LANG[source]}${isInterrupt?" · INTERRUPTED":""}</div>
    <div class="bubble">${escapeHTML(text)}</div>
    <div class="translation"><strong>${LANG[target]} translation</strong><span>Translating…</span></div>
  </div>`;
  $("#messages").appendChild(item);
  $("#messages").scrollTop=$("#messages").scrollHeight;
  $("#messageInput").value="";
  $("#speaker").value=side==="a"?"b":"a";
  $("#messageInput").placeholder=`Reply in ${LANG[getLang($("#speaker").value)]}…`;
  const translation=await translateText(text,source,target);
  const span=item.querySelector(".translation span");
  span.textContent=translation;
  if(translation!=="Translation unavailable right now. Check your internet connection and try again.") speak(translation,target);
  $("#messages").scrollTop=$("#messages").scrollHeight;
}

$("#micBtn").addEventListener("click",()=>{
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){alert("Voice input is not supported in this browser. Please use Chrome or Edge, or type your message.");return;}
  const side=$("#speaker").value;
  const rec=new Recognition();
  rec.lang=LOCALE[getLang(side)]||getLang(side);
  rec.interimResults=false;
  rec.maxAlternatives=1;
  $("#micBtn").textContent="🎙 Listening…";
  rec.onresult=e=>{$("#messageInput").value=e.results[0][0].transcript;};
  rec.onerror=()=>alert("Microphone could not start. Check browser microphone permission.");
  rec.onend=()=>{$("#micBtn").innerHTML="🎙 <span>Speak</span>";};
  rec.start();
});
