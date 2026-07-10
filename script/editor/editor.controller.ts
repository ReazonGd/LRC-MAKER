import {
  convertTimeStringToSecondsInt,
  findCurrentLyricsIndex,
  getLrcAttribut,
  timeFormat,
} from "../util/timeAndString";
import {
  audioPlayer,
  global,
  lastLyricsSetIndex,
  lrc_lyrics,
  mainElement,
  offsetTime,
  stopwatch,
  view_contaier,
} from "../variable";

function setTimeLyrics(index: number, time: number) {
  if (
    index > 1 &&
    global.lyrics[index - 1] &&
    convertTimeStringToSecondsInt(getLrcAttribut(global.lyrics[index - 1])) === 0
  )
    return;
  const formatedTime = timeFormat(time, true);
  const strTime = `[${formatedTime}]`;
  const str = global.lyrics[index].replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "");

  global.lyrics[index] = strTime + str;
  lrc_lyrics.value = global.lyrics.join("\n");

  lastLyricsSetIndex.value = `${index}`;
  const need_update_element = document.querySelector(`.lrc-tr-table[data-id="${index}"] td:first-child`);
  if (need_update_element) need_update_element.innerHTML = formatedTime;

  const curentElement = document.querySelector<HTMLElement>(`.lrc-tr-table[data-id="${index}"]`);
  if (curentElement) {
    curentElement.dataset.time = `${time}`;
    curentElement.scrollIntoView({
      // top: currentElement.offsetTop - mainElement.clientHeight / 2,
      // behavior: "instant",
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }
  editor_highlight_update();
  return formatedTime;
}

const setNextLyrics = (notNext?: boolean) => {
  if (+lastLyricsSetIndex.value >= global.lyrics.length - 1) return;
  const currentTime = audioPlayer.currentTime;
  const offset = Number(offsetTime.value);

  const resultTime = Math.min(audioPlayer.duration, Math.max(0, currentTime + offset));
  if (notNext) setTimeLyrics(+lastLyricsSetIndex.value, resultTime);
  else setTimeLyrics(+lastLyricsSetIndex.value + 1, resultTime);
};

function updateViewDisplay() {
  const currentLyricsIndex = findCurrentLyricsIndex(audioPlayer.currentTime) || 0;
  const lastHightLighted = Number(view_contaier.dataset.id);

  if (lastHightLighted !== currentLyricsIndex) {
    const currentElement = document.querySelector(`.lrc-lyrics-display-text[data-id='${currentLyricsIndex}']`);
    view_contaier.dataset.id = `${currentLyricsIndex}`;
    // smoothScrollTo(view_contaier, currentElement.offsetTop - mainElement.clientHeight / 2, 200);
    if (!currentElement) return;
    currentElement.scrollIntoView({
      // top: currentElement.offsetTop - mainElement.clientHeight / 2,
      // behavior: "instant",
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    view_contaier.childNodes.forEach(function (el) {
      const val = el as HTMLElement;
      if (!val.dataset.id) return;

      // higligth
      val.classList.toggle("blur-sm", parseInt(val.dataset.id) < currentLyricsIndex);
      val.classList.toggle("opacity-[50%]", parseInt(val.dataset.id) !== currentLyricsIndex);
      val.classList.toggle("text-2xl", parseInt(val.dataset.id) == currentLyricsIndex);
      val.classList.toggle("text-xl", parseInt(val.dataset.id) !== currentLyricsIndex);
    });
  }
}

function editor_highlight_update() {
  const indexOfCurrentLyrics = findCurrentLyricsIndex(audioPlayer.currentTime);
  // console.log(indexOfCurrentLyrics);

  document.querySelectorAll<HTMLElement>(".lrc-tr-table").forEach(function (v) {
    const id = parseInt(v.dataset.id ?? "");
    const isCurrentTime = id === indexOfCurrentLyrics;

    for (const className of ["text-white", "bg-6", "dark:bg-1"]) {
      v.classList.toggle(className, isCurrentTime);
    }
    for (const className of ["dark:odd:bg-1/10", "dark:even:bg-3/10", "odd:bg-2/10", "even:bg-4/10"]) {
      v.classList.toggle(className, !isCurrentTime);
    }

    //
    const isSelectedBefore = id === +lastLyricsSetIndex.value;
    const timeElement = v.querySelector("td:first-child")!;
    timeElement.classList.toggle("border-r-4", isSelectedBefore);
  });
}

export { editor_highlight_update, updateViewDisplay, setNextLyrics, setTimeLyrics };
