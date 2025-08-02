import { timeFormat } from "../util/timeAndString";
import { audioPlayer, forwardButton, playbackSpeedOption, pnpButton, rewindButton, timeRange, volumeRange } from "../variable";
import "./audio-file.controller";
import { audioEndHandler, audioPauseHandler, audioPlayHandler, forwardAudio, playAndPause, rewindAudio, setAudioSpeed } from "./audio.controller";

document.querySelectorAll(`input[type="range"][progress]`).forEach(function (v) {
  v.addEventListener("input", function () {
    this.parentElement.style = `--w: ${(this.value / this.max) * 100}%`;
  });
});

volumeRange.addEventListener("input", function () {
  audioPlayer.volume = +this.value;
});

// update the time slider
audioPlayer.addEventListener("timeupdate", function () {
  if (isNaN(audioPlayer.currentTime)) return;
  timeRange.value = audioPlayer.currentTime;
  timeRange.parentElement.style = `--w: ${(timeRange.value / timeRange.max) * 100}%`;

  document.querySelector(".currentTime").innerHTML = timeFormat(audioPlayer.currentTime, true);
});

timeRange.addEventListener("input", function () {
  audioPlayer.currentTime = this.value;
});

pnpButton.addEventListener("click", playAndPause);
audioPlayer.addEventListener("ended", audioEndHandler);
audioPlayer.addEventListener("pause", audioPauseHandler);
audioPlayer.addEventListener("play", audioPlayHandler);
rewindButton.addEventListener("click", rewindAudio);
forwardButton.addEventListener("click", forwardAudio);
playbackSpeedOption.addEventListener("click", function (event) {
  const speedSelected = parseFloat(this.value);

  setAudioSpeed(speedSelected);
});
