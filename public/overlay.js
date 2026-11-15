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

const extraBanks={
animals:["БАРСУК","ЕНОТ","НОРКА","ЛАСКА","ХОРЁК","СУРИКАТ","МАНГУСТ","ГЕПАРД","ЯГУАР","ПУМА","ПАНТЕРА","РЫСЬ","ШАКАЛ","КОЙОТ","ГИЕНА","АНТИЛОПА","БИЗОН","ЗУБР","ЯК","ОСЁЛ","МУЛ","ЛАМА","МОРЖ","ТЮЛЕНЬ","НЕРПА","КАШАЛОТ","КАСАТКА","СКАТ","СОМ","ЩУКА","КАРАСЬ","ОКУНЬ","ЛОСОСЬ","ФОРЕЛЬ","СЕЛЬДЬ","САРДИНА","КАЛЬМАР","НАУТИЛУС","МОЛЬ","МОШКА","КОМАР","ЖУК","СТРЕКОЗА","КУЗНЕЧИК","СВЕРЧОК","БОГОМОЛ","СКОРПИОН","КЛОП","ТАРАКАН","СВЕТЛЯЧОК","ЧАЙКА","ПЕЛИКАН","ЦАПЛЯ","АИСТ","ЖУРАВЛЬ","СОРОКА","ДЯТЕЛ","КОЛИБРИ","КАКАДУ","КАНАРЕЙКА","ПАВЛИН","ИНДЮК","ПЕТУХ","УТКА","ГУСЬ","ФАЗАН","ПЕРЕПЕЛ","БАРАН","КОЗЁЛ","ТЕЛЁНОК","ПОНИ","ЖЕРЕБЁНОК","МОРСКАЯСВИНКА"],
food:["СОУС","ГОРЧИЦА","КЕТЧУП","МАЙОНЕЗ","СМЕТАНА","СЛИВКИ","МАСЛО","МУКА","САХАР","СОЛЬ","ПЕРЕЦ","УКРОП","ПЕТРУШКА","БАЗИЛИК","КОРИЦА","ИМБИРЬ","ВАНИЛЬ","КАРРИ","ЧЕСНОК","ЛУК","РЕДИСКА","СВЁКЛА","РЕПА","РЕДЬКА","ТЫКВА","БАКЛАЖАН","КАБАЧОК","ФАСОЛЬ","ГОРОХ","ЧЕЧЕВИЦА","КУКУРУЗА","ОВСЯНКА","МАНКА","ПШЕНО","ПЕРЛОВКА","ЛАПША","ВЕРМИШЕЛЬ","ПАСТА","ЛАЗАНЬЯ","РАГУ","ГУЛЯШ","ХАШ","ХАЧАПУРИ","ЧЕБУРЕК","ХИНКАЛИ","КАРРИ","РАМЕН","ТОМЯМ","ФОНДЮ","ТАКО","БУРРИТО","НАЧОС","КЕСАДИЛЬЯ","ПАЭЛЬЯ","РИЗОТТО","ПАНКЕЙК","ВАФЛИ","СЫРНИКИ","ЗАПЕКАНКА","ПАШТЕТ","ИКРА","КРАБОВЫЕПАЛОЧКИ","МАРМЕЛАД","ЗЕФИР","ХАЛВА","ПАСТИЛА","КОНФЕТА","КАРАМЕЛЬ","ИРИСКА","БЕЗЕ","МУСС","ПУДИНГ","ЖЕЛЕ","КОМПОТ","МОРС","КАКАО"],
places:["КИПР","МАЛЬТА","ИРЛАНДИЯ","ДАНИЯ","ЛАТВИЯ","ЛИТВА","ЭСТОНИЯ","СЕРБИЯ","ХОРВАТИЯ","АЛБАНИЯ","БОЛГАРИЯ","РУМЫНИЯ","ВЕНГРИЯ","СЛОВАКИЯ","СЛОВЕНИЯ","МОНАКО","ЛЮКСЕМБУРГ","МОЛДОВА","УЗБЕКИСТАН","КИРГИЗИЯ","ТУРКМЕНИЯ","МОНГОЛИЯ","НЕПАЛ","БУТАН","ШРИ-ЛАНКА","БАНГКОК","ХАНОЙ","ДЖАКАРТА","СИНГАПУР","ГОНКОНГ","СИЭТЛ","ЧИКАГО","БОСТОН","ОТТАВА","МОНРЕАЛЬ","ВАНКУВЕР","КВЕБЕК","САНТЬЯГО","ЛИМА","БОГОТА","КАРАКАС","ГАВАНА","КУБА","ЯМАЙКА","МАРОККО","ТУНИС","АЛЖИР","КЕНИЯ","УГАНДА","ГАНА","НИГЕРИЯ","СЕНЕГАЛ","ЭФИОПИЯ","ТАНЗАНИЯ","МАДАГАСКАР","НАМИБИЯ","ЗАМБИЯ","АНГОЛА","КАМБОДЖА","ЛАОС","МЬЯНМА","МАЛАЙЗИЯ","ФИЛИППИНЫ","ПАЛАУ","ФИДЖИ","САМOA","КАТАР","ОМАН","ИОРДАНИЯ","ЛИВАН","ИЗРАИЛЬ","БАГДАД","ТЕГЕРАН","КАБУЛ","ИСЛАМАБАД","ДЕЛИ","МУМБАИ","КОЛОМБО","МЕЛЬБУРН","СИДНЕЙ","ПЕРТ","ОКЛЕНД","ВЕЛЛИНГТОН","МОНТЕВИДЕО","ЛА-ПАС","КИТО","САЛЬВАДОР"],
games:["ДИВИЖН","РАСТ","ДЭЙЗ","ВАРФРЕЙМ","ВАРТАНДЕР","АРК","ПАБГ","ФРИФАЕР","ЛИГАЛЕГЕНД","ЛОЛ","ДИСКОЭЛИЗИУМ","БИОШОК","БОРДЕРЛЕНДС","РЕМНАНТ","ДАРКТАЙДС","ВЕРМИНТАЙД","ФОРЗА","ГРАНТУРИЗМО","ФИФА","ЕФУТБОЛ","НБА2К","МЛБ","Ф1","ФОРМУЛА1","ФРОСТПАНК","СИТИСКАЙЛАЙНС","ТРОПИКО","АННО","ЦИВИЛИЗАЦИЯ","СТАРКРАФТ","ВАРКРАФТ","ДИЗАЙН","ХИТМАН","МАКСПЕЙН","АЛАНВЕЙК","КОНТРОЛ","КВАНТУМБРЕЙК","ЛИФТ","ИНСАЙД","ЛИМБО","ЛИТЛНАЙТМАРЕС","ЛИТЛБИГПЛАНЕТ","РАЙМАН","ОРИ","ХОЛЛОНАЙТ","СЕЛЕСТА2","АЙЗАК","ДЭДСЕЛЛ","ТРИКИТОВЕР","САУЗПАРК","САБНОТИКА","ФАРМЕРСДИНАСТИ","САТИСФАКТОРИ","ФАКТОРИО","ДАЙСОНСФЕР","КЕРБАЛ","НОМАНСКАЙ","СТАРФИЛД","МАССЭФФЕКТ","ДРАГОНЭЙДЖ","ДЕУСЭКС","ПРЕЙ","СОМЫ","ДИСХОНОРД","ВОЛЬФЕНШТЕЙН","МЕТРО","ТАРКОВ","ХАНТ","РОКЕТЛИГ","ФОЛГАЙС","ГУЙС","АРМА","РИМВОРЛД","КИСЕРОН","ИНСКРИПШН"],
objects:["КОНВЕРТ","КОРОБКА","ПАКЕТ","СУМКА","БЛОКНОТ","АЛЬБОМ","ЖУРНАЛ","ГАЗЕТА","КАРТА","КАЛЕНДАРЬ","БУДИЛЬНИК","ПУЛЬТ","РОЗЕТКА","ВЫКЛЮЧАТЕЛЬ","КНОПКА","ПРОВОД","УДЛИНИТЕЛЬ","ПЕРЕХОДНИК","ПОДСТАВКА","ОРГАНАЙЗЕР","КОНТЕЙНЕР","БАНКА","КАНИСТРА","КОРОМЫСЛО","ВЕДРО","ТАЗИК","ШВАБРА","ВЕНИК","ЩЁТКА","ГУБКА","ТРЯПКА","ПРИЩЕПКА","ВЕШАЛКА","ПЛЕЧИКИ","КОВЁР","ШТОРА","КАРНИЗ","ПОЛКА","ШКАФ","ТУМБОЧКА","КОМОД","ДИВАН","КРОВАТЬ","МАТРАС","ТАБУРЕТ","ПОДНОС","СКОВОРОДА","КАСТРЮЛЯ","СОТЕЙНИК","ДУХОВКА","ПРОТИВЕНЬ","ФОРМА","ТЁРКА","ДУРШЛАГ","ШТОПОР","ОТКРЫВАШКА","ТЕРМОС","ТЕРМОМЕТР","КОМПАС","БИНОКЛЬ","ТЕЛЕСКОП","МАРКЕР","ФЛОМАСТЕР","МЕЛ","ЛИНЕЙКА","ТРАНСПОРТИР","ЦИРКУЛЬ","СТЕПЛЕР","СКРЕПКА","КНОПКА","ЗАЖИМ","ПАПКА","ФАЙЛ","ПЕЧАТЬ","ШТАМП","БРАСЛЕТ","КОЛЬЦО","ЦЕПОЧКА","КУЛОН","СЕРЬГИ","БРОШЬ","ГАЛСТУК","ШАРФ","ПЕРЧАТКИ","ВАРЕЖКИ","ШАПКА","КАПЮШОН","КУРТКА","ПАЛЬТО","ПЛАЩ","ФУТБОЛКА","СВИТЕР","ДЖИНСЫ","ШОРТЫ","КРОССОВКИ","БОТИНКИ","САНДАЛИИ","САПОГИ","РЕМЕНЬ"],
characters:["АЛАДДИН","ЖАСМИН","АРИЭЛЬ","МУЛАН","ПОКАХОНТАС","ЗОЛУШКА","БЕЛОСНЕЖКА","РАПУНЦЕЛЬ","МОАНА","МЕРИДА","ТИАНА","БЕЛЛЬ","ГАСТОН","ДЖАФАР","СКАР","СИМБА","ТИМОН","ПУМБА","МАУИ","КРУЭЛЛА","МАЛЕФИСЕНТА","ПИТЕРПЭН","КАПИТАНКРЮК","ВЕНДИ","ДИНЬДИНЬ","ЧЕБУРАШКА","КРОКОДИЛГЕНА","КАРЛСОН","МАЛЫШ","БУРАТИНО","АРТЕМОН","МАЛЬВИНА","ПЬЕРО","КОЩЕЙ","БАБАЯГА","ЗМЕЙГОРЫНЫЧ","ИВАНЦАРЕВИЧ","АЛЁНУШКА","ДОБРЫНЯ","ИЛЬЯМУРОМЕЦ","ШЕРХАН","БАГИРА","БАЛУ","МОУГЛИ","РАФИКИ","ПАДДИНГТОН","ВИННИПУХ","ПЯТАЧОК","ТИГРА","КРОШ","НЮША","БАРАШ","ЛОСЯШ","КОПАТЫЧ","ПИН","СМЕШАРИК","ФИКСИК","НОЛИК","СИМКА","ДИМДИМЫЧ","ФРЕДДИ","ЧИКА","БОННИ","ФОКСИ","МАНГЛ","ЭНДЕРМЕН","КРИПЕР","СТИВ","АЛЕКС","ХЕРОБРИН","ГЛАДОС","АТЛАС","ПИБОДИ","КОРАЛИНА","ДЖЕКСKЕЛЛИНГТОН","БИТЛДЖУС","МОРТИ","РИКСАНЧЕС","ДЖЕРРИ","ТОМ","СПАЙК","СКУБИДУ","ШАГГИ","ВЕЛЬМА","ДАФФИ","БАГЗБАННИ"],
tech:["МАРШРУТ","ПРОТОКОЛ","ПЛАГИН","ДРАЙВЕР","КОМПИЛЯТОР","ИНТЕРПРЕТАТОР","ФРЕЙМВОРК","БИБЛИОТЕКА","КОДИРОВКА","ПЕРЕМЕННАЯ","ФУНКЦИЯ","МАССИВ","ОБЪЕКТ","КЛАСС","МЕТОД","СИГНАЛ","ЧАСТОТА","НАПРЯЖЕНИЕ","МОЩНОСТЬ","РЕЗИСТОР","КОНДЕНСАТОР","ДИОД","СВЕТОДИОД","КОНТРОЛЛЕР","МАТРИЦА","ДИСПЛЕЙ","ТАЧСКРИН","АКСЕЛЕРОМЕТР","ГИРОСКОП","БАРОМЕТР","ТЕРМОСТАТ","ПЕРЕДАТЧИК","ПРИЁМНИК","АНТЕННА","СПУТНИК","ОПТОВОЛОКНО","ПРОВАЙДЕР","ХОСТИНГ","ДОМЕН","ХОСТ","БАЗАДАННЫХ","ЗАПРОС","ОТВЕТ","КЭШ","КУКИ","ТОКЕН","ПАРОЛЬ","ЛОГИН","АККАУНТ","ШЛЮЗ","ФАЕРВОЛ","АНТИВИРУС","ВИРУС","ТРОЯН","БЭКАП","АРХИВ","РАСПАКОВКА","ДЕБАГГЕР","ТЕРМИНАЛ","КОНСОЛЬ","КОМАНДА","СКРИПТ","СЕРТИФИКАТ","ПОДПИСЬ","ОБЛАКО","ХРАНИЛИЩЕ","ДАТАЦЕНТР","ПРОЦЕСС","ПОТОК","ПОТОЧНОСТЬ","ЯДРО","КЭШПАМЯТЬ","БИТРЕЙТ","КОДЕК","ФОРМАТ","РАЗРЕШЕНИЕ","ЧАСТОТА","СЕНСОР","МОДУЛЬ","ПЛАТА","РАЗЪЁМ","ПОРТ","ПЕРЕХОДНИК","ВИДЕОЧИП"]
};
for(const [key,items] of Object.entries(extraBanks)) banks[key].push(...items);

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
const usedStorageKey="wordguess-used-v2:"+channel+":"+theme+":"+difficulty;
const noRepeatSessionMs=18*60*60*1000;
let usedWords=new Set(),sessionStartedAt=Date.now();
try{
 const stored=JSON.parse(localStorage.getItem(usedStorageKey)||"null");
 if(stored&&Array.isArray(stored.used)&&Number.isFinite(stored.startedAt)&&Date.now()-stored.startedAt<noRepeatSessionMs){
  usedWords=new Set(stored.used);sessionStartedAt=stored.startedAt;
 }
}catch(e){}
let pools=getPools();
function saveUsedWords(){try{localStorage.setItem(usedStorageKey,JSON.stringify({startedAt:sessionStartedAt,used:[...usedWords]}))}catch(e){}}
function chooseWord(){
 const candidates=Object.entries(pools).flatMap(([key,list])=>list.map(value=>({word:value,category:key}))).filter(item=>!usedWords.has(item.word));
 if(!candidates.length)return null;
 const pick=candidates[Math.floor(Math.random()*candidates.length)];
 usedWords.add(pick.word);saveUsedWords();
 return pick;
}
const scoreKey="wordguess-score-v1:"+channel;
let scores={};
try{scores=JSON.parse(localStorage.getItem(scoreKey)||"{}")||{}}catch(e){scores={}}
function saveScores(){try{localStorage.setItem(scoreKey,JSON.stringify(scores))}catch(e){}}
function renderLeaderboard(){
 const box=$("leaderboard");if(!box)return;
 const cleanScores={};
 Object.entries(scores).forEach(([rawName,count])=>{const name=String(rawName).replace(/^:+/,"").trim();if(name)cleanScores[name]=(cleanScores[name]||0)+Number(count||0)});
 const top=Object.entries(cleanScores).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,5);
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
 const chosen=chooseWord();if(!chosen){playing=false;clearInterval(hintTimer);setStatus("Все слова в этой подборке уже использованы — добавь свои слова или смени категорию");$("countdown").textContent="СЛОВА ЗАКОНЧИЛИСЬ";render();return}
 clearInterval(hintTimer);word=chosen.word;currentCategory=chosen.category;mask=[...word].map(()=>"•");
 const positions=[...Array(mask.length).keys()];
 for(let n=0;n<2&&positions.length;n++){const index=positions.splice(Math.floor(Math.random()*positions.length),1)[0];mask[index]=word[index]}
 round++;playing=true;nextHint=interval*1000;$("winnerBanner").classList.remove("show");setStatus("Слово загадано — пишите ответы в чат");render();
 hintTimer=setInterval(()=>{if(!playing)return;const hidden=mask.map((x,i)=>x==="•"?i:-1).filter(i=>i>=0);if(hidden.length){const i=hidden[Math.floor(Math.random()*hidden.length)];mask[i]=word[i]}nextHint=interval*1000;render()},interval*1000);
 const tick=setInterval(()=>{if(!playing){clearInterval(tick);return}nextHint=Math.max(0,nextHint-1000);$("countdown").textContent="НОВАЯ БУКВА ЧЕРЕЗ "+Math.ceil(nextHint/1000)+" СЕК."},1000);
}
function stop(){playing=false;clearInterval(hintTimer);if(updatePending)scheduleReload(700);setStatus("Игра остановлена");$("countdown").textContent="ИГРА ОСТАНОВЛЕНА";render()}
function hint(){if(!playing)return;const hidden=mask.map((x,i)=>x==="•"?i:-1).filter(i=>i>=0);if(hidden.length){const i=hidden[Math.floor(Math.random()*hidden.length)];mask[i]=word[i]}nextHint=interval*1000;render()}
function win(user){
 playing=false;clearInterval(hintTimer);scores[user]=(scores[user]||0)+1;saveScores();renderLeaderboard();
 $("winnerName").textContent=user;$("winnerWord").textContent=word;$("winnerBanner").classList.remove("show");void $("winnerBanner").offsetWidth;$("winnerBanner").classList.add("show");
 setStatus("ПОБЕДИТЕЛЬ: "+user+" · "+word);
 if(tournament){
  tournamentRound++;
  if(tournamentRound>=tournament){
   tournament=0;tournamentRound=0;
   setTimeout(()=>{$("winnerBanner").classList.remove("show");word="";mask=[];render();setStatus("ТУРНИР ЗАВЕРШЁН");if(updatePending)scheduleReload(700)},5000);
   return;
  }
  if(updatePending){setTimeout(()=>{if(!playing)scheduleReload(400)},4200);return}
  if(p.get("auto")!=="0")setTimeout(()=>{if(!playing){word="";mask=[];startRound()}},5000);
  return;
 }
 if(updatePending){scheduleReload(4200);return}
 if(p.get("auto")!=="0")setTimeout(()=>{if(!playing){word="";mask=[];startRound()}},5000);
}
function isMod(tags,nick){return String(nick||"").toLowerCase()===channel||tags.mod==="1"||String(tags.badges||"").split(",").some(x=>/^(broadcaster|moderator)\//.test(x))}
function command(msg,user,tags){
 const c=msg.trim().toLowerCase();
 if(c==="!угадай статус"){setStatus(playing?"Игра идёт · раунд "+round:"Игра не запущена");return true}
 if(c==="!угадай обновить"){
  if(!isMod(tags,user))return false;
  updatePending=true;
  if(playing)setStatus("Обновление запланировано после текущего раунда");
  else{setStatus("Загружаю актуальную версию…");scheduleReload(500)}
  return true;
 }
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
 const nick=(parts[i]||"").replace(/^:/,"").split("!")[0].replace(/^:/,""),idx=raw.indexOf(" :",raw.indexOf(" PRIVMSG "));if(idx<0)return;
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
let currentBuild="",updatePending=false,reloadTimer=null;
async function readBuild(){
 try{
  const response=await fetch("./version.json?check="+Date.now(),{cache:"no-store"});
  if(!response.ok)return;
  const data=await response.json();
  if(!data.version)return;
  if(!currentBuild){currentBuild=data.version;return}
  if(data.version!==currentBuild){
   updatePending=true;
   if(!playing)scheduleReload(1200);
  }
 }catch(e){}
}
function scheduleReload(delay){
 if(reloadTimer)return;
 reloadTimer=setTimeout(()=>{
  const target=new URL(location.href);
  target.searchParams.set("_refresh",String(Date.now()));
  location.replace(target.toString());
 },delay);
}
setInterval(readBuild,30000);
readBuild();
render();connect();
})();