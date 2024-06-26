import { createPopup, getLangText, gotoPage, popup_loading } from "./util";
import { timeFormat } from "./util/timeAndString";
import { audioPlayer, dragZone, fileInput, file_name, forwardButton, lastLyricsSetIndex, lrc_album, lrc_artist, lrc_fileName, lrc_title, playbackSpeedOption, pnpButton, rewindButton, timeRange, volumeRange } from "./variable";

const jsmediatags = window.jsmediatags;

document.querySelectorAll(`input[type="range"][progress]`).forEach(function (v) {
  v.addEventListener("input", function () {
    this.parentElement.style = `--w: ${(this.value / this.max) * 100}%`;
  });
});

// drag n drop and file select feature
dragZone.addEventListener("dragover", function (event) {
  event.preventDefault();
  this.classList.add("bg-1/50");
});

dragZone.addEventListener("dragleave", function (event) {
  event.preventDefault();
  this.classList.remove("bg-1/50");
});
dragZone.addEventListener("drop", function (event) {
  event.preventDefault();
  this.classList.remove("bg-1/50");

  const file = event.dataTransfer.files[0];
  chageAudioHandler(file);
});

// file click handler
document.querySelectorAll(`.lrc-select-file`).forEach(function (v) {
  v.addEventListener("click", function () {
    fileInput.click();
  });
});
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  chageAudioHandler(file);
});

//  TODO: make a better preload audio.
function chageAudioHandler(file) {
  if (!(file && file.type.startsWith("audio/"))) return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
  popup_loading.add("audio-preload");
  const url = URL.createObjectURL(file);
  audioPlayer.src = url;
  audioPlayer.preload = "auto";
  audioPlayer.load();
  audioPlayer.addEventListener(
    "canplaythrough",
    () => {
      handleAudioCanPlayThrough(file);
    },
    { once: true }
  );
}

function handleAudioCanPlayThrough(file) {
  audioPlayer.volume = 0;
  audioPlayer.play();
  audioPlayer.addEventListener(
    "timeupdate",
    () => {
      audioPlayer.pause();
      audioPlayer.volume = +volumeRange.value;
      gotoPage(1);
      document.querySelectorAll(`.lrc-name`).forEach((v) => (v.innerHTML = file.name));
      file_name.value = file.name.split(".").slice(0, -1).join(".");
      if (document.querySelectorAll(`input[name="FileNameMode"][id="filenamemode-title"]`) || (lrc_artist.value && lrc_title.value)) {
        lrc_fileName.value = file_name.value;
      }
      lastLyricsSetIndex.value = -1;
      document.querySelector(".endTime").innerHTML = timeFormat(audioPlayer.duration);
      timeRange.max = audioPlayer.duration;
      audioPlayer.currentTime = 0;
      loadMetadata(file).then((result) => {
        if (result.tags.title) lrc_title.value = result.tags.title;
        if (result.tags.album) lrc_album.value = result.tags.album;
        if (result.tags.artist) lrc_artist.value = result.tags.artist;
        popup_loading.remove("audio-preload");
      });
    },
    { once: true }
  );
}

function loadMetadata(blob) {
  return new Promise((resolve, reject) => {
    jsmediatags.read(blob, {
      onSuccess: resolve,
      onError: reject,
    });
  });
}

// play & Pause
function playAndPause() {
  if (!audioPlayer.src) return;
  if (audioPlayer.paused) {
    if (audioPlayer.currentTime >= audioPlayer.duration) audioPlayer.currentTime = 0;
    audioPlayer.play();
    return;
  }
  audioPlayer.pause();
  return;
}

pnpButton.addEventListener("click", playAndPause);
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

// when audio endend
audioPlayer.addEventListener("ended", function () {
  if (!audioPlayer.paused) playAndPause(); // its effected?
  pnpButton.querySelector(".pause").classList.add("hidden");
  pnpButton.querySelector(".play").classList.remove("hidden");
});

// play & pause handler
audioPlayer.addEventListener("pause", function () {
  pnpButton.querySelector(".pause").classList.add("hidden");
  pnpButton.querySelector(".play").classList.remove("hidden");
});
audioPlayer.addEventListener("play", function () {
  pnpButton.querySelector(".play").classList.add("hidden");
  pnpButton.querySelector(".pause").classList.remove("hidden");
});

// volume handler
timeRange.addEventListener("input", function () {
  audioPlayer.currentTime = this.value;
});

// rewind handler
rewindButton.addEventListener("click", function () {
  audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 15);
});

// forward handler
forwardButton.addEventListener("click", function () {
  audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 15);
});

// audio speed
playbackSpeedOption.addEventListener("click", function (event) {
  const speedSelected = parseFloat(this.value);

  audioPlayer.playbackRate = speedSelected;
});
