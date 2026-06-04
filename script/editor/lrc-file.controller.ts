import { ID3Writer } from "browser-id3-writer";
import { createPopup, getLangText, popup_loading } from "../util";
import { convertTimeStringToSecondsInt, getLrcAttribut, timeFormat } from "../util/timeAndString";
import {
  app_version,
  audioPlayer,
  copyButton,
  exportLRCfile,
  exportLRCfileButton,
  fileInput,
  global,
  lrc_album,
  lrc_artist,
  lrc_year,
  lrc_cover,
  lrc_fileName,
  lrc_lyrics,
  lrc_title,
  lrc_userName,
  saveAudioButton,
  saveButton,
} from "../variable";

//

exportLRCfileButton.addEventListener("click", function () {
  exportLRCfile.click();
});
exportLRCfileButton.addEventListener("drop", function (event) {
  event.preventDefault();

  const file = (event as DragEvent).dataTransfer!.files[0];
  lrcFileHandler(file);
});
exportLRCfileButton.addEventListener("dragover", function (event) {
  event.preventDefault();
});

exportLRCfileButton.addEventListener("dragleave", function (event) {
  event.preventDefault();
});

exportLRCfile.addEventListener("change", function (event) {
  const file = ((event.target as HTMLInputElement).files ?? [])[0];

  lrcFileHandler(file);
});

// lrc_lyrics.addEventListener("paste", function (event) {
//   event.preventDefault();
//   const clipboardPasteContent = event.clipboardData?.getData("text");

//   if (clipboardPasteContent) filterLyrics(clipboardPasteContent);
// });

lrc_lyrics.addEventListener("change", function (event) {
  event.preventDefault();
   filterLyrics(lrc_lyrics.value);
});

const lrcFileHandler = (file: File) => {
  if (!(file && (file.name.endsWith(".lrc") || file.name.endsWith(".txt")))) {
    createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
    return;
  }

  popup_loading.add("export_lrc_file");
  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target!.result;
    filterLyrics(content?.toString() || "");
    popup_loading.remove("export_lrc_file");
  };
  reader.readAsText(file);
};

export function filterLyrics(content: string) {
  let arr_lyrics = content.split("\n");
  arr_lyrics = arr_lyrics.filter((v) => v);
  arr_lyrics = arr_lyrics.map((v) => v.trim());

  global.lyrics = [];

  const getValAttr = (str: string) => str.split(":").slice(1).join(":");

  arr_lyrics.forEach((v) => {
    if (v.startsWith("[")) {
      const att = getLrcAttribut(v);

      if (att.startsWith("ti:")) lrc_title.value = getValAttr(att);
      else if (att.startsWith("ar:")) lrc_artist.value = getValAttr(att);
      else if (att.startsWith("al:")) lrc_album.value = getValAttr(att);
      else if (att.startsWith("by:")) lrc_userName.value = getValAttr(att);
      else if (!isNaN(convertTimeStringToSecondsInt(att))) global.lyrics.push(v);
    } else if (v.startsWith("#")) return;
    else global.lyrics.push(v);
  });

  lrc_lyrics.value = global.lyrics.join("\n");
}

function convertLyricsToLRCformat() {
  const title = lrc_title.value;
  const artist = lrc_artist.value;
  const album = lrc_album.value;
  const userName = lrc_userName.value;

  const arr_str = [];

  if (title) arr_str.push(`[ti:${title}]`);
  if (artist) arr_str.push(`[ar:${artist}]`);
  if (album) arr_str.push(`[al:${album}]`);
  if (userName) arr_str.push(`[by:${userName}]`);
  arr_str.push(`[length:${timeFormat(audioPlayer.duration, true)}]`);
  arr_str.push(`[tool: .LRC MAKER by reazon ${window.location.href}]`);
  arr_str.push(`[ve:${app_version}]`);

  return `${arr_str.join("\n")}\n\n${global.lyrics.join("\n")}`;
}

function lrcToSylt() {
  return global.lyrics.map((v) => [
    v.replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, ""),
    convertTimeStringToSecondsInt(getLrcAttribut(v)) * 1000,
  ]);
}

// save btn handler
saveButton.addEventListener("click", function () {
  const get_lrc_contex = convertLyricsToLRCformat();

  const blob = new Blob([get_lrc_contex], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = lrc_fileName.value.trim() + ".lrc";
  a.target = "_blank";
  a.click();
});

//   copy handler
copyButton.addEventListener("click", function () {
  const get_lrc_contex = convertLyricsToLRCformat();

  copyButton.disabled = true;
  copyButton.style.opacity = "0.4";

  navigator.clipboard
    .writeText(get_lrc_contex)
    .then(() => {
      copyButton.style.opacity = "1";
      createPopup(getLangText("alert.copied"), getLangText("alert.copied.msg"));
    })
    .catch((err) => {
      copyButton.style.opacity = "1";
      console.error("Could not copy text: ", err);
      createPopup(getLangText("alert.copied.failed"), getLangText("alert.copied.failed.msg"));
    });
});

lrc_fileName.addEventListener("input", function () {
  this.dataset.temp = this.value;
});

saveAudioButton.addEventListener("click", async function () {
  // console.log(global.audio_buff)
  if (!global.audio_buff) return;

  const writer = new ID3Writer(global.audio_buff);
  writer
    .setFrame("TIT2", lrc_title.value ?? "")
    .setFrame(
      "TPE1",
      (lrc_artist.value ?? "").split(",").map((v) => v.trim()),
    )
    .setFrame("TALB", lrc_album.value ?? "")
    .setFrame("TEXT", lrc_userName.value ?? "")
    .setFrame("USLT", {
      description: "edited with lrc-maker: https://lrc-maker.reazon.my.id/",
      lyrics: convertLyricsToLRCformat(),
      language: "eng",
    });
    
    (writer as any).setFrame("TYER", lrc_year.value);
  (writer as any).setFrame("SYLT", {
      type: 1,
      text: lrcToSylt(),
      timestampFormat: 2,
      language: "eng",
      description: "edited with lrc-maker: https://lrc-maker.reazon.my.id/",
    })

  if (lrc_cover.src && global.picture_buff) {
    writer.setFrame("APIC", {
      type: 3,
      description: "",
      data: global.picture_buff,
    });
  }
  writer.addTag();

  const a = document.createElement("a");
  a.href = writer.getURL();
  a.download = fileInput.value.split("\\").slice(-1).toString();
  a.target = "_blank";
  a.click();
});
