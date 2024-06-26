import { getLangText } from ".";
import { lrc_lyrics, offsetTime } from "../variable";

export function timeFormat(time, includes_milis) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  let milliseconds = (time % 60).toFixed(2).split(".")[1];
  if (milliseconds.length > 2) milliseconds = milliseconds.slice(0, 2);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${includes_milis ? `.${String(milliseconds).padStart(2, "0")}` : ""}`;
}

//  returning from mm:ss.xx string into int number
export function convertTimeStringToSecondsInt(timeString) {
  if (typeof timeString === "number") return timeString;
  if (!timeString.match(/\d{1,3}:\d{1,3}\.\d{1,3}/)) return NaN;
  const [minutes, rest] = timeString.split(":");
  const [seconds, milliseconds] = rest.split(".");
  return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 100;
}

// get timme format from lyrics
export function getLrcAttribut(str) {
  return str.substring(str.indexOf("[") + 1, str.indexOf("]")).trim();
}

// finding current lyics
export function findCurrentLyricsIndex(time) {
  // const lyrics = lrc_lyrics.value.split("\n");

  let index = null;

  for (let i = 0; i < window.lyrics.length; i++) {
    const timeA = convertTimeStringToSecondsInt(getLrcAttribut(window.lyrics[i]));
    if (timeA <= time && !(timeA === 0 && i > 0)) index = i;
  }

  return index;
}

export function create_trTable(id, time, text) {
  const tr = document.createElement("tr");
  tr.classList.add("dark:odd:bg-1/10", "dark:even:bg-3/10", "lrc-tr-table", "odd:bg-2/10", "even:bg-4/10");
  tr.dataset.id = id;
  tr.dataset.time = convertTimeStringToSecondsInt(time);

  const td1 = document.createElement("td");
  td1.classList.add("border", "border-slate-600", "p-2", "text-center", "cursor-pointer");
  td1.style.width = "120px";
  td1.innerHTML = time;
  td1.title = getLangText("editor.td.tittle");

  // set time click handler
  td1.onclick = function () {
    const currentTime = audioPlayer.currentTime;
    const offset = Number(offsetTime.value);

    window.setTimeLyrics(id, Math.min(audioPlayer.duration, Math.max(0, currentTime + offset)));
  };

  const td2 = document.createElement("td");
  td2.innerHTML = text;
  td2.classList.add("border", "border-slate-600", "p-2", "cursor-pointer");
  td2.addEventListener("click", function () {
    const lyicsTime = parseFloat(this.parentElement.dataset.time);

    // console.log(time, lyicsTime);
    audioPlayer.currentTime = lyicsTime;
    // lrc_update();
  });

  tr.appendChild(td1);
  tr.appendChild(td2);
  return tr;
}
