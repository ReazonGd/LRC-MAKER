const changeLanguageButton = document.querySelector("#lang-btn");
const languageListBox = document.querySelector("#lang-list");

let language_module = {};
const languages_module_path = {
  id: "/language/id.json",
  en: "/language/en.json", // translated by chatgpt
};

// load from "/laguage" folder
function getLang_file(id) {
  return new Promise((resolve, reject) => {
    let lang_path;

    if (!(languages_module_path[id] && typeof id === "string")) lang_path = languages_module_path["id"];
    else lang_path = languages_module_path[id];

    console.log(lang_path, id);

    fetch(lang_path)
      .then(function (e) {
        e.json().then(function ({ data }) {
          language_module = data;
          resolve();
        });
      })
      .catch(reject);
  });
}

//
function getLangText(key, language_id) {
  if (Object.keys(language_module).length < 1) return;
  if (!language_id) language_id = languageListBox.dataset.value;
  if (!language_module[key]) return key;
  return language_module[key];
}

function loadLanguageFromPage() {
  const language_id = languageListBox.dataset.value;
  localStorage.setItem("lrc-lang", language_id);

  document.querySelectorAll(".lrc_text").forEach(function (element) {
    const key = element.dataset.textkey;
    if (key) return (element.innerHTML = getLangText(key.trim(), language_id));

    const new_key = element.innerHTML.trim();
    element.dataset.textkey = new_key;
    element.innerHTML = getLangText(new_key, language_id);
  });
}

(function () {
  const savedLanguageSeleted = localStorage.getItem("lrc-lang");
  if (savedLanguageSeleted) languageListBox.dataset.value = savedLanguageSeleted;

  getLang_file(savedLanguageSeleted).then(loadLanguageFromPage);

  changeLanguageButton.addEventListener("click", function () {
    const closed = languageListBox.classList.contains("hidden");

    if (closed) languageListBox.classList.remove("hidden");
    else languageListBox.classList.add("hidden");
  });

  languageListBox.addEventListener("click", function (event) {
    if (Object.keys(language_module).length < 1) return;
    const selectedLanguageID = event.target.dataset.name;
    if (!selectedLanguageID) return;

    console.log(selectedLanguageID);

    languageListBox.querySelectorAll("li").forEach(function (v) {
      if (v.dataset.name === selectedLanguageID) {
        if (!v.classList.contains("bg-4")) v.classList.add("bg-4", "dark:bg-1");
      } else {
        if (v.classList.contains("bg-4")) v.classList.remove("bg-4", "dark:bg-1");
      }
    });

    document.querySelector(".lrc-lang-display").innerHTML = selectedLanguageID.toUpperCase();

    getLang_file(selectedLanguageID).then(loadLanguageFromPage);
  });
})();
