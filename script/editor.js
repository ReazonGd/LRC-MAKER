import { createPopup, getLangText, gotoPage, popup_loading } from "./util";
import { convertTimeStringToSecondsInt, create_trTable, findCurrentLyricsIndex, getLrcAttribut, timeFormat } from "./util/timeAndString";
import { app_version, audioPlayer, copyButton, exportLRCfile, exportLRCfileButton, file_name, lastLyricsSetIndex, lrc_album, lrc_artist, lrc_author, lrc_fileName, lrc_lyrics, lrc_title, lrc_userName, mainElement, offsetTime, pnpButton, saveButton, stopwatch, table, view_contaier } from "./variable";

window.lyrics = [];

const interval = setInterval(function () {
  if (!(window.lyrics.length && window.lyrics.length > 0 && audioPlayer.src && !audioPlayer.paused)) return;
  if (mainElement.dataset.id == "2") lrc_update();
  else if (mainElement.dataset.id == "4") updateViewDisplay();
}, 100);

exportLRCfileButton.addEventListener("click", function () {
  exportLRCfile.click();
});
exportLRCfileButton.addEventListener("drop", function (event) {
  event.preventDefault();

  const file = event.dataTransfer.files[0];
  lrcFileHandler(file);
});
exportLRCfile.addEventListener("change", function (event) {
  const file = event.target.files[0];

  lrcFileHandler(file);
});

lrc_lyrics.addEventListener("paste", function (event) {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData("text");

  filterLyrics(paste);
});

const lrcFileHandler = (file) => {
  if (!(file && (file.name.endsWith(".lrc") || file.name.endsWith(".txt")))) {
    createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
  }

  popup_loading.add("export_lrc_file");
  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    filterLyrics(content);
    popup_loading.remove("export_lrc_file");
  };
  reader.readAsText(file);
};

function filterLyrics(content) {
  let arr_lyrics = content.split("\n");
  arr_lyrics = arr_lyrics.filter((v) => v);
  arr_lyrics = arr_lyrics.map((v) => v.trim());

  window.lyrics = [];

  const getValAttr = (str) => str.split(":").slice(1).join(":");

  arr_lyrics.forEach((v) => {
    if (v.startsWith("[")) {
      const att = getLrcAttribut(v);

      if (att.startsWith("ti:")) lrc_title.value = getValAttr(att);
      else if (att.startsWith("ar:")) lrc_artist.value = getValAttr(att);
      else if (att.startsWith("al:")) lrc_album.value = getValAttr(att);
      else if (att.startsWith("au:")) lrc_author.value = getValAttr(att);
      else if (att.startsWith("by:")) lrc_userName.value = getValAttr(att);
      else if (!isNaN(convertTimeStringToSecondsInt(att))) window.lyrics.push(v);
    } else if (v.startsWith("#")) return;
    else window.lyrics.push(v);
  });

  lrc_lyrics.value = window.lyrics.join("\n");
}

function setTimeLyrics(index, time) {
  if (index > 1 && window.lyrics[index - 1] && convertTimeStringToSecondsInt(getLrcAttribut(window.lyrics[index - 1])) === 0) return;
  const formatedTime = timeFormat(time, true);
  const strTime = `[${formatedTime}]`;
  const str = window.lyrics[index].replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "");

  window.lyrics[index] = strTime + str;
  lrc_lyrics.value = window.lyrics.join("\n");

  lastLyricsSetIndex.value = index;
  document.querySelector(`.lrc-tr-table[data-id="${index}"] td:first-child`).innerHTML = formatedTime;
  document.querySelector(`.lrc-tr-table[data-id="${index}"]`).dataset.time = time;
  lrc_update();
  return formatedTime;
}
window.setTimeLyrics = setTimeLyrics;

stopwatch.addEventListener("click", function () {
  setNextLyrics();
});

const setNextLyrics = (notNext) => {
  if (+lastLyricsSetIndex.value >= window.lyrics.length - 1) return;
  const currentTime = audioPlayer.currentTime;
  const offset = Number(offsetTime.value);

  const resultTime = Math.min(audioPlayer.duration, Math.max(0, currentTime + offset));
  if (notNext) setTimeLyrics(+lastLyricsSetIndex.value, resultTime);
  else setTimeLyrics(+lastLyricsSetIndex.value + 1, resultTime);
};

function updateViewDisplay() {
  const currentLyricsIndex = findCurrentLyricsIndex(audioPlayer.currentTime) || 0;
  const lastHightLighted = view_contaier.dataset.id;

  if (lastHightLighted !== currentLyricsIndex) {
    const currentElement = document.querySelector(`.lrc-lyrics-display-text[data-id='${currentLyricsIndex}']`);
    view_contaier.dataset.id = currentLyricsIndex;
    // smoothScrollTo(view_contaier, currentElement.offsetTop - mainElement.clientHeight / 2, 200);
    view_contaier.scrollTo({
      top: currentElement.offsetTop - mainElement.clientHeight / 2,
      behavior: "instant",
    });

    view_contaier.childNodes.forEach(function (val) {
      if (!val.dataset.id) return;
      val.classList.toggle("opacity-[50%]", parseInt(val.dataset.id) !== currentLyricsIndex);
      val.classList.toggle("text-3xl", parseInt(val.dataset.id) === currentLyricsIndex);
    });
  }
}
window.updateViewDisplay = updateViewDisplay;

function lrc_update() {
  const indexOfCurrentLyrics = findCurrentLyricsIndex(audioPlayer.currentTime);
  // console.log(indexOfCurrentLyrics);

  document.querySelectorAll(".lrc-tr-table").forEach(function (v) {
    const id = parseInt(v.dataset.id);
    const isCurrentTime = id === indexOfCurrentLyrics;
    v.classList.toggle("text-5", isCurrentTime);
    v.classList.toggle("dark:text-1", isCurrentTime);

    //
    const isSelectedBefore = id === +lastLyricsSetIndex.value;
    const timeElement = v.querySelector("td:first-child");
    timeElement.classList.toggle("border-r-4", isSelectedBefore);
  });
}

// get a file context?
function get_lrc() {
  const title = lrc_title.value;
  const artist = lrc_artist.value;
  const album = lrc_album.value;
  const author = lrc_author.value;
  const userName = lrc_userName.value;

  const arr_str = [];

  if (title) arr_str.push(`[ti:${title}]`);
  if (artist) arr_str.push(`[ar:${artist}]`);
  if (album) arr_str.push(`[al:${album}]`);
  if (author) arr_str.push(`[au:${author}]`);
  if (userName) arr_str.push(`[by:${userName}]`);
  arr_str.push(`[length:${timeFormat(audioPlayer.duration, true)}]`);
  arr_str.push(`[tool: .LRC MAKER by reazon ${window.location.href}]`);
  arr_str.push(`[ve:${app_version}]`);

  return `${arr_str.join("\n")}\n\n${window.lyrics.join("\n")}`;
}

// save btn handler
saveButton.addEventListener("click", function () {
  const get_lrc_contex = get_lrc();

  const blob = new Blob([get_lrc_contex], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = lrc_fileName.value.trim() + ".lrc";
  a.target = "_blank";
  a.click();
});

//   copy handler
copyButton.addEventListener("click", function () {
  const get_lrc_contex = get_lrc();

  copyButton.disabled = true;
  copyButton.style.opacity = 60;

  navigator.clipboard
    .writeText(get_lrc_contex)
    .then(() => {
      copyButton.style.opacity = 1;
      createPopup(getLangText("alert.copied"), getLangText("alert.copied.msg"));
    })
    .catch((err) => {
      copyButton.style.opacity = 1;
      console.error("Could not copy text: ", err);
      createPopup(getLangText("alert.copied.failed"), getLangText("alert.copied.failed.msg"));
    });
});

lrc_fileName.addEventListener("input", function () {
  this.dataset.temp = this.value;
});

function updateFileNameInput(id) {
  const title = lrc_title.value;
  const artist = lrc_artist.value;
  const fileName = artist && title ? `${artist} - ${title}` : file_name;

  switch (id) {
    case "filenamemode-audioname":
      lrc_fileName.value = file_name.value?.trim();
      lrc_fileName.disabled = true;
      break;
    case "filenamemode-title":
      lrc_fileName.value = fileName;
      lrc_fileName.disabled = true;
      break;
    case "filenamemode-custom":
      lrc_fileName.value = lrc_fileName.dataset.temp;
      lrc_fileName.disabled = false;
      break;
    default:
      // console.log(id);
      break;
  }
}
window.updateFileNameInput = updateFileNameInput;

// name file change
document.querySelectorAll(`input[name="FileNameMode"]`).forEach(function (v) {
  v.addEventListener("click", function () {
    if (!this.checked) return;
    updateFileNameInput(this.id);
  });
});

document.addEventListener("keydown", function (event) {
  if (mainElement.dataset.id === 0) return;
  const target = event.target;
  if (["input", "textarea", "button"].includes(target.tagName.toLowerCase())) return;
  // console.log(target.tagName);

  switch (event.key) {
    case " ":
      event.preventDefault();
      pnpButton.click();
      break;
    case "ArrowRight":
      audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
      break;
    case "ArrowLeft":
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
      break;
    case "Enter":
      setNextLyrics(event.shiftKey);
      // stopwatch.click();
      break;
    case "e":
      gotoPage(1);
      break;
    case "t":
      gotoPage(2);
      break;
    case "s":
      gotoPage(3);
      break;
    case "v":
      gotoPage(4);
      break;
  }
});
