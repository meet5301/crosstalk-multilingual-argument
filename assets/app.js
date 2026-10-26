const $ = (s) => document.querySelector(s);

const LANG = {
  en:"English", hi:"Hindi", gu:"Gujarati", es:"Spanish", fr:"French",
  de:"German", it:"Italian", pt:"Portuguese", ja:"Japanese", ko:"Korean"
};

const LOCALE = {
  en:"en-US", hi:"hi-IN", gu:"gu-IN", es:"es-ES", fr:"fr-FR",
  de:"de-DE", it:"it-IT", pt:"pt-BR", ja:"ja-JP", ko:"ko-KR"
};

function getLang(side) {
  return side === "a" ? $("#langA").value : $("#langB").value;
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

function updateSummary() {
  $("#languageSummary").textContent =
    `Person A: ${LANG[$("#langA").value]}  ↔  Person B: ${LANG[$("#langB").value]}`;
}

$("#startBtn").addEventListener("click", () => {
  if ($("#langA").value === $("#langB").value) {
    alert("Please choose two different languages.");
    return;
  }
  updateSummary();
  $("#chat").classList.remove("hidden");
  $("#chat").scrollIntoView({ behavior:"smooth", block:"start" });
  $("#speaker").value = "a";
  updatePlaceholder();
});

$("#langA").addEventListener("change", updateSummary);
$("#langB").addEventListener("change", updateSummary);
$("#speaker").addEventListener("change", updatePlaceholder);

function updatePlaceholder() {
  const side = $("#speaker").value;
  $("#messageInput").placeholder =
    `${side === "a" ? "Person A" : "Person B"}: type in ${LANG[getLang(side)]}…`;
}

$("#resetBtn").addEventListener("click", () => {
  $("#messages").innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">💬</div>
      <h2>Start your conversation</h2>
      <p>Person A sends a message, then Person B replies. Every message is translated directly underneath.</p>
    </div>`;
  $("#chat").classList.add("hidden");
  $("#messageInput").value = "";
  $("#speaker").value = "a";
});

$("#sendBtn").addEventListener("click", () => sendMessage(false));
$("#interruptBtn").addEventListener("click", () => sendMessage(true));
$("#messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    sendMessage(false);
  }
});

async function translateText(text, source, target) {
  if (source === target) return text;

  try {
    const url =
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}` +
      `&langpair=${encodeURIComponent(source)}%7C${encodeURIComponent(target)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Translation request failed");

    const data = await response.json();
    const translated = data?.responseData?.translatedText;

    if (translated) return translated;
  } catch (error) {
    console.error(error);
  }

  return "Translation unavailable. Please check your internet connection.";
}

async function sendMessage(isInterrupt) {
  const input = $("#messageInput");
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  const side = $("#speaker").value;
  const otherSide = side === "a" ? "b" : "a";
  const source = getLang(side);
  const target = getLang(otherSide);

  if (source === target) {
    alert("Please choose two different languages.");
    return;
  }

  const welcome = $("#messages .welcome");
  if (welcome) welcome.remove();

  const speakerName = side === "a" ? "Person A" : "Person B";
  const receiverName = otherSide === "a" ? "Person A" : "Person B";

  const item = document.createElement("div");
  item.className = `message ${side}${isInterrupt ? " interrupted" : ""}`;

  item.innerHTML = `
    <div class="message-content">
      <div class="message-meta">
        ${speakerName} · ${LANG[source]} ${isInterrupt ? "· ⚡ INTERRUPT" : ""}
      </div>

      <div class="bubble">
        <span class="original-label">${speakerName} said</span>
        ${escapeHTML(text)}
      </div>

      <div class="translation">
        <strong>↓ ${receiverName} sees this in ${LANG[target]}</strong>
        <span>Translating…</span>
      </div>
    </div>
  `;

  $("#messages").appendChild(item);
  $("#messages").scrollTop = $("#messages").scrollHeight;

  input.value = "";

  const translated = await translateText(text, source, target);
  item.querySelector(".translation span").textContent = translated;

  // Read the translated sentence aloud for the other person when supported.
  if (
    translated &&
    !translated.startsWith("Translation unavailable") &&
    "speechSynthesis" in window
  ) {
    const utterance = new SpeechSynthesisUtterance(translated);
    utterance.lang = LOCALE[target] || target;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  // Automatically give the turn to the other person.
  $("#speaker").value = otherSide;
  updatePlaceholder();
  input.focus();
  $("#messages").scrollTop = $("#messages").scrollHeight;
}

$("#micBtn").addEventListener("click", () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) {
    alert("Voice input is not supported here. Use Chrome/Edge or type your message.");
    return;
  }

  const side = $("#speaker").value;
  const recognition = new Recognition();

  recognition.lang = LOCALE[getLang(side)] || getLang(side);
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  $("#micBtn").innerHTML = "🎙 Listening…";

  recognition.onresult = event => {
    $("#messageInput").value = event.results[0][0].transcript;
  };

  recognition.onerror = () => {
    alert("Microphone could not start. Please check microphone permission.");
  };

  recognition.onend = () => {
    $("#micBtn").innerHTML = "🎙 <span>Speak</span>";
  };

  recognition.start();
});

updatePlaceholder();
