import { updateViewDisplay } from "../editor/editor.controller";
import { updateFileNameInput } from "../editor/main";
import { global, languageListBox, lrc_lyrics, mainElement, popup_container, table, view_contaier } from "../variable";
import { create_trTable, getLrcAttribut } from "./timeAndString";

export function createPopup(title: string, innerHTML: string) {
  const modal = document.createElement("div");
  modal.classList.add(
    "max-w-80",
    "fixed",
    "top-1/2",
    "left-1/2",
    "-translate-y-1/2",
    "-translate-x-1/2",
    "w-full",
    "z-[99]",
    "rounded-lg",
    "bg-white",
    "dark:bg-5",
    "rounded-lg",
    "p-5",
  );

  const h1 = document.createElement("h1");
  h1.classList.add("text-lg", "w-full", "text-center");
  h1.innerHTML = title;

  const p = document.createElement("p");
  p.innerHTML = innerHTML;

  const button = document.createElement("button")!;
  button.classList.add("bg-4", "dark:bg-1", "rounded-md", "px-5", "px-2", "mt-2", "text-white");
  button.innerHTML = getLangText("button.ok");

  button.addEventListener("click", function () {
    popup_container.removeChild(modal);

    popup_container.classList.toggle("hidden", popup_container.childNodes.length < 1);
  });

  modal.appendChild(h1);
  modal.appendChild(p);
  modal.appendChild(button);
  popup_container.appendChild(modal);

  popup_container.classList.toggle("hidden", false);
}

export const popup_loading = {
  element: document.querySelector("#popup-loading")!,
  aset: ["/asset-image/aset1.gif", "/asset-image/aset2.gif"],
  modal: (
    id: string,
    img_src: string,
  ) => `<div data-loadname="${id}" class="max-w-80 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-[99] rounded-lg bg-white dark:bg-5 rounded-lg p-5 flex flex-col items-center">
        <img src="${img_src}" class="w-40 h-40" alt="loading" />
        <br />
        <p>Processing ${id}....</p>
      </div>`,
  // queue: [],
  add: function (initial: string) {
    if (this.element.querySelector(`[data-loadname="${initial}"]`)) return;

    this.element.classList.toggle("hidden", false);
    this.element.innerHTML += this.modal(initial, this.aset[Math.random() >= 0.5 ? 0 : 1]);
  },
  remove: function (initial: string) {
    this.element.querySelectorAll(`[data-loadname="${initial}"]`).forEach((v) => v.parentElement!.removeChild(v));

    if (!this.element.children.length) this.element.classList.toggle("hidden", true);
  },
};

export const gotoPage = function (pageIndex: number) {
  const pages = ["greeting", "property", "lyrics-editor", "save-page", "view-page"];

  pages.forEach((v, i) => {
    if (i === pageIndex) document.getElementById(v)!.style.display = "flex";
    else document.getElementById(v)!.style.display = "none";
  });
  mainElement.dataset.id = `${pageIndex}`;

  document.querySelectorAll(`.lrc-controler-mode`).forEach(function (v) {
    v.classList.toggle("hidden", pageIndex !== 2);
    v.classList.toggle("flex", pageIndex === 2);
  });

  const lrc_view_quick_action = document.querySelector(".lrc-view-quick-action")!;
  lrc_view_quick_action.classList.toggle("hidden", pageIndex !== 4);
  lrc_view_quick_action.classList.toggle("flex", pageIndex === 4);

  const lrc_form_quick_action = document.querySelector(".lrc-form-quick-action")!;
  lrc_form_quick_action.classList.toggle("hidden", pageIndex !== 1);
  lrc_form_quick_action.classList.toggle("flex", pageIndex === 1);

  if (pageIndex === 2) {
    initLyrics();
    drawTable();
    renderViewLyrics();
    updateViewDisplay(); //
  } else if (pageIndex == 3) {
    document.querySelectorAll<HTMLInputElement>(`input[name="FileNameMode"]`).forEach(function (v) {
      if (!v.checked) return;
      updateFileNameInput(v.id); //
    });
  } else if (pageIndex == 4) {
    // renderViewLyrics();
    // updateViewDisplay(); //
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export function initLyrics() {
  if (!lrc_lyrics.value) return;
  global.lyrics = global.lyrics.map(function (str, i) {
    if (!/^\[\d{1,3}:\d{1,3}\.\d{1,3}\]/.test(str)) return "[00:00.00]" + str;
    return str;
  });
  lrc_lyrics.value = global.lyrics.join("\n");
}

function renderViewLyrics() {
  view_contaier.innerHTML = '<span class="block h-[30vh]"></span>';
  // const lyrics = lrc_lyrics.value.split("\n");
  global.lyrics.forEach(function (lyric, id) {
    const str = lyric.replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "");

    const lyicsElement = document.createElement("h1");
    lyicsElement.classList.add(
      "text-2xl",
      "text-5",
      "dark:text-white",
      "view-display-text",
      "opacity-[50%]",
      "lrc-lyrics-display-text",
      "transition",
    );
    (lyicsElement as HTMLElement).dataset.id = `${id}`;
    lyicsElement.innerText = str;

    view_contaier.appendChild(lyicsElement);
  });
  view_contaier.innerHTML += '<span class="block h-[30vh]"></span>';
}

// render the lyrics table
function drawTable() {
  // const lyrics = lrc_lyrics.value.split("\n");
  if (global.lyrics.length < 1) {
    gotoPage(1);
    createPopup(getLangText("alert.common.title"), getLangText("alert.empty.lyrics"));
    return;
  }
  table.innerHTML = "";
  global.lyrics.forEach(function (v, i) {
    table.appendChild(create_trTable(i, getLrcAttribut(v), v.replace(/\[\d{1,3}:\d{1,3}\.\d{1,3}\]/, "")));
  });
  // editor_highlight_update();
}

export function getLangText(key: string): string {
  if (Object.keys(global.language_module).length < 1) {
    return key
  };
  if (!global.language_module[key]) {
    console.warn(`${key} is not defined in your language.`)
    return key;

  }
  return global.language_module[key];
}

export function blobToArrayBuffer(blob: Blob) {
  return new Promise<ArrayBuffer | null>((rs, rj) => {
    const reader = new FileReader();
    reader.onload = function () {
      const arrayBuffer = reader.result;
      // go next
      if (arrayBuffer instanceof ArrayBuffer) rs(arrayBuffer);
      else rs(null);
    };
    reader.onerror = function () {
      // handle error
      console.error("Reader error", reader.error);
      rj();
    };
    reader.readAsArrayBuffer(blob);
  });
}

export async function getRealMime(file: Blob) {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (hex.startsWith("494433") || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) {
    return "audio/mpeg"; // ID3... atau FF FB/FF FA/FF F3
  }
  if (hex.slice(8, 16) === "66747970") {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    return `MP4 container (brand: ${brand})`; // ftyp → mp4/m4a/dash
  }
  if (hex.startsWith("664c6143")) return "audio/flac"; // fLaC
  if (hex.startsWith("4f676753")) return "audio/ogg"; // OggS
  if (hex.startsWith("52494646")) return "audio/wav"; // RIFF

  return "unknown";
}

export async function processWithLoading<T>(cb: () => T, loading_name: string): Promise<T | null> {
  popup_loading.add(loading_name);

  let result = null;
  try {
    result = await cb();
  } catch (err) {
    console.error(err);
  } finally {
    popup_loading.remove(loading_name);
  }

  return result;
}
