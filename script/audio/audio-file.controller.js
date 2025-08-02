import { createPopup, getLangText, gotoPage, popup_loading } from "../util";
import { timeFormat } from "../util/timeAndString";
import { audioPlayer, dragZone, fileInput, file_name, lastLyricsSetIndex, lrc_album, lrc_artist, lrc_fileName, lrc_title, timeRange, volumeRange } from "../variable";

const jsmediatags = window.jsmediatags;

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
      getAudioMetadata(file).then((result) => {
        if (result.tags.title) lrc_title.value = result.tags.title;
        if (result.tags.album) lrc_album.value = result.tags.album;
        if (result.tags.artist) lrc_artist.value = result.tags.artist;
        popup_loading.remove("audio-preload");
      });
    },
    { once: true }
  );
}

function getAudioMetadata(blob) {
  return new Promise((resolve, reject) => {
    jsmediatags.read(blob, {
      onSuccess: resolve,
      onError: reject,
    });
  });
}
