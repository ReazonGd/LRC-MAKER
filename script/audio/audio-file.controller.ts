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
  lrc_year,
  timeRange,
  volumeRange,
} from "../variable";
import { parseBlob, parseFile } from "music-metadata";
import { ffmpeg } from "../util/ffmpeg";

// drag n drop and file select feature
dragZone.addEventListener("dragover", function (event) {
  event.preventDefault();
  dragZone.classList.add("bg-1/50");
});

dragZone.addEventListener("dragleave", function (event) {
  event.preventDefault();
  dragZone.classList.remove("bg-1/50");
});
dragZone.addEventListener("drop", function (event) {
  event.preventDefault();
  dragZone.classList.remove("bg-1/50");

  const file = ((event as DragEvent).dataTransfer!.files || [])[0];
  changeAudioHandler(file);
});

// file click handler
document.querySelectorAll(`.lrc-select-file`).forEach(function (v) {
  v.addEventListener("click", function () {
    fileInput.click();
  });
});

fileInput.addEventListener("change", (event) => {
  const file = ((event.target as HTMLInputElement).files ?? [])[0];
  changeAudioHandler(file);
});

coverFileInput.addEventListener("change", async (event) => {
  const file = ((event.target as HTMLInputElement).files ?? [])[0];
  if (!(file && file.type.startsWith("image/")))
    return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));

  popup_loading.add("change-cover");
  const url = URL.createObjectURL(file);
  lrc_cover.src = url;

  global.picture_buff = await blobToArrayBuffer(file); //.from(file.arrayBuffer());

  popup_loading.remove("change-cover");
});

async function changeAudioHandler(file: File) {
  if (!file) return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));

  processWithLoading(async () => {
    const mime = await getRealMime(file);

    let audioBuffer: ArrayBufferLike | null;
    if (mime === "audio/mpeg") {
      audioBuffer = await blobToArrayBuffer(file);
    } else if (mime.startsWith("MP4 container")) {
      const buff = await blobToArrayBuffer(file);
      if (buff) audioBuffer = buff;
      else return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
      audioBuffer = await convertM4AtoMP3(buff);
    } else {
      return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
    }

    if (!audioBuffer) return createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));

    global.audio_buff = audioBuffer;

    const [url] = await Promise.all([
      Promise.resolve(URL.createObjectURL(new Blob([audioBuffer as ArrayBuffer], { type: "audio/mpeg" }))),
      loadMetadata(file), // extract metadata + update UI
    ]);

    await preloadAudio(url, file.name);
    popup_loading.remove("audio-preload");
    gotoPage(1);
  }, "load audio");
}

function preloadAudio(url: string, fileName: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    audioPlayer.src = url;
    audioPlayer.preload = "auto";
    audioPlayer.load();
    // audioPlayer.addEventListener("canplaythrough", () =>  { once: true });
    audioPlayer.addEventListener("error", reject, { once: true });

    audioPlayer.volume = 0;
    await audioPlayer.play();
    audioPlayer.addEventListener(
      "timeupdate",
      () => {
        audioPlayer.pause();
        audioPlayer.volume = +volumeRange.value;

        document.querySelectorAll(`.lrc-name`).forEach((v) => (v.innerHTML = fileName));
        file_name.value = fileName.split(".").slice(0, -1).join(".");
        if (
          document.querySelectorAll(`input[name="FileNameMode"][id="filenamemode-title"]`) ||
          (lrc_artist.value && lrc_title.value)
        ) {
          lrc_fileName.value = file_name.value;
        }
        lastLyricsSetIndex.value = "-1";
        document.querySelector(".endTime")!.innerHTML = timeFormat(audioPlayer.duration);
        timeRange.max = `${audioPlayer.duration}`;
        audioPlayer.currentTime = 0;
        resolve();
      },
      { once: true },
    );
  });
}

async function loadMetadata(file: File) {
  const result = await getAudioMetadata(file);

  lrc_title.value = result.common.title ?? "";
  lrc_album.value = result.common.album ?? "";
  lrc_year.value = `${result.common.year}`;
  lrc_artist.value = (result.common.artists || []).join(", ");
  lrc_userName.value = result.common.lyricist?.join(", ") ?? "";

  if (result.common.picture?.[0]?.data) {
    const blob = new Blob([new Uint8Array(result.common.picture[0].data)]);
    lrc_cover.src = URL.createObjectURL(blob);
    global.picture_buff = await blob.arrayBuffer();
  }

  if (result.common.lyrics?.[0]) {
    const lyric = result.common.lyrics[0];
    if (lyric.syncText) {
      filterLyrics(lyric.syncText.map((v) => `[${timeFormat(v.timestamp! / 1000, true)}] ${v.text}`).join("\n"));
    } else {
      filterLyrics(lyric.text ?? "");
    }
  } else {
    filterLyrics("");
  }
}

async function getAudioMetadata(blob: Blob) {
  const metadata = await parseBlob(blob);
  return metadata;
}

/**
 *
 * @param {Buffer} file
 * @returns {Buffer}
 */
async function convertM4AtoMP3(file: ArrayBuffer) {
  return await processWithLoading(async () => {
    if (!ffmpeg.isLoaded) await ffmpeg.start_load();

    await ffmpeg.writeFile("input.mp4", new Uint8Array(file));
    console.log("Dsa");

    await ffmpeg.exec(["-i", "input.mp4", "-q:a", "0", "-map", "a", "output.mp3"]);

    const mp3Data = await ffmpeg.readFile("output.mp3");

    await ffmpeg.deleteFile("output.mp3");

    return (mp3Data as Uint8Array<ArrayBufferLike>).buffer;
  }, "ffmpeg-converter");
}
