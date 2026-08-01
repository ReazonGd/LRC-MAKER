import { forwardAudio, playAndPause, rewindAudio } from "../audio/audio.controller";
import { gotoPage } from "../util";
import { global, lastLyricsSetIndex, mainElement } from "../variable";
import { setNextLyrics } from "./editor.controller";

window.addEventListener("keydown", function (event) {
  const id = Number(mainElement.dataset.id);

  if (id  <= 0) return;
  const target = event.target;
  if (!target || ["input", "textarea", "button"].includes((target as any).tagName.toLowerCase())) return;
  // console.log(target.tagName);

  switch (event.key) {
    case " ":
      event.preventDefault();
      playAndPause();
      break;
    case "ArrowRight":
      forwardAudio(5);
      break;
    case "ArrowLeft":
      rewindAudio(5);
      break;
    case "Enter":
      setNextLyrics(event.shiftKey);
      break;
    case "f":
      gotoPage(1);
      break;
    case "e":
      gotoPage(2);
      break;
    case "s":
      gotoPage(3);
      break;
    case "v":
      gotoPage(4);
      break;
    case "p":
      if (id !== 2) return;
      lastLyricsSetIndex.value = Math.max(0, +lastLyricsSetIndex.value - 1).toString();
      break;
    case "n":
      if (id !== 2) return;
      lastLyricsSetIndex.value = Math.min(global.lyrics.length, +lastLyricsSetIndex.value + 1).toString();
      break;
  }
});
