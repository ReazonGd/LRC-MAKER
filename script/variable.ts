export const app_version = "1.2.5";
export const fileInput = document.querySelector<HTMLInputElement>("#fileInput")!;
export const coverFileInput = document.querySelector("#coverFileInput")!;
export const audioPlayer = document.querySelector("audio")!;
export const dragZone = document.querySelector("#greeting")!;
export const mainElement = document.querySelector<HTMLElement>("#main")!;
export const pnpButton = document.querySelector("#p-n-p")!;
export const forwardButton = document.querySelector<HTMLButtonElement>("#forward")!;
export const rewindButton = document.querySelector<HTMLButtonElement>("#rewind")!;
export const volumeButton = document.querySelector(".lrc-volume")!;
export const timeRange = document.querySelector<HTMLInputElement>("#time-range")!;
export const volumeRange = document.querySelector<HTMLInputElement>("#volume-range")!;
export const offsetTime = document.querySelector<HTMLInputElement>("#offset")!;
export const playbackSpeedOption = document.querySelector<HTMLInputElement>("#audio-playback")!;
export const exportLRCfile = document.querySelector<HTMLElement>("#lrcFileInput")!;
export const exportLRCfileButton = document.querySelector(".lrc_export_button")!;
export const lrc_title = document.querySelector<HTMLInputElement>("#title")!;
export const lrc_cover = document.querySelector<HTMLInputElement>(".lrc-cover")!;
export const lrc_artist = document.querySelector<HTMLInputElement>("#artist")!;
export const lrc_album = document.querySelector<HTMLInputElement>("#album")!;
export const lrc_year = document.querySelector<HTMLInputElement>("#year")!;
export const lrc_userName = document.querySelector<HTMLInputElement>("#username")!;
export const lrc_lyrics = document.querySelector<HTMLInputElement>("#lyrics")!;
export const lrc_fileName = document.querySelector<HTMLInputElement>("#fileName")!;
export const stopwatch = document.querySelector("#stopwatch")!;
export const saveButton = document.querySelector<HTMLButtonElement>("#save")!;
export const saveAudioButton = document.querySelector<HTMLButtonElement>("#save-audio")!;
export const copyButton = document.querySelector<HTMLButtonElement>("#copy-file")!;
export const view_contaier = document.querySelector<HTMLElement>("#view-conteiner")!;
export const table = document.querySelector(".lrc_table_body")!;
export const lastLyricsSetIndex = document.querySelector<HTMLInputElement>("#last-lyrics-set-index")!;
export const file_name = document.querySelector<HTMLInputElement>("#file_name")!;
export const changeLanguageButton = document.querySelector("#lang-btn")!;
export const languageListBox = document.querySelector<HTMLElement>("#lang-list")!;
export const lrcDisplayContainer = document.querySelector<HTMLElement>(".viewLRC")!;
export const enableView = document.querySelector(".enable-view")!;
export const themeButton = document.querySelector(".lrc-theme")!;
export const popup_container = document.querySelector("#popup-container")!;

interface GLobalValue {
  audio_buff: ArrayBufferLike | null;
  picture_buff: ArrayBuffer | null;
  lyrics: string[];
  language_module: { [key: string]: string };
}

export const global: GLobalValue = {
  audio_buff: null,
  picture_buff: null,
  lyrics: [],
  language_module: {},
};
