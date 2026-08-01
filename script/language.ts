import { getLangText, popup_loading } from "./util";
import { changeLanguageButton, global, languageListBox } from "./variable";

global.language_module = {};
const languages_module_path: { [key: string]: string } = {
  id: "/language/id.json",
  en: "/language/en.json", // translated by chatgpt
};

// load from "/laguage" folder
function getLang_file(id: string) {
  return new Promise((resolve, reject) => {
    let lang_path: string;

    if (!(languages_module_path[id] && typeof id === "string")) lang_path = languages_module_path["id"];
    else lang_path = languages_module_path[id];

    fetch(lang_path)
      .then(function (e) {
        e.json().then(function ({ data }) {
          global.language_module = data;
          resolve(null);
        });
      })
      .catch(reject);
  });
}

function loadLanguageFromPage() {
  const language_id = languageListBox.dataset.value!;
  localStorage.setItem("lrc-lang", language_id);
  // console.log(language_id);

  document.querySelectorAll<HTMLElement>(".lrc_text").forEach(function (element) {
    const key = element.dataset.textkey;
    if (key) return (element.innerHTML = getLangText(key.trim()));

    const new_key = element.innerHTML.trim();
    element.dataset.textkey = new_key;
    element.innerHTML = getLangText(new_key);
  });

  updateLanguageListBox(language_id);
}

function updateLanguageListBox(id: string) {
  languageListBox.querySelectorAll("li").forEach(function (v) {
    const isSelected = v.dataset.name === id;

    v.classList.toggle("bg-4", isSelected);
    v.classList.toggle("dark:bg-1", isSelected);
  });

  document.querySelector(".lrc-lang-display")!.innerHTML = id.toUpperCase();
  popup_loading.remove("language-loading");
}

const savedLanguageSeleted = localStorage.getItem("lrc-lang") ?? "id";
languageListBox.dataset.value = savedLanguageSeleted;
getLang_file(savedLanguageSeleted).then(function () {
  loadLanguageFromPage();
});

changeLanguageButton.addEventListener("click", function () {
  const closed = languageListBox.classList.contains("hidden");

  if (closed) languageListBox.classList.remove("hidden");
  else languageListBox.classList.add("hidden");
});

languageListBox.addEventListener("click", function (event) {
  popup_loading.add("language-loading");

  if (Object.keys(global.language_module).length < 1) return;
  const selectedLanguageID = (event.target as HTMLElement).dataset.name;
  if (!selectedLanguageID) return;

  this.dataset.value = selectedLanguageID;
  getLang_file(selectedLanguageID).then(loadLanguageFromPage);
});
