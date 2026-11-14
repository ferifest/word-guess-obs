const $ = id => document.getElementById(id);
let socket;
let previousMask = "";
function connect() {
  const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${wsProtocol}//${location.host}`);
  socket.onmessage = event => {
    const packet = JSON.parse(event.data);
    if (packet.type === "state") render(packet.state);
  };
  socket.onclose = () => setTimeout(connect, 1500);
}
function render(s) {
  const params = new URLSearchParams(location.search);
  const tileSize = Number(params.get("tile")) || 90;
  const accent = /^#[0-9a-fA-F]{6}$/.test(params.get("accent") || "") ? params.get("accent") : (s.accent || "#ff955f");
  const overlayWidth = Math.max(700, Math.min(2200, Number(params.get("width")) || s.overlayWidth || 1000));
  document.documentElement.style.setProperty("--tile-size", `${Math.max(64, Math.min(130, tileSize))}px`);
  document.documentElement.style.setProperty("--overlay-width", `${overlayWidth}px`);
  document.documentElement.style.setProperty("--accent", accent);
  $("category").textContent = s.category ? s.category.toLocaleUpperCase("ru-RU") : "ОЖИДАНИЕ РАУНДА";
  $("length").textContent = `Букв: ${s.word ? [...s.word].filter(c => c !== " ").length : "—"}`;
  $("round").textContent = s.tournament?.active ? `ТУРНИР ${s.tournament.current}/${s.tournament.total}` : `РАУНД ${s.round || 0}`;
  $("countdown").textContent = s.status === "playing" ? `НОВАЯ БУКВА ЧЕРЕЗ ${s.secondsToHint ?? "—"} СЕК.` : "ОЖИДАНИЕ СЛЕДУЮЩЕГО РАУНДА";
  $("hintInfo").textContent = s.status === "playing" ? `Открыто букв: ${s.masked.filter(c => c !== "•" && c !== " ").length}` : "";
  const maskKey = (s.masked || []).join("");
  if (maskKey !== previousMask || $("word").children.length === 0) {
    const word = $("word");
    const old = new Map([...word.children].map((el, i) => [String(i), el]));
    const fragment = document.createDocumentFragment();
    (s.masked || []).forEach((char, i) => {
      let tile = old.get(String(i));
      const cls = char === " " ? "tile space" : "tile" + (char === "•" ? " hidden" : "");
      if (!tile || tile.dataset.char !== char) {
        tile = document.createElement("div");
        tile.className = cls;
        tile.textContent = char === " " ? "" : char;
        tile.dataset.char = char;
      } else tile.className = cls;
      fragment.append(tile);
    });
    word.replaceChildren(fragment);
    if (!s.masked || !s.masked.length) {
      const p = document.createElement("div"); p.className = "placeholder"; p.textContent = "ОЖИДАНИЕ ИГРЫ"; word.append(p);
    }
    previousMask = maskKey;
  }
  $("attemptPanel").style.display = s.showAttempts === false ? "none" : "";
  const attempts = $("attempts");
  const attemptKey = JSON.stringify(s.attempts || []);
  if (attempts.dataset.key !== attemptKey) {
    attempts.replaceChildren();
    if (!s.attempts || !s.attempts.length) {
      const empty = document.createElement("span"); empty.className = "empty";
      empty.textContent = s.status === "playing" ? "Пока никто не отвечал" : "Последние попытки появятся здесь";
      attempts.append(empty);
    } else {
      for (const item of s.attempts.slice(0, 5)) {
        const el = document.createElement("div"); el.className = "attempt";
        const name = document.createElement("b"); name.textContent = item.user;
        const guess = document.createElement("span"); guess.textContent = item.text;
        el.append(name, guess); attempts.append(el);
      }
    }
    attempts.dataset.key = attemptKey;
  }
  $("status").textContent = s.winner ? `ПОБЕДИТЕЛЬ: ${s.winner}` : (s.message || "");
}
connect();