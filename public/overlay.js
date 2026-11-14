(()=>{
const $=id=>document.getElementById(id),p=new URLSearchParams(location.search);
const channel=(p.get("channel")||"").toLowerCase(),theme=p.get("theme")||"all",difficulty=p.get("difficulty")||"any",interval=Math.max(5,Math.min(90,Number(p.get("hint"))||15)),accent=/^#[0-9a-f]{6}$/i.test(p.get("accent")||"")?p.get("accent"):"#ff955f";
const width=Math.max(600,Math.min(1800,Number(p.get("width"))||1000)),height=Math.max(180,Math.min(600,Number(p.get("height"))||300));
document.documentElement.style.setProperty("--accent",accent);document.documentElement.style.setProperty("--overlay-width",width+"px");
document.documentElement.style.setProperty("--tile-size",Math.max(46,Math.min(100,Math.round(height*.27)))+"px");
$("attemptPanel").style.display=p.get("attempts")==="0"?"none":"";
const banks={
animals:["КОШКА","СОБАКА","ЖИРАФ","СЛОН","ТИГР","ЛИСА","ВОЛК","ЗЕБРА","ПИНГВИН","ДЕЛЬФИН","КРОКОДИЛ","ПОПУГАЙ"],
food:["ПИЦЦА","БУРГЕР","СЫР","ЯБЛОКО","БАНАН","ШОКОЛАД","МОРКОВЬ","ПЕЛЬМЕНИ","МАКАРОНЫ","БЛИНЫ"],
places:["РОССИЯ","ЛОНДОН","ПАРИЖ","ЯПОНИЯ","ИТАЛИЯ","БЕРЛИН","МОСКВА","КАНАДА","ИСПАНИЯ"],
games:["МАЙНКРАФТ","ТЕРРАРИЯ","ДОТА","КС2","ФОРТНАЙТ","СТАЛКЕР","САБНАВТИКА","ГЕОМЕТРИЯ","РОБЛОКС"],
objects:["КОМПЬЮТЕР","ТЕЛЕФОН","МОНИТОР","КЛАВИАТУРА","НАУШНИКИ","СТОЛ","КРЕСЛО","ЧАСЫ","МИКРОФОН"],
characters:["ПИКАЧУ","МАРИО","СОНИК","ШРЕК","БЭТМЕН","ЧЕЛОВЕКПАУК","ГАРРИПОТТЕР"],
tech:["ПРОЦЕССОР","ВИДЕОКАРТА","ИНТЕРНЕТ","РОУТЕР","ПЛАНШЕТ","НОУТБУК","КОНСОЛЬ"]
};
let words=[],word="",mask=[],round=0,playing=false,solved=false,hintTimer=null,attempts=[],socket=null,manualStop=false,tournament=0,tournamentRound=0;
function norm(s){return s.toLocaleUpperCase("ru-RU").replace(/Ё/g,"Е").replace(/[^А-ЯA-Z0-9]/g,"")}
function pickWords(){
 let pool=theme==="all"?Object.values(banks).flat():(banks[theme]||Object.values(banks).flat());
 const custom=(p.get("words")||"").split(/[\n,;]+/).map(norm).filter(x=>x.length>=3&&x.length<=20);
 pool=[...new Set([...pool,...custom])];
 return pool.filter(w=>difficulty==="short"?w.length>=4&&w.length<=5:difficulty==="medium"?w.length>=6&&w.length<=7:difficulty==="long"?w.length>=8&&w.length<=10:true);
}
words=pickWords();
function setStatus(s){$("status").textContent=s}
function render(){
 $("round").textContent=tournament?("ТУРНИР "+tournamentRound+"/"+tournament):("РАУНД "+round);
 $("category").textContent=theme==="all"?"СЛУЧАЙНАЯ ТЕМА":({animals:"ЖИВОТНЫЕ",food:"ЕДА",places:"СТРАНЫ И ГОРОДА",games:"ИГРЫ",objects:"ПРЕДМЕТЫ",characters:"ПЕРСОНАЖИ",tech:"ТЕХНИКА"}[theme]||"СВОИ СЛОВА");
 $("countdown").textContent=playing?"НОВАЯ БУКВА ЧЕРЕЗ "+Math.ceil(nextHint/1000)+" СЕК.":"ОЖИДАНИЕ ОТВЕТА";
 $("length").textContent="Букв: "+(word?word.length:"—");
 $("hintInfo").textContent=word?"Открыто букв: "+mask.filter(x=>x!=="•").length:"";
 const w=$("word");w.replaceChildren();
 if(!word){const d=document.createElement("div");d.className="placeholder";d.textContent="ОЖИДАНИЕ ИГРЫ";w.append(d);}
 else [...mask].forEach(c=>{const d=document.createElement("div");d.className="tile"+(c==="•"?" hidden":"");d.textContent=c;w.append(d);});
 const a=$("attempts");a.replaceChildren();
 if(!attempts.length){const e=document.createElement("span");e.className="empty";e.textContent="Пока никто не отвечал";a.append(e);}
 attempts.slice(0,5).forEach(x=>{const d=document.createElement("div");d.className="attempt";const b=document.createElement("b");b.textContent=x.user;const s=document.createElement("span");s.textContent=x.text;d.append(b,s);a.append(d);});
}
let nextHint=interval*1000;
function startRound(){
 if(!words.length){setStatus("Нет слов для выбранной длины");return}
 clearInterval(hintTimer);word=words[Math.floor(Math.random()*words.length)];words=words.filter(x=>x!==word);if(!words.length)words=pickWords();
 mask=[...word].map(()=> "•");if(mask.length){const first=Math.floor(Math.random()*mask.length);mask[first]=word[first];}
 round++;playing=true;solved=false;attempts=[];nextHint=interval*1000;setStatus("Слово загадано — пишите ответы в чат");render();
 hintTimer=setInterval(()=>{if(!playing)return;let hidden=mask.map((x,i)=>x==="•"?i:-1).filter(i=>i>=0);if(hidden.length){const i=hidden[Math.floor(Math.random()*hidden.length)];mask[i]=word[i];}nextHint=interval*1000;render();},interval*1000);
 const tick=setInterval(()=>{if(!playing){clearInterval(tick);return}nextHint=Math.max(0,nextHint-1000);render();},1000);
}
function stop(){playing=false;clearInterval(hintTimer);setStatus("Игра остановлена");render()}
function hint(){if(!playing)return;const hidden=mask.map((x,i)=>x==="•"?i:-1).filter(i=>i>=0);if(hidden.length){const i=hidden[Math.floor(Math.random()*hidden.length)];mask[i]=word[i];}nextHint=interval*1000;render()}
function win(user){playing=false;clearInterval(hintTimer);solved=true;setStatus("ПОБЕДИТЕЛЬ: "+user+" · "+word);if(tournament){tournamentRound++;if(tournamentRound>=tournament){tournament=0;tournamentRound=0;setTimeout(()=>{word="";mask=[];render();setStatus("ТУРНИР ЗАВЕРШЁН");},4500);return;}}if(p.get("auto")!=="0")setTimeout(()=>{word="";mask=[];startRound()},4500);render()}
function isMod(tags){return tags.mod==="1"||String(tags.badges||"").split(",").some(x=>/^(broadcaster|moderator)\//.test(x))}
function command(msg,user,tags){
 const c=msg.trim().toLowerCase();
 if(c==="!угадай статус"){setStatus(playing?"Игра идёт · раунд "+round:"Игра не запущена");return true}
 if(!isMod(tags))return false;
 if(c==="!угадай старт"){manualStop=false;startRound();return true}
 if(c==="!угадай подсказка"){hint();return true}
 if(c==="!угадай стоп"){manualStop=true;stop();return true}
 const m=c.match(/^!угадай турнир\s+(\d{1,2})$/);if(m){tournament=Math.max(1,Math.min(20,Number(m[1])));tournamentRound=0;startRound();return true}
 return false;
}
function onMessage(raw){
 const parts=raw.split(" ");if(parts[0]==="PING"){socket.send("PONG "+parts.slice(1).join(" "));return}
 if(!raw.includes(" PRIVMSG "))return;
 const tags={};let i=0;if(parts[0].startsWith("@")){parts[0].slice(1).split(";").forEach(t=>{const [k,...v]=t.split("=");tags[k]=v.join("=")});i=1;}
 const nick=(parts[i]||"").split("!")[0];const idx=raw.indexOf(" :",raw.indexOf(" PRIVMSG "));if(idx<0)return;const msg=raw.slice(idx+2);
 if(command(msg,nick,tags))return;
 if(!playing||!word)return;
 const guess=norm(msg);if(!guess)return;
 attempts.unshift({user:nick,text:msg.slice(0,28)});attempts=attempts.slice(0,5);
 if(guess===norm(word)){win(nick)}else render();
}
function connect(){
 if(!channel){setStatus("В ссылке не указан Twitch-канал");return}
 socket=new WebSocket("wss://irc-ws.chat.twitch.tv:443");
 socket.onopen=()=>{socket.send("CAP REQ :twitch.tv/tags twitch.tv/commands");socket.send("PASS SCHMOOPIIE");socket.send("NICK justinfan"+Math.floor(Math.random()*90000+10000));socket.send("JOIN #"+channel);setStatus("Подключено к чату twitch.tv/"+channel);if(p.get("auto")!=="0")setTimeout(()=>{if(!playing&&!manualStop)startRound()},1200)};
 socket.onmessage=e=>String(e.data).split("\r\n").filter(Boolean).forEach(onMessage);
 socket.onclose=()=>{setStatus("Соединение потеряно — переподключение…");setTimeout(connect,3000)};
 socket.onerror=()=>setStatus("Не удалось подключиться к Twitch IRC");
}
render();connect();
})();