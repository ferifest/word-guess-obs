const $ = id => document.getElementById(id);
const savedAdminKey = localStorage.getItem("wordGuessAdminKey") || "";
$("adminKey").value = savedAdminKey;
$("create").addEventListener("click", async () => {
  $("error").hidden = true; $("result").hidden = true;
  let channel = $("channel").value.trim().replace(/^@/, "");
  if (channel.toLowerCase().includes("twitch.tv/")) channel = channel.split(/twitch\.tv\//i).pop().split(/[/?#]/)[0];
  channel = channel.replace(/\/$/, "");
  if (!/^[a-zA-Z0-9_]{3,25}$/.test(channel)) {
    $("error").textContent = "Введи корректный логин Twitch-канала (3–25 символов, латиница, цифры и _).";
    $("error").hidden = false; return;
  }
  const adminKey = $("adminKey").value;
  const config = {
    channel, theme: $("theme").value, difficulty: $("difficulty").value,
    hintInterval: Number($("hintInterval").value), accent: $("accent").value,
    overlayWidth: Number($("overlayWidth").value), overlayHeight: Number($("overlayHeight").value),
    tileSize: Math.min(118, Math.max(64, Math.round(Number($("overlayHeight").value) * 0.29))),
    showAttempts: $("showAttempts").checked, autoStart: $("autoStart").checked
  };
  try {
    const response = await fetch("/api/config", {method:"POST",headers:{"Content-Type":"application/json","x-admin-key":adminKey},body:JSON.stringify(config)});
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Не удалось сохранить настройки.");
    localStorage.setItem("wordGuessAdminKey", adminKey);
    const url = new URL("/overlay.html", location.origin);
    url.searchParams.set("channel", channel); url.searchParams.set("width", String(config.overlayWidth));
    url.searchParams.set("tile", String(config.tileSize)); url.searchParams.set("accent", config.accent);
    $("overlayUrl").value = url.toString();
    $("dimensions").textContent = `В OBS → Источник «Браузер»: ширина ${config.overlayWidth} px, высота ${config.overlayHeight} px. Вставь URL выше без изменений.`;
    $("result").hidden = false; $("result").scrollIntoView({behavior:"smooth",block:"nearest"});
  } catch (error) { $("error").textContent = error.message; $("error").hidden = false; }
});
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("overlayUrl").value); $("copy").textContent = "Скопировано"; }
  catch { $("overlayUrl").select(); document.execCommand("copy"); $("copy").textContent = "Скопировано"; }
});
fetch("/api/state").then(r=>r.json()).then(data=>{
  if(data.config.channel) $("channel").value=data.config.channel;
  if(data.config.accent){document.documentElement.style.setProperty("--accent",data.config.accent);$("accent").value=data.config.accent;}
});