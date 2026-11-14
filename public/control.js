const $ = id => document.getElementById(id);
async function post(url, body) {
  const adminKey = localStorage.getItem("wordGuessAdminKey") || "";
  const r = await fetch(url, {method:"POST",headers:{"Content-Type":"application/json","x-admin-key":adminKey},body:JSON.stringify(body)});
  if (!r.ok) throw new Error("Ошибка запроса");
  return r.json();
}
async function load() {
  if ($("adminKey")) $("adminKey").value = localStorage.getItem("wordGuessAdminKey") || "";
  const data = await (await fetch("/api/state")).json(), c = data.config;
  $("channel").value=c.channel||""; $("hintInterval").value=c.hintInterval||15; $("delay").value=c.revealDelay||5;
  $("theme").value=c.theme||"Случайная тема"; $("difficulty").value=c.difficulty||"Любая длина";
  $("auto").checked=c.autoStart!==false; showState(data.state);
  $("dot").classList.toggle("ok",!!c.channel); $("connection").textContent=c.channel?`Канал: ${c.channel}`:"Укажи Twitch-канал";
}
function configFromForm(){return{channel:$("channel").value,hintInterval:Number($("hintInterval").value),revealDelay:Number($("delay").value),theme:$("theme").value,difficulty:$("difficulty").value,autoStart:$("auto").checked};}
async function save(){await post("/api/config",configFromForm());$("connection").textContent=$("channel").value?`Канал: ${$("channel").value}`:"Укажи Twitch-канал";}
function showState(s){$("game-status").textContent=`Статус: ${s.status} · Раунд: ${s.round} · ${s.message||""}`;}
$("save").onclick=$("save2").onclick=async()=>{try{await save();alert("Настройки сохранены");}catch(e){alert(e.message);}};
for(const [id,action] of [["start","start"],["hint","hint"],["stop","stop"],["tournament","tournament"],["reveal","reveal"]]) $(id).onclick=async()=>{await post("/api/action",{action});};
$("addWords").onclick=async()=>{
 const category=$("customCategory").value.trim()||"Своя тема";
 const words=$("customWords").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!words.length)return alert("Введи хотя бы одно слово");
 const current=await(await fetch("/api/state")).json();
 const customWords=[...(current.config.customWords||[]),...words.map(word=>({category,word}))];
 await post("/api/config",{customWords});$("customWords").value="";alert(`Добавлено слов: ${words.length}`);
};
load().catch(e=>$("game-status").textContent=e.message);
setInterval(async()=>{try{const d=await(await fetch("/api/state")).json();showState(d.state);}catch{}},1500);
if($("saveKey"))$("saveKey").onclick=()=>{localStorage.setItem("wordGuessAdminKey",$("adminKey").value);alert("Пароль сохранён в этом браузере");};