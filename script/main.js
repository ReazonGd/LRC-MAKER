(function (ex) {
  const version = "1.2.4";
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
  const playbackSpeedOption = document.querySelector("#audio-playback");

  let lyrics = [];
  let file_name = "";
  let lastLyricsSetIndex = -1;
  const exportLRCfile = document.querySelector("#lrcFileInput");
  const exportLRCfileButton = document.querySelector(".lrc_export_button");

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

  const view_contaier = document.querySelector("#view-conteiner");
  const table = document.querySelector(".lrc_table_body");

  const jsmediatags = window.jsmediatags;

  // theme controler
  const themeButton = document.querySelector(".lrc-theme");
  themeButton.addEventListener("click", function () {
    const theme_now = document.body.dataset.mode;
    if (theme_now === "dark") document.body.dataset.mode = "light";
    else document.body.dataset.mode = "dark";

    localStorage.setItem("lrc-theme", document.body.dataset.mode);
  });

  exportLRCfileButton.addEventListener("click", function () {
    popup_loading.add("export_lrc_file");
    exportLRCfile.click();
  });
  exportLRCfile.addEventListener("change", function (event) {
    popup_loading.add("export_lrc_file");

    const file = event.target.files[0];
    if (file && (file.name.endsWith(".lrc") || file.name.endsWith(".txt"))) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        // console.log(content); // Log the content to the console

        let arr_lyrics = content.split("\n");
        arr_lyrics = arr_lyrics.filter((v) => v);

        lyrics = [];

        const getValAttr = (str) => str.split(":").slice(1).join(":");

        arr_lyrics.forEach((v, i) => {
          const att = getLrcAttribut(v);

          if (att.startsWith("ti:")) lrc_title.value = getValAttr(att);
          else if (att.startsWith("ar:")) lrc_artist.value = getValAttr(att);
          else if (att.startsWith("al:")) lrc_album.value = getValAttr(att);
          else if (att.startsWith("au:")) lrc_author.value = getValAttr(att);
          else if (att.startsWith("by:")) lrc_userName.value = getValAttr(att);
          else if (!isNaN(convertTimeStringToSecondsInt(att))) lyrics.push(v);
        });

        lrc_lyrics.value = lyrics.join("\n");
        popup_loading.remove("export_lrc_file");
      };
      reader.readAsText(file);
    } else {
      popup_loading.remove("export_lrc_file");

      createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("lrc-theme");
    if (savedTheme) document.body.dataset.mode = savedTheme;
  });

  // interval for updating highlight lyrics
  // TODO: make this better, its may cause some lag?
  const interval = setInterval(function () {
    if (!(lyrics.length && lyrics.length > 0 && audioPlayer.src && !audioPlayer.paused)) return;
    if (mainElement.dataset.id == "2") lrc_update();
    else if (mainElement.dataset.id == "4") updateViewDisplay();
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
    } else createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
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
    } else createPopup(getLangText("alert.common.title"), getLangText("alert.file_type.not_suport"));
  });

  //  TODO: make a better preload audio.
  function loadAudio(file) {
    popup_loading.add("audio-preload");
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
    audioPlayer.preload = "auto";
    audioPlayer.load();
    audioPlayer.addEventListener(
      "canplaythrough",
      function () {
        audioPlayer.volume = 0;
        audioPlayer.play();
        audioPlayer.addEventListener(
          "timeupdate",
          function (event) {
            audioPlayer.pause();
            audioPlayer.volume = +volumeRange.value;
            gotoPage(1);
            document.querySelectorAll(`.lrc-name`).forEach(function (v) {
              v.innerHTML = file.name;
            });

            file_name = file.name.split(".");
            file_name.pop();
            file_name = file_name.join(".");

            if (document.querySelectorAll(`input[name="FileNameMode"][id="filenamemode-title"]`) || (lrc_artist.value && lrc_title.value)) {
              lrc_fileName.value = file_name;
            }

            lastLyricsSetIndex = -1;
            // console.log(audioPlayer.duration);
            document.querySelector(".endTime").innerHTML = timeFormat(audioPlayer.duration);
            timeRange.max = audioPlayer.duration;

            audioPlayer.currentTime = 0;

            loadedMetadata(file).then((result) => {
              if (result.tags.title) lrc_title.value = result.tags.title;
              if (result.tags.album) lrc_album.value = result.tags.album;
              if (result.tags.artist) lrc_artist.value = result.tags.artist;
              console.log(result);
              popup_loading.remove("audio-preload");
            });
          },
          { once: true }
        );
      },
      { once: true }
    );
  }

  function loadedMetadata(blob) {
    return new Promise((resolve, reject) => {
      jsmediatags.read(blob, {
        onSuccess: function (tag) {
          resolve(tag);
        },
        onError: function (error) {
          reject(error);
        },
      });
    });
  }

  // chage the selection page
  const gotoPage = function (pageIndex) {
    const pages = ["greeting", "property", "lyrics-editor", "save-page", "view-page"];

    pages.forEach((v, i) => {
      if (i === pageIndex) document.getElementById(v).style.display = "flex";
      else document.getElementById(v).style.display = "none";
    });
    mainElement.dataset.id = pageIndex;

    document.querySelectorAll(`.lrc-controler-mode`).forEach(function (v) {
      v.classList.toggle("hidden", pageIndex !== 2);
      v.classList.toggle("flex", pageIndex === 2);
    });

    const lrc_view_mode = document.querySelector(".lrc-view-mode");
    lrc_view_mode.classList.toggle("hidden", pageIndex !== 4);
    lrc_view_mode.classList.toggle("flex", pageIndex === 4);

    if (pageIndex === 2) {
      initLyrics();
      drawTable();
    } else if (pageIndex == 3) {
      document.querySelectorAll(`input[name="FileNameMode"]`).forEach(function (v) {
        if (!v.checked) return;
        updateFileNameInput(v.id);
      });
    } else if (pageIndex == 4) {
      renderViewLyrics();
      updateViewDisplay();
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
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 15);
  });

  // audio speed
  playbackSpeedOption.addEventListener("click", function (event) {
    const speedSelected = parseFloat(this.value);

    audioPlayer.playbackRate = speedSelected;
  });

  //  returning from mm:ss.xx string into int number
  function convertTimeStringToSecondsInt(timeString) {
    if (typeof timeString === "number") return timeString;
    if (!timeString.match(/\d{1,3}:\d{1,3}\.\d{1,3}/)) return NaN;
    const [minutes, rest] = timeString.split(":");
    const [seconds, milliseconds] = rest.split(".");
    return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 100;
  }

  // get timme format from lyrics
  function getLrcAttribut(str) {
    return str.substring(str.indexOf("[") + 1, str.indexOf("]")).trim();
  }

  // finding current lyics
  function findCurrentLyricsIndex(time) {
    let index = null;

    for (let i = 0; i < lyrics.length; i++) {
      const timeA = convertTimeStringToSecondsInt(getLrcAttribut(lyrics[i]));
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
    if (index > 1 && lyrics[index - 1] && convertTimeStringToSecondsInt(getLrcAttribut(lyrics[index - 1])) === 0) return;
    const formatedTime = timeFormat(time, true);
    const strTime = `[${formatedTime}]`;
    const str = lyrics[index].replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "");

    lyrics[index] = strTime + str;
    lrc_lyrics.value = lyrics.join("\n");

    lastLyricsSetIndex = index;
    document.querySelector(`.lrc-tr-table[data-id="${index}"] td:first-child`).innerHTML = formatedTime;
    document.querySelector(`.lrc-tr-table[data-id="${index}"]`).dataset.time = time;
    lrc_update();
    return formatedTime;
  }

  // set next lyrics time
  stopwatch.addEventListener("click", function () {
    if (lastLyricsSetIndex >= lyrics.length - 1) return;
    const currentTime = audioPlayer.currentTime;
    const offset = Number(offsetTime.value);

    setTimeLyrics(lastLyricsSetIndex + 1, Math.min(audioPlayer.duration, Math.max(0, currentTime + offset)));
  });

  function renderViewLyrics() {
    view_contaier.innerHTML = '<span class="block h-[30vh]"></span>';
    lyrics.forEach(function (lyric, id) {
      const str = lyric.replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "");

      const lyicsElement = document.createElement("h1");
      lyicsElement.classList.add("text-2xl", "text-5", "dark:text-white", "view-display-text", "opacity-[50%]", "lrc-lyrics-display-text");
      lyicsElement.dataset.id = id;
      lyicsElement.innerText = str;

      view_contaier.appendChild(lyicsElement);
    });
    view_contaier.innerHTML += '<span class="block h-[30vh]"></span>';
  }

  function updateViewDisplay() {
    const currentLyricsIndex = findCurrentLyricsIndex(audioPlayer.currentTime) || 0;
    const lastHightLighted = view_contaier.dataset.id;

    if (lastHightLighted !== currentLyricsIndex) {
      const currentElement = document.querySelector(`.lrc-lyrics-display-text[data-id='${currentLyricsIndex}']`);
      view_contaier.dataset.id = currentLyricsIndex;
      // smoothScrollTo(view_contaier, currentElement.offsetTop - mainElement.clientHeight / 2, 200);
      view_contaier.scrollTo({
        top: currentElement.offsetTop - mainElement.clientHeight / 2,
        behavior: "instant",
      });

      view_contaier.childNodes.forEach(function (val) {
        if (!val.dataset.id) return;
        val.classList.toggle("opacity-[50%]", parseInt(val.dataset.id) !== currentLyricsIndex);
      });
    }
  }

  // updating higlight lyrics
  function lrc_update() {
    const indexOfCurrentLyrics = findCurrentLyricsIndex(audioPlayer.currentTime);

    document.querySelectorAll(".lrc-tr-table").forEach(function (v) {
      const id = parseInt(v.dataset.id);
      const isCurrentTime = id === indexOfCurrentLyrics;
      v.classList.toggle("text-5", isCurrentTime);
      v.classList.toggle("dark:text-1", isCurrentTime);

      //
      const isSelectedBefore = id === lastLyricsSetIndex;
      const timeElement = v.querySelector("td:first-child");
      timeElement.classList.toggle("border-r-4", isSelectedBefore);
    });
  }

  // making tr > td * 2
  function create_trTable(id, time, text) {
    const tr = document.createElement("tr");
    tr.classList.add("dark:odd:bg-1/10", "dark:even:bg-3/10", "lrc-tr-table", "odd:bg-2/10", "even:bg-4/10");
    tr.dataset.id = id;
    tr.dataset.time = convertTimeStringToSecondsInt(time);

    const td1 = document.createElement("td");
    td1.classList.add("border", "border-slate-600", "p-2", "text-center", "cursor-pointer");
    td1.style.width = "120px";
    td1.innerHTML = time;
    td1.title = getLangText("editor.td.tittle");

    // set time click handler
    td1.onclick = function () {
      const currentTime = audioPlayer.currentTime;
      const offset = Number(offsetTime.value);

      setTimeLyrics(id, Math.min(audioPlayer.duration, Math.max(0, currentTime + offset)));
    };

    const td2 = document.createElement("td");
    td2.innerHTML = text;
    td2.classList.add("border", "border-slate-600", "p-2", "cursor-pointer");
    td2.addEventListener("click", function () {
      const lyicsTime = parseFloat(this.parentElement.dataset.time);

      // console.log(time, lyicsTime);
      audioPlayer.currentTime = lyicsTime;
    });

    tr.appendChild(td1);
    tr.appendChild(td2);
    return tr;
  }

  // render the lyrics table
  function drawTable() {
    if (lyrics.length < 1) {
      gotoPage(1);
      createPopup(getLangText("alert.common.title"), getLangText("alert.empty.lyrics"));
      return;
    }
    table.innerHTML = "";
    lyrics.forEach(function (v, i) {
      table.appendChild(create_trTable(i, getLrcAttribut(v), v.replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "")));
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

  //   copy handler
  copyButton.addEventListener("click", function () {
    const get_lrc_contex = get_lrc();

    copyButton.disabled = true;
    copyButton.style.opacity = 60;

    navigator.clipboard
      .writeText(get_lrc_contex)
      .then(() => {
        copyButton.style.opacity = 1;
        createPopup(getLangText("alert.copied"), getLangText("alert.copied.msg"));
      })
      .catch((err) => {
        copyButton.style.opacity = 1;
        console.error("Could not copy text: ", err);
        createPopup(getLangText("alert.copied.failed"), getLangText("alert.copied.failed.msg"));
      });
  });

  lrc_fileName.addEventListener("input", function () {
    this.dataset.temp = this.value;
  });

  function updateFileNameInput(id) {
    const title = lrc_title.value;
    const artist = lrc_artist.value;
    const fileName = artist && title ? `${artist} - ${title}` : file_name;

    switch (id) {
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
      default:
        // console.log(id);
        break;
    }
  }

  // name file change
  document.querySelectorAll(`input[name="FileNameMode"]`).forEach(function (v) {
    v.addEventListener("click", function () {
      if (!this.checked) return;
      updateFileNameInput(this.id);
    });
  });

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
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
        break;
      case "ArrowLeft":
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
        break;
      case "Enter":
        stopwatch.click();
        break;
      case "e":
        gotoPage(1);
        break;
      case "t":
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
});
