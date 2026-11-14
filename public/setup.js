const $=id=>document.getElementById(id);
$("create").addEventListener("click",()=>{
 $("error").hidden=true;$("result").hidden=true;
 let channel=$("channel").value.trim().replace(/^@/,"");
 if(channel.toLowerCase().includes("twitch.tv/"))channel=channel.split(/twitch\.tv\//i).pop().split(/[/?#]/)[0];
 if(!/^[a-zA-Z0-9_]{3,25}$/.test(channel)){ $("error").textContent="Введи корректный логин Twitch-канала: 3–25 символов, латиница, цифры и _."; $("error").hidden=false;return; }
 const params=new URLSearchParams({channel,theme:$("theme").value,difficulty:$("difficulty").value,hint:$("hintInterval").value,accent:$("accent").value,width:$("overlayWidth").value,height:$("overlayHeight").value,attempts:$("showAttempts").checked?"1":"0",auto:$("autoStart").checked?"1":"0",words:$("customWords").value.trim()});
 const url=new URL("./overlay.html",location.href);url.search=params.toString();
 $("overlayUrl").value=url.href;
 $("dimensions").textContent="Размер источника OBS: "+params.get("width")+" × "+params.get("height")+" px.";
 $("result").hidden=false;$("result").scrollIntoView({behavior:"smooth",block:"nearest"});
});
$("copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("overlayUrl").value);$("copy").textContent="Скопировано";}catch{$("overlayUrl").select();document.execCommand("copy");$("copy").textContent="Скопировано";}});
