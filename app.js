const $=id=>document.getElementById(id);
const messages=$("messages"),promptBox=$("prompt"),photoInput=$("photo");
let chosenPhoto=null, recognition=null, watchState="idle";
function timeNow(){return new Intl.DateTimeFormat("ru-RU",{timeZone:"Asia/Barnaul",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date())}
function tick(){$("watchClock").textContent=timeNow()} tick();setInterval(tick,1000);

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 $("chatView").hidden=b.dataset.tab!=="chat";$("watchView").hidden=b.dataset.tab!=="watch";
}));
function addBubble(kind,text,photoUrl){
 const b=document.createElement("div");b.className="bubble "+kind;
 if(kind==="bot"){const who=document.createElement("div");who.className="who";who.textContent="БУРМАЛДА · ДЕМО";b.append(who)}
 const t=document.createElement("div");t.textContent=text;b.append(t);
 if(photoUrl){const im=document.createElement("img");im.src=photoUrl;b.append(im)}
 messages.append(b);messages.scrollTop=messages.scrollHeight;
}
photoInput.addEventListener("change",()=>{
 const f=photoInput.files&&photoInput.files[0];if(!f)return;chosenPhoto=f;
 $("attachmentPreview").hidden=false;$("attachmentPreview").textContent="Прикреплено: "+f.name;
});
function sendMessage(text,photo){
 if(!text&&!photo)return;
 const url=photo?URL.createObjectURL(photo):null;
 addBubble("user",text||"Посмотри, пожалуйста, это задание.",url);
 const provider=$("provider").value,detail=$("detail").value;
 if(provider==="Яндекс AI"){
   const instruction = detail==="Кратко" ? "Ответь кратко и понятно. " : detail==="Оба варианта" ? "Сначала дай краткий ответ, затем подробное объяснение. " : "Объясни подробно, по шагам и понятным языком. ";
   const task = instruction + (text || "Помоги разобрать прикреплённое фото задания.") +
     (photo ? "\\nЯ прикреплю фотографию задания отдельно в чате Яндекс AI." : "");
   addBubble("bot","Открываем бесплатный чат Алисы AI. Скопируй туда свой запрос и отправь. Если было прикреплено фото, добавь его в чате Яндекса отдельно. Когда получишь ответ, вернись в БУРМАЛДУ и вставь его сюда.");
   try { navigator.clipboard.writeText(task).then(()=>addBubble("bot","Запрос скопирован. Вставь его в поле чата Яндекс AI." )).catch(()=>addBubble("bot","Автокопирование недоступно. Скопируй свой запрос вручную из сообщения выше.")); }
   catch(e) { addBubble("bot","Автокопирование недоступно. Скопируй свой запрос вручную."); }
 } else {
   addBubble("bot","Запрос добавлен в демонстрационный чат.\\nНейросеть: "+provider+"\\nФормат: "+detail+"\\n\\nНастоящий ответ пока не генерируется: для прямого подключения нужен сервер и официальный API. Эта переписка пока хранится только в открытой вкладке.");
 }
 chosenPhoto=null;photoInput.value="";$("attachmentPreview").hidden=true;$("attachmentPreview").textContent="";
}
$("send").addEventListener("click",()=>{sendMessage(promptBox.value.trim(),chosenPhoto);promptBox.value="";});
promptBox.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("send").click()}});
photoInput.addEventListener("click",()=>{});
$("voice").addEventListener("click",()=>{
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){addBubble("bot","Голосовой ввод не поддерживается этим браузером. Можно написать запрос текстом.");return}
 recognition=new SR();recognition.lang="ru-RU";recognition.onresult=e=>{promptBox.value=e.results[0][0].transcript};recognition.onerror=()=>addBubble("bot","Не удалось включить микрофон. Проверь разрешение браузера.");recognition.start();
});
function setWatchState(s){watchState=s;$("watchDot").className="watch-dot "+s;const hints={idle:"Нажми на время, чтобы начать голосовой запрос.",listening:"Фиолетовый — микрофон слушает. Нажми время ещё раз, чтобы закончить.",processing:"Жёлтый — запрос обрабатывается.",ready:"Зелёный — ответ готов. Открой переписку."};$("watchHint").textContent=hints[s]}
$("watchTap").addEventListener("click",()=>{
 if(watchState==="idle"||watchState==="ready"){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setWatchState("listening");$("watchHint").textContent="Демо: микрофон доступен только в поддерживаемом браузере. Нажми ещё раз для завершения.";return}
  recognition=new SR();recognition.lang="ru-RU";recognition.continuous=false;recognition.interimResults=false;
  recognition.onresult=e=>{const txt=e.results[0][0].transcript;promptBox.value=txt;addBubble("user","Голосовой запрос: "+txt);};
  recognition.onerror=()=>{setWatchState("idle");$("watchHint").textContent="Микрофон не запустился. Проверь разрешение."};
  recognition.onend=()=>{if(watchState==="listening"||watchState==="processing"){setWatchState("processing");setTimeout(()=>setWatchState("ready"),900)}};
  setWatchState("listening");try{recognition.start()}catch(e){setWatchState("idle")}
 }else if(watchState==="listening"){setWatchState("processing");if(recognition)recognition.stop();else setTimeout(()=>setWatchState("ready"),900)}
});
$("watchOpenChat").addEventListener("click",()=>document.querySelector('[data-tab="chat"]').click());
$("watchReset").addEventListener("click",()=>setWatchState("idle"));

// Переход к официальному бесплатному чату Алисы AI.
$("openYandex").addEventListener("click",()=>{
 const text=promptBox.value.trim();
 const detail=$("detail").value;
 const instruction = detail==="Кратко" ? "Ответь кратко и понятно. " : detail==="Оба варианта" ? "Сначала дай краткий ответ, затем подробное объяснение. " : "Объясни подробно, по шагам и понятным языком. ";
 const task=instruction+text;
 if(text){
   try { navigator.clipboard.writeText(task).catch(()=>{}); } catch(e) {}
 }
 window.open("https://alice.yandex.ru/", "_blank", "noopener");
 if(text) addBubble("bot","Открыт официальный чат Алисы AI. Запрос "+(navigator.clipboard ? "попробовали скопировать — вставь его в чат Яндекса." : "можно скопировать из поля ввода и вставить в чат Яндекса."));
});
