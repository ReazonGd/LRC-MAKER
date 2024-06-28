import { forwardAudio, playAndPause, rewindAudio } from "../audio/audio.controller";
import { gotoPage } from "../util";
import { mainElement } from "../variable";
import { setNextLyrics } from "./editor.controller";

document.addEventListener("keydown", function (event) {
  if (mainElement.dataset.id === 0) return;
  const target = event.target;
  if (["input", "textarea", "button"].includes(target.tagName.toLowerCase())) return;
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
  }
});
