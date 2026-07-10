import {
  audioPlayer,
  file_name,
  global,
  lrc_artist,
  lrc_fileName,
  lrc_title,
  lrcDisplayContainer,
  mainElement,
  stopwatch,
} from "../variable";
import { editor_highlight_update, setNextLyrics, updateViewDisplay } from "./editor.controller";
import "./lrc-file.controller";
import "./shortcut.controller";

const interval = setInterval(function () {
  if (!(global.lyrics.length && global.lyrics.length > 0 && audioPlayer.src && !audioPlayer.paused)) return;
  if (mainElement.dataset.id == "2") editor_highlight_update();

  //  if (mainElement.dataset.id == "4") updateViewDisplay();
  if (window.innerWidth > 768 || !!lrcDisplayContainer.style.left) updateViewDisplay();
}, 100);

stopwatch.addEventListener("click", function () {
  setNextLyrics();
});

export function updateFileNameInput(id: string) {
  const title = lrc_title.value;
  const artist = lrc_artist.value;
  const fileName = artist && title ? `${artist} - ${title}` : file_name.value;

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
      lrc_fileName.value = lrc_fileName.dataset.temp ?? "";
      lrc_fileName.disabled = false;
      break;
    default:
      // console.log(id);
      break;
  }
}

// name file change
document.querySelectorAll<HTMLInputElement>(`input[name="FileNameMode"]`).forEach(function (v) {
  v.addEventListener("click", function () {
    if (!this.checked) return;
    updateFileNameInput(this.id);
  });
});
