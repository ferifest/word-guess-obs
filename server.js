const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA_DIR = process.env.DATA_DIR || ROOT;
fs.mkdirSync(DATA_DIR, { recursive: true });
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const PORT = Number(process.env.PORT || 3000);

const WORDS = [
  ["Животные", ["тигр", "волк", "лиса", "зебра", "жираф", "панда", "собака", "дельфин", "крокодил", "пингвин", "кенгуру", "черепаха", "носорог"]],
  ["Еда", ["пицца", "арбуз", "банан", "пельмени", "шоколад", "картофель", "мороженое", "бутерброд", "клубника", "макароны", "омлет"]],
  ["Страны и города", ["россия", "япония", "италия", "лондон", "париж", "берлин", "испания", "канада", "бразилия", "москва", "токио", "варшава"]],
  ["Игры", ["майнкрафт", "террария", "роблокс", "фортнайт", "портал", "скайрим", "ведьмак", "сабнавтика", "геометрия"]],
  ["Предметы", ["телефон", "монитор", "клавиатура", "рюкзак", "зеркало", "компас", "фонарик", "наушники", "микрофон", "велосипед"]],
  ["Персонажи", ["шерлок", "бэтмен", "пикачу", "шрек", "марио", "соник", "йода"]],
  ["Техника", ["ноутбук", "процессор", "видеокарта", "планшет", "роутер", "колонка", "принтер", "дрон", "сервер"]]
];

function loadConfig() {
  try { return { ...JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")) }; }
  catch { return { channel: "", revealDelay: 5, hintInterval: 15, autoStart: true, theme: "Случайная тема", difficulty: "Любая длина", topics: WORDS.map(x => x[0]), customWords: [] }; }
}
let config = loadConfig();
if (!config.hintInterval) config.hintInterval = 15;

let clients = new Set();
let twitchSocket = null;
let reconnectTimer = null;
let hintTimer = null;
let countdownTimer = null;
let nextHintAt = null;
let nextTimer = null;
let usedWords = new Set();
let tournament = null;

let state = {
  status: "waiting", word: "", category: "", masked: [], attempts: [], winner: null,
  round: 0, message: "Ожидание запуска", score: {}, autoStart: config.autoStart !== false,
  hintsOpened: 0, tournament: null
};

function saveConfig() { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8"); }
function send(ws, obj) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); }
function publicState() {
  const secondsToHint = state.status === "playing" && nextHintAt
    ? Math.max(0, Math.ceil((nextHintAt - Date.now()) / 1000)) : null;
  return { ...state, channel: config.channel, autoStart: config.autoStart, theme: config.theme, difficulty: config.difficulty,
    hintInterval: config.hintInterval, revealDelay: config.revealDelay, secondsToHint,
    showAttempts: config.showAttempts !== false, accent: config.accent || "#ff955f" };
}
function broadcast() {
  const data = JSON.stringify({ type: "state", state: publicState() });
  for (const ws of clients) if (ws.readyState === WebSocket.OPEN) ws.send(data);
}
function normalize(s) {
  return String(s || "").toLocaleLowerCase("ru-RU").normalize("NFKC")
    .replace(/ё/g, "е").replace(/[^\p{L}\p{N}]+/gu, "").trim();
}
function getWordPool() {
  const active = config.theme && config.theme !== "Случайная тема" ? [config.theme] : (config.topics || WORDS.map(x => x[0]));
  let pool = [];
  for (const [category, words] of WORDS) {
    if (!active.includes(category)) continue;
    for (const word of words) pool.push({ category, word });
  }
  for (const item of (config.customWords || [])) {
    if (item && item.word && (config.theme === "Случайная тема" || active.includes(item.category))) pool.push({ category: item.category || "Своя тема", word: item.word });
  }
  if (config.difficulty === "4–5 букв") pool = pool.filter(x => [...x.word].filter(c => c !== " ").length >= 4 && [...x.word].filter(c => c !== " ").length <= 5);
  if (config.difficulty === "6–7 букв") pool = pool.filter(x => [...x.word].filter(c => c !== " ").length >= 6 && [...x.word].filter(c => c !== " ").length <= 7);
  if (config.difficulty === "8–10 букв") pool = pool.filter(x => [...x.word].filter(c => c !== " ").length >= 8 && [...x.word].filter(c => c !== " ").length <= 10);
  return pool;
}
function makeMask(word) {
  const chars = [...word];
  const positions = chars.map((c, i) => /[\p{L}\p{N}]/u.test(c) ? i : -1).filter(i => i >= 0);
  const revealCount = Math.max(1, Math.min(2, Math.floor(positions.length * 0.25)));
  const chosen = new Set();
  while (chosen.size < revealCount && chosen.size < positions.length) chosen.add(positions[Math.floor(Math.random() * positions.length)]);
  return chars.map((c, i) => chosen.has(i) || !/[\p{L}\p{N}]/u.test(c) ? c.toLocaleUpperCase("ru-RU") : "•");
}
function stopHintTimer() {
  clearTimeout(hintTimer); hintTimer = null;
  clearInterval(countdownTimer); countdownTimer = null;
  nextHintAt = null;
}
function scheduleNextHint() {
  clearTimeout(hintTimer);
  const interval = Math.max(5, Math.min(120, Number(config.hintInterval) || 15));
  nextHintAt = Date.now() + interval * 1000;
  hintTimer = setTimeout(revealOneLetter, interval * 1000);
}
function stopNextTimer() { clearTimeout(nextTimer); nextTimer = null; }
function revealOneLetter() {
  if (state.status !== "playing") return false;
  const hidden = state.masked.map((c, i) => c === "•" ? i : -1).filter(i => i >= 0);
  if (!hidden.length) {
    state.message = "Все буквы открыты — слово всё ещё можно угадать";
    stopHintTimer(); broadcast(); return false;
  }
  const index = hidden[Math.floor(Math.random() * hidden.length)];
  state.masked[index] = [...state.word][index].toLocaleUpperCase("ru-RU");
  state.hintsOpened += 1;
  scheduleNextHint();
  state.message = "Открыта дополнительная буква";
  broadcast(); return true;
}
function getTournamentSummary() {
  if (!tournament) return "";
  const sorted = Object.entries(tournament.scores).sort((a,b) => b[1]-a[1]);
  if (!sorted.length) return "Турнир завершён без победителей";
  const top = sorted[0][1], leaders = sorted.filter(x => x[1] === top).map(x => x[0]);
  return leaders.length === 1 ? `Турнир завершён · Победитель: ${leaders[0]} (${top})` : `Турнир завершён · Ничья: ${leaders.join(", ")} (${top})`;
}
function finishTournament() {
  const summary = getTournamentSummary();
  tournament = null; state.tournament = null; state.status = "waiting";
  state.message = summary; state.winner = null; broadcast();
}
function scheduleNextRound() {
  stopNextTimer();
  if (tournament && tournament.completed >= tournament.total) {
    nextTimer = setTimeout(finishTournament, Math.max(2, Number(config.revealDelay) || 5) * 1000); return;
  }
  if (config.autoStart || tournament) nextTimer = setTimeout(startRound, Math.max(2, Number(config.revealDelay) || 5) * 1000);
}
function startRound() {
  stopHintTimer(); stopNextTimer();
  let pool = getWordPool();
  if (!pool.length) { state.status = "waiting"; state.message = "Нет слов для выбранной темы или сложности"; broadcast(); return; }
  let available = pool.filter(x => !usedWords.has(x.category + ":" + x.word));
  if (!available.length) { usedWords.clear(); available = pool; }
  const picked = available[Math.floor(Math.random() * available.length)];
  usedWords.add(picked.category + ":" + picked.word);
  state.round += 1; state.status = "playing"; state.word = picked.word; state.category = picked.category;
  state.masked = makeMask(picked.word); state.attempts = []; state.winner = null; state.hintsOpened = 0;
  state.message = tournament ? `Турнир · раунд ${tournament.completed + 1} из ${tournament.total}` : "Угадайте слово!";
  state.tournament = tournament ? { active: true, current: tournament.completed + 1, total: tournament.total } : null;
  broadcast(); scheduleNextHint();
  countdownTimer = setInterval(() => { if (state.status === "playing") broadcast(); else stopHintTimer(); }, 1000);
}
function endRound(won, winner = null, reason = "Слово открыто") {
  stopHintTimer(); state.status = "revealed"; state.winner = winner; state.message = won ? `Угадал: ${winner}` : reason;
  state.masked = [...state.word.toLocaleUpperCase("ru-RU")];
  if (won && winner) {
    state.score[winner] = (state.score[winner] || 0) + 1;
    if (tournament) {
      tournament.scores[winner] = (tournament.scores[winner] || 0) + 1; tournament.completed += 1;
      state.tournament = { active: true, current: tournament.completed, total: tournament.total };
    }
  }
  broadcast(); if (won) scheduleNextRound();
}
function addAttempt(user, text) {
  if (state.status !== "playing") return;
  const guess = String(text || "").trim();
  if (!guess || guess.startsWith("!") || guess.length > 60) return;
  const cleanGuess = normalize(guess);
  if (!cleanGuess) return;
  if (cleanGuess === normalize(state.word)) { endRound(true, user, "Слово угадано"); return; }
  if (!state.attempts.some(a => a.user === user && normalize(a.text) === cleanGuess)) {
    state.attempts.unshift({ user, text: guess.slice(0, 40) }); state.attempts = state.attempts.slice(0, 6); broadcast();
  }
}
function isModerator(tags, login) {
  const badges = String(tags.badges || "");
  return tags.mod === "1" || badges.split(",").some(b => /^(broadcaster|moderator)\//.test(b)) ||
    login.toLowerCase() === String(config.channel || "").toLowerCase();
}
function handleChatCommand(user, text, moderator) {
  const cmd = text.trim().toLocaleLowerCase("ru-RU").replace(/\s+/g, " ");
  if (!cmd.startsWith("!угадай")) return false;
  const tail = cmd.slice("!угадай".length).trim();
  if (tail === "статус") {
    if (state.word && state.status === "playing") {
      endRound(false, null, `Текущее слово: ${state.word.toLocaleUpperCase("ru-RU")}`);
      if (config.autoStart) scheduleNextRound();
    } else {
      state.message = state.word ? `Текущее слово: ${state.word.toLocaleUpperCase("ru-RU")}` : "Сейчас нет активного раунда";
      broadcast();
    }
    return true;
  }
  if (!moderator) return true;
  if (tail === "старт") { tournament = null; state.tournament = null; startRound(); return true; }
  if (tail === "подсказка") { revealOneLetter(); return true; }
  if (tail === "стоп") {
    stopHintTimer(); stopNextTimer(); tournament = null; state.tournament = null;
    if (state.word && state.status === "playing") {
      state.status = "revealed"; state.masked = [...state.word.toLocaleUpperCase("ru-RU")];
      state.message = "Раунд остановлен модератором"; state.winner = null;
    } else { state.status = "waiting"; state.message = "Игра остановлена"; }
    broadcast(); return true;
  }
  const tournamentMatch = tail.match(/^турнир(?:\s+(\d+))?$/);
  if (tournamentMatch) {
    const count = Math.max(1, Math.min(20, Number(tournamentMatch[1] || 5)));
    tournament = { total: count, completed: 0, scores: {} };
    state.tournament = { active: true, current: 1, total: count };
    state.message = `Запущен турнир на ${count} раундов`; startRound(); return true;
  }
  return true;
}
function parseIrcLine(line) {
  let tags = {}, rest = line;
  if (rest.startsWith("@")) {
    const idx = rest.indexOf(" ");
    if (idx > -1) {
      for (const part of rest.slice(1, idx).split(";")) { const [k, ...v] = part.split("="); tags[k] = v.join("="); }
      rest = rest.slice(idx + 1);
    }
  }
  const match = rest.match(/^:([^!]+)![^ ]+ PRIVMSG #[^ ]+ :(.*)$/);
  if (match) {
    const login = match[1], user = tags["display-name"] || login, message = match[2];
    const moderator = isModerator(tags, login);
    if (handleChatCommand(user, message, moderator)) return;
    addAttempt(user, message);
  }
}
function connectTwitch() {
  clearTimeout(reconnectTimer);
  if (!config.channel) return;
  try {
    if (twitchSocket) { twitchSocket.removeAllListeners(); twitchSocket.close(); }
    twitchSocket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    twitchSocket.on("open", () => {
      const nick = "justinfan" + Math.floor(10000 + Math.random() * 900000);
      twitchSocket.send("CAP REQ :twitch.tv/tags twitch.tv/commands\r\n");
      twitchSocket.send("PASS SCHMOOPIIE\r\n"); twitchSocket.send("NICK " + nick + "\r\n");
      twitchSocket.send("JOIN #" + config.channel.replace(/^#/, "").toLowerCase() + "\r\n");
      state.message = `Подключение к Twitch-каналу ${config.channel}…`; broadcast();
    });
    twitchSocket.on("message", data => {
      for (const line of data.toString().split("\r\n")) {
        if (!line) continue;
        if (line.startsWith("PING")) twitchSocket.send("PONG :tmi.twitch.tv\r\n");
        else parseIrcLine(line);
      }
    });
    twitchSocket.on("close", () => { reconnectTimer = setTimeout(connectTwitch, 5000); });
    twitchSocket.on("error", () => {});
  } catch { reconnectTimer = setTimeout(connectTwitch, 5000); }
}
function applyConfig(next) {
  const oldChannel = config.channel;
  config = { ...config, ...next };
  config.channel = String(config.channel || "").trim().replace(/^@/, "").replace(/^#/, "").toLowerCase();
  config.revealDelay = Math.max(2, Math.min(30, Number(config.revealDelay) || 5));
  config.hintInterval = Math.max(5, Math.min(120, Number(config.hintInterval) || 15));
  config.autoStart = config.autoStart !== false; config.showAttempts = config.showAttempts !== false;
  config.accent = /^#[0-9a-fA-F]{6}$/.test(String(config.accent || "")) ? config.accent : "#ff955f";
  config.overlayWidth = Math.max(700, Math.min(2200, Number(config.overlayWidth) || 1200));
  config.overlayHeight = Math.max(220, Math.min(700, Number(config.overlayHeight) || 300));
  config.tileSize = Math.max(64, Math.min(130, Number(config.tileSize) || 96));
  saveConfig(); if (oldChannel !== config.channel) connectTwitch(); broadcast();
}
function adminAuthorized(req) {
  const requiredKey = process.env.ADMIN_KEY;
  if (!requiredKey) return true;
  return String(req.headers["x-admin-key"] || "") === requiredKey;
}
function denyAdmin(res) {
  res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Неверный пароль управления. Проверь поле ADMIN_KEY." }));
}
function handleAction(action) {
  if (action === "start") { tournament = null; state.tournament = null; startRound(); }
  if (action === "hint") revealOneLetter();
  if (action === "stop") {
    stopHintTimer(); stopNextTimer(); tournament = null; state.tournament = null;
    if (state.word && state.status === "playing") {
      state.status = "revealed"; state.masked = [...state.word.toLocaleUpperCase("ru-RU")];
      state.message = "Раунд остановлен"; state.winner = null;
    } else { state.status = "waiting"; state.message = "Игра остановлена"; }
    broadcast();
  }
  if (action === "tournament") {
    const count = 5; tournament = { total: count, completed: 0, scores: {} };
    state.tournament = { active: true, current: 1, total: count }; startRound();
  }
  if (action === "reveal" && state.word && state.status === "playing") endRound(false, null, `Текущее слово: ${state.word.toLocaleUpperCase("ru-RU")}`);
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "GET" && url.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("ok");
  }
  if (req.method === "GET" && url.pathname === "/api/state") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ state: publicState(), config }));
  }
  if (req.method === "POST" && url.pathname === "/api/config") {
    if (!adminAuthorized(req)) return denyAdmin(res);
    let body = ""; req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try { applyConfig(JSON.parse(body || "{}")); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); }
      catch { res.writeHead(400); res.end("Bad JSON"); }
    }); return;
  }
  if (req.method === "POST" && url.pathname === "/api/action") {
    if (!adminAuthorized(req)) return denyAdmin(res);
    let body = ""; req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try { handleAction(JSON.parse(body || "{}").action); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true })); }
      catch { res.writeHead(400); res.end("Bad request"); }
    }); return;
  }
  const requested = url.pathname === "/" ? "setup.html" : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(PUBLIC, requested);
  if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end("Not found"); }
  const ext = path.extname(file);
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
});
const wss = new WebSocket.Server({ server });
wss.on("connection", ws => { clients.add(ws); send(ws, { type: "state", state: publicState() }); ws.on("close", () => clients.delete(ws)); });
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Word Guess запущен: http://localhost:${PORT}`);
  console.log(`OBS overlay: http://localhost:${PORT}/overlay.html`);
  console.log(`Панель управления: http://localhost:${PORT}/control.html`);
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_KEY) console.warn("ВНИМАНИЕ: ADMIN_KEY не задан. Задай пароль управления в настройках хостинга.");
  connectTwitch();
  if (config.autoStart) nextTimer = setTimeout(startRound, 1500);
});
