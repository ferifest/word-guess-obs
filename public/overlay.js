(()=>{
const $=id=>document.getElementById(id),p=new URLSearchParams(location.search);
const channel=(p.get("channel")||"").toLowerCase(),theme=p.get("theme")||"all",difficulty=p.get("difficulty")||"any",interval=Math.max(5,Math.min(90,Number(p.get("hint"))||15)),accent=/^#[0-9a-f]{6}$/i.test(p.get("accent")||"")?p.get("accent"):"#ff955f";
const width=Math.max(600,Math.min(1800,Number(p.get("width"))||1000)),height=Math.max(180,Math.min(600,Number(p.get("height"))||300));
document.documentElement.style.setProperty("--accent",accent);document.documentElement.style.setProperty("--overlay-width",width+"px");document.documentElement.style.setProperty("--tile-size",Math.max(46,Math.min(100,Math.round(height*.27)))+"px");
const banks={
animals:["КОШКА","СОБАКА","ЖИРАФ","СЛОН","ТИГР","ЛИСА","ВОЛК","ЗЕБРА","ПИНГВИН","ДЕЛЬФИН","КРОКОДИЛ","ПОПУГАЙ","ЛЕВ","МЕДВЕДЬ","ЗАЯЦ","БЕЛКА","ЁЖИК","ЛОШАДЬ","КОРОВА","СВИНЬЯ","ОВЦА","КОЗА","ОЛЕНЬ","ЛОСЬ","ВЕРБЛЮД","КЕНГУРУ","КОАЛА","ПАНДА","НОСОРОГ","БЕГЕМОТ","ЧЕРЕПАХА","ЯЩЕРИЦА","ЗМЕЯ","ЛЯГУШКА","АКУЛА","КИТ","ОСЬМИНОГ","МЕДУЗА","КРАБ","КРЕВЕТКА","ОРЁЛ","СОВА","ВОРОНА","ВОРОБЕЙ","ЛЕБЕДЬ","ФЛАМИНГО","СТРАУС","ПАУК","БАБОЧКА","ПЧЕЛА","МУРАВЕЙ","УЛИТКА","ЛЕТУЧАЯМЫШ","БУРУНДУК","ХОМЯК","КРОЛИК","ШИНШИЛЛА","АЛЬПАКА","ГОРИЛЛА","ШИМПАНЗЕ"],
food:["ПИЦЦА","БУРГЕР","СЫР","ЯБЛОКО","БАНАН","ШОКОЛАД","МОРКОВЬ","ПЕЛЬМЕНИ","МАКАРОНЫ","БЛИНЫ","СУШИ","РОЛЛЫ","САЛАТ","СУП","БОРЩ","ЩИ","ШАШЛЫК","КАРТОШКА","ОГУРЕЦ","ПОМИДОР","КАПУСТА","АРБУЗ","ДЫНЯ","КЛУБНИКА","МАЛИНА","ЧЕРНИКА","ВИШНЯ","АПЕЛЬСИН","МАНДАРИН","ЛИМОН","АНАНАС","КОКОС","АВОКАДО","ГРИБЫ","ОМЛЕТ","ЯИЧНИЦА","КАША","ГРЕЧКА","РИС","ПЛОВ","КОТЛЕТА","СОСИСКА","КОЛБАСА","ТОРТ","ПЕЧЕНЬЕ","МОРОЖЕНОЕ","ПОНЧИК","КРУАССАН","ПИРОГ","ПИРОЖОК","ВАРЕНЬЕ","МЁД","ПОПКОРН","ЧИПСЫ","ОРЕХИ","ИЗЮМ","ЙОГУРТ","ТВОРОГ","КЕФИР","ЛИМОНАД"],
places:["РОССИЯ","ЛОНДОН","ПАРИЖ","ЯПОНИЯ","ИТАЛИЯ","БЕРЛИН","МОСКВА","КАНАДА","ИСПАНИЯ","ФРАНЦИЯ","ГЕРМАНИЯ","БРАЗИЛИЯ","АРГЕНТИНА","АВСТРАЛИЯ","ЕГИПЕТ","ТУРЦИЯ","ГРЕЦИЯ","НОРВЕГИЯ","ШВЕЦИЯ","ФИНЛЯНДИЯ","ИСЛАНДИЯ","ПОРТУГАЛИЯ","НИДЕРЛАНДЫ","ШВЕЙЦАРИЯ","АВСТРИЯ","ПОЛЬША","ЧЕХИЯ","КИТАЙ","ИНДИЯ","КОРЕЯ","ТАИЛАНД","ВЬЕТНАМ","ИНДОНЕЗИЯ","МЕКСИКА","ЧИЛИ","ПЕРУ","КАЗАХСТАН","ГРУЗИЯ","АРМЕНИЯ","БЕЛАРУСЬ","УКРАИНА","КИЕВ","МИНСК","РИМ","МАДРИД","ТОКИО","СЕУЛ","НЬЮЙОРК","ДУБАЙ","СТАМБУЛ","КАЗАНЬ","СОЧИ","ОМСК","ТУЛА","КАЛИНИНГРАД","ВЛАДИВОСТОК","БАРСЕЛОНА","АМСТЕРДАМ","ПРАГА","ВЕНА"],
games:["МАЙНКРАФТ","ТЕРРАРИЯ","ДОТА","КС2","ФОРТНАЙТ","СТАЛКЕР","САБНАВТИКА","ГЕОМЕТРИЯ","РОБЛОКС","МОРТАЛКОМБАТ","ВАЛОРАНТ","АПЕКС","ОВЕРВОТЧ","КИБЕРПАНК","ВЕДЬМАК","СКАЙРИМ","ФАЛЛАУТ","ПОРТАЛ","ХАЛФЛАЙФ","ГТА","РЕДДЕД","АССАСИН","ФАРКРАЙ","СИМС","СТАРДЬЮ","ХАДЕС","РОГАЛИК","ДАРКСОУЛС","ЭЛДЕНРИНГ","СЕКИРО","БАЛДУРСГЕЙТ","ДЕДБАЙДЕЙЛАЙТ","ФАЗМОФОБИЯ","ЛЕТФОРДЕД","АМОНГАС","ПАПЕРС ПЛИЗ","ИТТЕЙКСТУ","АНРАВЕЛТУ","ПИКМИН","СПЕЛАНКИ","КУПХЕД","СЕЛЕСТА","ДИСХОНОРЕД","ДООМ","КВЕЙК","ТЕТРИС","ПАКМАН","САПЁР","СУДОКУ"],
objects:["КОМПЬЮТЕР","ТЕЛЕФОН","МОНИТОР","КЛАВИАТУРА","НАУШНИКИ","СТОЛ","КРЕСЛО","ЧАСЫ","МИКРОФОН","МЫШКА","КОВРИК","ПРИНТЕР","КАМЕРА","ФОТОАППАРАТ","ТЕЛЕВИЗОР","ХОЛОДИЛЬНИК","МИКРОВОЛНОВКА","ЧАЙНИК","ТОСТЕР","ПЫЛЕСОС","ФЕН","ЗЕРКАЛО","ЛАМПА","ЛЮСТРА","КНИГА","ТЕТРАДЬ","РУЧКА","КАРАНДАШ","ЛАСТИК","РЮКЗАК","ЧЕМОДАН","ЗОНТ","ОЧКИ","КОШЕЛЁК","КЛЮЧИ","БУТЫЛКА","КРУЖКА","ТАРЕЛКА","ЛОЖКА","ВИЛКА","НОЖНИЦЫ","МОЛОТОК","ОТВЁРТКА","ГИТАРА","ПИАНИНО","СКЕЙТБОРД","ВЕЛОСИПЕД","САМОКАТ","МЯЧ","ШАХМАТЫ","ПОДУШКА","ОДЕЯЛО","ПОЛОТЕНЦЕ","МЫЛО","ЩЁТКА","РАСЧЁСКА","ЗАЖИГАЛКА","ФОНАРИК","ПАСПОРТ","БИЛЕТ"],
characters:["ПИКАЧУ","МАРИО","СОНИК","ШРЕК","БЭТМЕН","ЧЕЛОВЕКПАУК","ГАРРИПОТТЕР","ГЕРМИОНА","РОНУИЗЛИ","ДАРТВЕЙДЕР","ЙОДА","ЛЮКСКАЙУОКЕР","ДЖОКЕР","СУПЕРМЕН","ЖЕЛЕЗНЫЙЧЕЛОВЕК","ТОР","ХАЛК","ЛОКИ","ДЕДПУЛ","РОСОМАХА","ШЕРЛОК","ВАТСОН","ДЖЕКВОРОБЕЙ","ЭЛЬЗА","АННА","ОЛАФ","ШРЕК","ОСЁЛ","КОТВ САПОГАХ","МИККИМАУС","ДОНАЛЬД","ГУФИ","БУЗЗЛАЙТЕР","ВУДИ","ШРЕДДЕР","ЧЕРЕПАШКА","НАРУТО","САСКЕ","ЛУФФИ","ЗОРО","ГАНДАЛЬФ","ФРОДО","ГОЛЛУМ","АРАГОРН","ДЖОНСНОУ","ДЕЙНЕРИС","ТИРИОН","УЭНСДЕЙ","ЭНИД","БАРБИ","КЕН","ГРУТ","РАКЕТА","ТАНОС","СТИЧ","ЛИЛО"],
tech:["ПРОЦЕССОР","ВИДЕОКАРТА","ИНТЕРНЕТ","РОУТЕР","ПЛАНШЕТ","НОУТБУК","КОНСОЛЬ","СМАРТФОН","БРАУЗЕР","СЕРВЕР","ПАМЯТЬ","ЖЁСТКИЙДИСК","ФЛЕШКА","МАТЕРИНСКАЯПЛАТА","ОПЕРАТИВКА","ВЕНТИЛЯТОР","КУЛЕР","МОНИТОР","ПИКСЕЛЬ","ПРОШИВКА","АЛГОРИТМ","ПРОГРАММА","ПРИЛОЖЕНИЕ","СОФТ","ХАРДВЕР","БЛЮТУЗ","ВАЙФАЙ","КАБЕЛЬ","АДАПТЕР","ЗАРЯДКА","АККУМУЛЯТОР","БАТАРЕЙКА","СЕНСОР","ДАТЧИК","ПРОЕКТОР","СКАНЕР","МАРШРУТИЗАТОР","МОДЕМ","МИКРОЧИП","ТРАНЗИСТОР","НЕЙРОСЕТЬ","РОБОТ","ДРОН","СПУТНИК","ЛАЗЕР","ГОЛОГРАММА","ВИРТУАЛЬНОСТЬ","КИБЕРБЕЗОПАСНОСТЬ","ШИФРОВАНИЕ"]
};
let word="",mask=[],round=0,playing=false,hintTimer=null,socket=null,manualStop=false,tournament=0,tournamentRound=0,currentCategory="",nextHint=interval*1000,lastWord="";
const categoryNames={animals:"ЖИВОТНЫЕ",food:"ЕДА",places:"СТРАНЫ И ГОРОДА",games:"ВИДЕОИГРЫ",objects:"ПРЕДМЕТЫ",characters:"ПЕРСОНАЖИ",tech:"ТЕХНИКА",custom:"СВОИ СЛОВА"};
function norm(s){return s.toLocaleUpperCase("ru-RU").replace(/Ё/g,"Е").replace(/[^А-ЯA-Z0-9]/g,"")}
function filterLength(pool){return pool.filter(w=>w.length>=4&&w.length<=10&&(difficulty==="short"?w.length<=5:difficulty==="medium"?w.length>=6&&w.length<=7:difficulty==="long"?w.length>=8:true))}
function getPools(){
 const custom=(p.get("words")||"").split(/[\n,;]+/).map(norm).filter(x=>x.length>=4&&x.length<=20);
 const keys=theme==="all"?Object.keys(banks):[theme],result={};
 keys.forEach(k=>{if(banks[k])result[k]=filterLength([...new Set(banks[k].map(norm))]);});
 if(custom.length)result.custom=filterLength([...new Set(custom)]);
 return Object.fromEntries(Object.entries(result).filter(([,v])=>v.length));
}
let pools=getPools();
function chooseWord(){
 let keys=Object.keys(pools);if(!keys.length){pools=getPools();keys=Object.keys(pools)}
 if(!keys.length)return null;
 const available=keys.flatMap(k=>pools[k].map(w=>({word:w,category:k}))).filter(x=>x.word!==lastWord);
 const all=available.length?available:keys.flatMap(k=>pools[k].map(w=>({word:w,category:k})));
 const pick=all[Math.floor(Math.random()*all.length)];lastWord=pick.word;
 for(const k of Object.keys(pools))pools[k]=pools[k].filter(w=>w!==pick.word);
 for(const k of Object.keys(pools))if(!pools[k].length)delete pools[k];
 if(!Object.keys(pools).length)pools=getPools();
 return pick;
}
const scoreKey="wordguess-score-v1:"+channel;
let scores={};
try{scores=JSON.parse(localStorage.getItem(scoreKey)||"{}")||{}}catch(e){scores={}}
function saveScores(){try{localStorage.setItem(scoreKey,JSON.stringify(scores))}catch(e){}}
function renderLeaderboard(){
 const box=$("leaderboard");if(!box)return;
 const top=Object.entries(scores).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,5);
 box.replaceChildren();
 if(!top.length){const e=document.createElement("span");e.className="empty";e.textContent="Побед пока нет — стань первым!";box.append(e);return}
 top.forEach(([name,count],i)=>{const row=document.createElement("div");row.className="leader-row";const rank=document.createElement("span");rank.className="leader-rank";rank.textContent=String(i+1).padStart(2,"0");const nick=document.createElement("b");nick.className="leader-nick";nick.textContent=name;const points=document.createElement("strong");points.className="leader-score";points.textContent=count+" "+(count===1?"слово":count<5?"слова":"слов");row.append(rank,nick,points);box.append(row)});
}
function setStatus(s){$("status").textContent=s}
function render(){
 $("round").textContent=tournament?("ТУРНИР "+tournamentRound+"/"+tournament):("РАУНД "+round);
 $("category").textContent="ТЕМА — "+(categoryNames[currentCategory]||"СЛОВА");
 $("countdown").textContent=playing?"НОВАЯ БУКВА ЧЕРЕЗ "+Math.ceil(nextHint/1000)+" СЕК.":"ОЖИДАНИЕ ОТВЕТА";
 $("length").textContent="Букв: "+(word?word.length:"—");
 $("hintInfo").textContent=word?"Открыто букв: "+mask.filter(x=>x!=="•").length:"";
 const w=$("word");w.replaceChildren();
 if(!word){const d=document.createElement("div");d.className="placeholder";d.textContent="ОЖИДАНИЕ ИГРЫ";w.append(d)}
 else [...mask].forEach(c=>{const d=document.createElement("div");d.className="tile"+(c==="•"?" hidden":"");d.textContent=c;w.append(d)});
 renderLeaderboard();
}
function startRound(){
 const chosen=chooseWord();if(!chosen){setStatus("Для выбранной темы нет слов подходящей длины");return}
 clearInterval(hintTimer);word=chosen.word;currentCategory=chosen.category;mask=[...word].map(()=>"•");
 const positions=[...Array(mask.length).keys()];
 for(let n=0;n<2&&positions.length;n++){const index=positions.splice(Math.floor(Math.random()*positions.length),1)[0];mask[index]=word[index]}
 round++;playing=true;nextHint=interval*1000;$("winnerBanner").classList.remove("show");setStatus("Слово загадано — пишите ответы в чат");render();
 hintTimer=setInterval(()=>{if(!playing)return;const hidden=mask.map((x,i)=>x==="•"?i:-1).filter(i=>i>=0);if(hidden.length){const i=hidden[Math.floor(Math.random()*hidden.length)];mask[i]=word[i]}nextHint=interval*1000;render()},interval*1000);
 const tick=setInterval(()=>{if(!playing){clearInterval(tick);return}nextHint=Math.max(0,nextHint-1000);$("countdown").textContent="НОВАЯ БУКВА ЧЕРЕЗ "+Math.ceil(nextHint/1000)+" СЕК."},1000);
}
function stop(){playing=false;clearInterval(hintTimer);setStatus("Игра остановлена");$("countdown").textContent="ИГРА ОСТАНОВЛЕНА";render()}
function hint(){if(!playing)return;const hidden=mask.map((x,i)=>x==="•"?i:-1).filter(i=>i>=0);if(hidden.length){const i=hidden[Math.floor(Math.random()*hidden.length)];mask[i]=word[i]}nextHint=interval*1000;render()}
function win(user){
 playing=false;clearInterval(hintTimer);scores[user]=(scores[user]||0)+1;saveScores();renderLeaderboard();
 $("winnerName").textContent=user;$("winnerWord").textContent=word;$("winnerBanner").classList.remove("show");void $("winnerBanner").offsetWidth;$("winnerBanner").classList.add("show");
 setStatus("ПОБЕДИТЕЛЬ: "+user+" · "+word);
 if(tournament){tournamentRound++;if(tournamentRound>=tournament){tournament=0;tournamentRound=0;setTimeout(()=>{$("winnerBanner").classList.remove("show");word="";mask=[];render();setStatus("ТУРНИР ЗАВЕРШЁН")},5000);return}}
 if(p.get("auto")!=="0")setTimeout(()=>{if(!playing){word="";mask=[];startRound()}},5000);
}
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
 const parts=raw.split(" ");if(parts[0]==="PING"){if(socket&&socket.readyState===1)socket.send("PONG "+parts.slice(1).join(" "));return}
 if(!raw.includes(" PRIVMSG "))return;
 const tags={};let i=0;
 if(parts[0].startsWith("@")){parts[0].slice(1).split(";").forEach(t=>{const [k,...v]=t.split("=");tags[k]=v.join("=")});i=1}
 const nick=(parts[i]||"").split("!")[0],idx=raw.indexOf(" :",raw.indexOf(" PRIVMSG "));if(idx<0)return;
 const msg=raw.slice(idx+2);if(command(msg,nick,tags)||!playing||!word)return;
 if(norm(msg)===norm(word))win(nick);
}
function connect(){
 if(!channel){setStatus("В ссылке не указан Twitch-канал");return}
 socket=new WebSocket("wss://irc-ws.chat.twitch.tv:443");
 socket.onopen=()=>{socket.send("CAP REQ :twitch.tv/tags twitch.tv/commands");socket.send("PASS SCHMOOPIIE");socket.send("NICK justinfan"+Math.floor(Math.random()*90000+10000));socket.send("JOIN #"+channel);setStatus("Подключено к чату twitch.tv/"+channel);if(p.get("auto")!=="0")setTimeout(()=>{if(!playing&&!manualStop)startRound()},1200)};
 socket.onmessage=e=>String(e.data).split("\r\n").filter(Boolean).forEach(onMessage);
 socket.onclose=()=>{setStatus("Соединение потеряно — переподключение…");setTimeout(connect,3000)};
 socket.onerror=()=>setStatus("Не удалось подключиться к Twitch IRC");
}
$("leaderboardPanel").style.display=p.get("attempts")==="0"?"none":"";
$("leaderboardPanel").style.display=p.get("attempts")==="0"?"none":"";\nrender();connect();
})();