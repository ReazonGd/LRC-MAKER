(function (ex) {
  const version = "1.1";
  try {
    ex(version);
  } catch (error) {
    console.log(error);
  }
})(function (app_version) {
  // drag n drop variable
  const fileInput = document.querySelector("#fileInput");
  const audioPlayer = document.querySelector("audio");
  const mainElement = document.querySelector("#main");
  const dragZone = document.querySelector("#greeting");

  // player Variable
  const pnpButton = document.querySelector("#p-n-p");
  const forwardButton = document.querySelector("#forward");
  const rewindButton = document.querySelector("#rewind");
  const volumeButton = document.querySelector(".lrc-volume");
  const timeRange = document.querySelector("#time-range");
  const volumeRange = document.querySelector("#volume-range");
  const offsetTime = document.querySelector("#offset");

  let lyrics = [];
  let file_name = "";
  let lastLyricsSetIndex = -1;

  // audio property
  const lrc_title = document.querySelector("#title");
  const lrc_artist = document.querySelector("#artist");
  const lrc_album = document.querySelector("#album");
  const lrc_author = document.querySelector("#author");
  const lrc_userName = document.querySelector("#username");
  const lrc_lyrics = document.querySelector("#lyrics");
  const lrc_fileName = document.querySelector("#fileName");

  const stopwatch = document.querySelector("#stopwatch");
  const saveButton = document.querySelector("#save");
  const copyButton = document.querySelector("#copy-file");

  const table = document.querySelector(".lrc_table_body");

  // theme controler
  const themeButton = document.querySelector(".lrc-theme");
  themeButton.addEventListener("click", function () {
    const theme_now = document.body.dataset.mode;
    if (theme_now === "dark") document.body.dataset.mode = "light";
    else document.body.dataset.mode = "dark";

    localStorage.setItem("lrc-theme", document.body.dataset.mode);
  });

  document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("lrc-theme");
    if (savedTheme) document.body.dataset.mode = savedTheme;
  });

  // interval for updating highlight lyrics
  const interval = setInterval(function () {
    if (!(lyrics.length && lyrics.length > 0 && audioPlayer.src && !audioPlayer.paused)) return;
    lrc_update();
  }, 100);

  // slide progress handler
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
    if (file && file.type.startsWith("audio/")) {
      loadAudio(file);
    } else alert(getLanguageContext("alert.file_type.not_suport"));
  });

  // file click handler
  document.querySelectorAll(`.lrc-select-file`).forEach(function (v) {
    v.addEventListener("click", function () {
      fileInput.click();
    });
  });
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      loadAudio(file);
    } else alert(getLanguageContext("alert.file_type.not_suport"));
  });

  //  TODO: make a preload audio.
  function loadAudio(file) {
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
    audioPlayer.preload = "auto";
    audioPlayer.onloadeddata = function () {
      gotoPage(1);
      document.querySelectorAll(`.lrc-name`).forEach(function (v) {
        v.innerHTML = file.name;
      });

      file_name = file.name.split(".")[0];

      if (document.querySelectorAll(`input[name="FileNameMode"][id="filenamemode-title"]`) || (lrc_artist.value && lrc_title.value)) {
        lrc_fileName.value = file_name;
      }

      document.querySelector(".endTime").innerHTML = timeFormat(audioPlayer.duration);
      timeRange.max = audioPlayer.duration;
    };
    audioPlayer.load();
  }

  // chage the selection page
  const gotoPage = function (pageIndex) {
    const pages = ["greeting", "property", "lyrics-editor", "save-page"];

    pages.forEach((v, i) => {
      if (i === pageIndex) document.getElementById(v).style.display = "flex";
      else document.getElementById(v).style.display = "none";
    });

    document.querySelectorAll(`.lrc-controler-mode`).forEach(function (v) {
      if (pageIndex === 2) v.style.display = "flex";
      else v.style.display = "none";
    });

    if (pageIndex === 2) {
      initLyrics();
      drawTable(true);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // gotoPage btn handler
  document.querySelectorAll(`*[data-gotopage]`).forEach(function (v) {
    v.addEventListener("click", function () {
      gotoPage(Number(this.dataset.gotopage));
    });
  });

  // chage number into mm:ss.xx format
  function timeFormat(time, includes_milis) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    let milliseconds = (time % 60).toFixed(2).split(".")[1];
    if (milliseconds.length > 2) milliseconds = milliseconds.slice(0, 2);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${includes_milis ? `.${String(milliseconds).padStart(2, "0")}` : ""}`;
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

  // play & pause button handler
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
    const crnt = audioPlayer.currentTime + 15;
    if (crnt < audioPlayer.duration) audioPlayer.currentTime = crnt;
    else audioPlayer.currentTime = audioPlayer.duration;
  });

  //  returning from mm:ss.xx string into int number
  function convertTimeStringToSecondsInt(timeString) {
    const [minutes, rest] = timeString.split(":");
    const [seconds, milliseconds] = rest.split(".");
    return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 100;
  }

  // get timme format from lyrics
  function getTimeFormat(str) {
    return str.substring(str.indexOf("[") + 1, str.indexOf("]")).trim();
  }

  // finding current lyics
  function findCurrentLyricsIndex(time) {
    let index = null;

    for (let i = 0; i < lyrics.length; i++) {
      const timeA = convertTimeStringToSecondsInt(getTimeFormat(lyrics[i]));
      if (timeA <= time && !(timeA === 0 && i > 0)) index = i;
    }

    return index;
  }

  // adding time format to lyrics
  function initLyrics() {
    if (!lrc_lyrics.value) return;
    lyrics = lrc_lyrics.value.split("\n");

    lyrics = lyrics.map(function (str, i) {
      if (!/^\[\d{1,3}:\d{1,3}\.\d{1,3}\]/.test(str)) return "[00:00.00]" + str;
      return str;
    });
    lrc_lyrics.value = lyrics.join("\n");
  }

  // chage/set lyrics time
  function setTimeLyrics(index, time) {
    if (index > 1 && lyrics[index - 1] && convertTimeStringToSecondsInt(getTimeFormat(lyrics[index - 1])) === 0) return;
    const formatedTime = timeFormat(time, true);
    const strTime = `[${formatedTime}]`;
    const str = lyrics[index].replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "");

    lyrics[index] = strTime + str;
    lrc_lyrics.value = lyrics.join("\n");

    lastLyricsSetIndex = index;
    document.querySelector(`.lrc-tr-table[data-id="${index}"] td:first-child`).innerHTML = formatedTime;
    lrc_update();
    return formatedTime;
  }

  // set next lyrics time
  stopwatch.addEventListener("click", function () {
    if (lastLyricsSetIndex >= lyrics.length - 1) return;
    const currentTime = audioPlayer.currentTime;
    setTimeLyrics(lastLyricsSetIndex + 1, currentTime);
  });

  // updating higlight lyrics
  function lrc_update() {
    const indexOfCurrentLyrics = findCurrentLyricsIndex(audioPlayer.currentTime);

    document.querySelectorAll(".lrc-tr-table").forEach(function (v) {
      if (parseInt(v.dataset.id) === indexOfCurrentLyrics) {
        if (!v.classList.contains("text-5")) v.classList.add("text-5", "dark:text-1");
      } else v.classList.remove("text-5", "dark:text-1");

      //
      if (parseInt(v.dataset.id) === lastLyricsSetIndex) {
        if (!v.querySelector("td:first-child").classList.contains("border-r-4")) v.querySelector("td:first-child").classList.add("border-r-4");
      } else v.querySelector("td:first-child").classList.remove("border-r-4");
    });
  }

  // making tr > td * 2
  function create_trTable(id, time, text) {
    const tr = document.createElement("tr");
    tr.classList.add("dark:odd:bg-1/10", "dark:even:bg-3/10", "lrc-tr-table", "odd:bg-2/10", "even:bg-4/10");
    tr.dataset.id = id;

    const td1 = document.createElement("td");
    td1.classList.add("border", "border-slate-600", "p-2", "text-center");
    td1.style.width = "120px";
    td1.innerHTML = time;
    td1.title = getLanguageContext("editor.td.tittle");

    // set time click handler
    td1.onclick = function () {
      const currentTime = audioPlayer.currentTime;
      const offset = Number(offsetTime.value);

      setTimeLyrics(id, Math.max(0, currentTime + offset));
    };

    const td2 = document.createElement("td");
    td2.innerHTML = text;
    td2.classList.add("border", "border-slate-600", "p-2");

    tr.appendChild(td1);
    tr.appendChild(td2);
    return tr;
  }

  // render the lyrics table
  function drawTable() {
    if (lyrics.length < 1) {
      gotoPage(1);
      alert(getLanguageContext("alert.empty.lyrics"));
      return;
    }
    table.innerHTML = "";
    lyrics.forEach(function (v, i) {
      table.appendChild(create_trTable(i, getTimeFormat(v), v.replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "")));
    });
    lrc_update();
  }

  // get a file context?
  function get_lrc() {
    const title = lrc_title.value;
    const artist = lrc_artist.value;
    const album = lrc_album.value;
    const author = lrc_author.value;
    const userName = lrc_userName.value;

    const arr_str = [];

    if (title) arr_str.push(`[ti:${title}]`);
    if (artist) arr_str.push(`[ar:${artist}]`);
    if (album) arr_str.push(`[al:${album}]`);
    if (author) arr_str.push(`[au:${author}]`);
    if (userName) arr_str.push(`[by:${userName}]`);
    arr_str.push(`[length:${timeFormat(audioPlayer.duration, true)}]`);
    arr_str.push(`[tool: .LRC MAKER by reazon ${window.location.href}]`);
    arr_str.push(`[ve:${app_version}]`);

    return `${arr_str.join("\n")}\n\n${lyrics.join("\n")}`;
  }

  // save btn handler
  saveButton.addEventListener("click", function () {
    const get_lrc_contex = get_lrc();

    const blob = new Blob([get_lrc_contex], { type: "text/plain" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = lrc_fileName.value + ".lrc";
    a.target = "_blank";
    a.click();
  });

  copyButton.addEventListener("click", function () {
    const get_lrc_contex = get_lrc();

    copyButton.disabled = true;
    copyButton.style.opacity = 60;

    navigator.clipboard
      .writeText(get_lrc_contex)
      .then(() => {
        copyButton.style.opacity = 1;
      })
      .catch((err) => {
        copyButton.style.opacity = 1;
        console.error("Could not copy text: ", err);
      });
  });

  lrc_fileName.addEventListener("input", function () {
    this.dataset.temp = this.value;
  });
  // name file change
  document.querySelectorAll(`input[name="FileNameMode"]`).forEach(function (v) {
    v.addEventListener("click", function () {
      if (!this.checked) return;
      const title = lrc_title.value;
      const artist = lrc_artist.value;
      const fileName = artist && title ? `${artist} - ${title}` : file_name;

      switch (this.id) {
        case "filenamemode-audioname":
          lrc_fileName.value = file_name;
          lrc_fileName.disabled = true;
          break;
        case "filenamemode-title":
          lrc_fileName.value = fileName;
          lrc_fileName.disabled = true;
          break;
        case "filenamemode-custom":
          lrc_fileName.value = lrc_fileName.dataset.temp;
          lrc_fileName.disabled = false;
          break;
      }
    });
  });
});
