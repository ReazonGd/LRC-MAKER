import { filterLyrics } from "../editor/lrc-file.controller";
import {
  blobToArrayBuffer,
  createPopup,
  getLangText,
  getRealMime,
  gotoPage,
  popup_loading,
  processWithLoading,
} from "../util";
import { timeFormat } from "../util/timeAndString";
import {
  audioPlayer,
  coverFileInput,
  dragZone,
  fileInput,
  file_name,
  global,
  lastLyricsSetIndex,
  lrc_album,
  lrc_artist,
  lrc_cover,
  lrc_fileName,
  lrc_title,
  lrc_userName,
  timeRange,
  volumeRange,
} from "../variable";
import { parseBlob, parseFile } from "music-metadata";
import { ffmpeg } from "../util/ffmpeg";

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

coverFileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!(file && file.type.startsWith("image/")))
    return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));

  popup_loading.add("change-cover");
  const url = URL.createObjectURL(file);
  lrc_cover.src = url;

  global.picture_buff = await blobToArrayBuffer(file); //.from(file.arrayBuffer());

  popup_loading.remove("change-cover");
});

//  TODO: make a better preload audio.
async function chageAudioHandler(file) {
  if (!file) return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));

  const mime = await getRealMime(file);
  let url = URL.createObjectURL(file);

  console.log(mime);
  if (mime == "audio/mpeg") {
    url = URL.createObjectURL(file);
    global.audio_buff = await blobToArrayBuffer(file);
  } else if (mime.startsWith("MP4 container")) {
    const buffer = await blobToArrayBuffer(file);
    global.audio_buff = await convertM4AtoMP3(buffer);

    console.log(global.audio_buff);
  } else return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));

  popup_loading.add("audio-preload");
  audioPlayer.src = url;
  audioPlayer.preload = "auto";
  audioPlayer.load();
  audioPlayer.addEventListener(
    "canplaythrough",
    () => {
      handleAudioCanPlayThrough(file);
    },
    { once: true },
  );

  audioPlayer.onerror = (e) => {
    console.error(e);
    popup_loading.remove("audio-preload");
  };
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
      if (
        document.querySelectorAll(`input[name="FileNameMode"][id="filenamemode-title"]`) ||
        (lrc_artist.value && lrc_title.value)
      ) {
        lrc_fileName.value = file_name.value;
      }
      lastLyricsSetIndex.value = -1;
      document.querySelector(".endTime").innerHTML = timeFormat(audioPlayer.duration);
      timeRange.max = audioPlayer.duration;
      audioPlayer.currentTime = 0;

      getAudioMetadata(file).then(async (result) => {
        lrc_title.value = result.common.title ?? "";
        lrc_album.value = result.common.album ?? "";
        lrc_artist.value = (result.common.artists || []).join(", ");
        lrc_userName.value = result.common.lyricist ?? "";
        console.log(result);

        // extract cover
        if (result.common.picture && result.common.picture.length && result.common.picture[0].data) {
          const cover_blob = new Blob([new Uint8Array(result.common.picture[0].data)]);
          const blob_url = URL.createObjectURL(cover_blob);
          lrc_cover.src = blob_url;
          global.picture_buff = cover_blob.arrayBuffer();
        }

        if (result.common.lyrics && result.common.lyrics.length) {
          if (result.common.lyrics[0].syncText) {
            filterLyrics(
              result.common.lyrics[0].syncText
                .map((v) => `[${timeFormat(v.timestamp / 1000, true)}] ${v.text}`)
                .join("\n"),
            );
          } else if (result.common.lyrics[0].text) {
            filterLyrics(result.common.lyrics[0].text);
          }
        } else {
          filterLyrics("");
        }
        popup_loading.remove("audio-preload");
      });
    },
    { once: true },
  );
}
0;

async function getAudioMetadata(blob) {
  try {
    const metadata = await parseBlob(blob);
    return metadata;
  } catch (error) {
    console.error(error);
  }
  // return new Promise( async (resolve, reject) => {
  //   // jsmediatags.read(blob, {
  //   //   onSuccess: resolve,
  //   //   onError: reject,
  //   // });

  // });
}

/**
 *
 * @param {Buffer} file
 * @returns {Buffer}
 */
async function convertM4AtoMP3(file) {
  return await processWithLoading(async () => {
    await ffmpeg.writeFile("input.mp4", new Uint8Array(file));
    console.log("Dsa");

    await ffmpeg.exec(["-i", "input.mp4", "-q:a", "0", "-map", "a", "output.mp3"]);

    const mp3Data = await ffmpeg.readFile("output.mp3");

    await ffmpeg.deleteFile("output.mp3");

    return mp3Data;
  }, "ffmpeg-converter");
}
