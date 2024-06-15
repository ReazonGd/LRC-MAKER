const changeLanguageButton = document.querySelector("#lang-btn");
const languageListBox = document.querySelector("#lang-list");

changeLanguageButton.addEventListener("click", function () {
  const closed = languageListBox.classList.contains("hidden");

  if (closed) languageListBox.classList.remove("hidden");
  else languageListBox.classList.add("hidden");
});

languageListBox.addEventListener("click", function (event) {
  const selected = event.target.dataset.name;
  if (!selected) return;
  this.dataset.value = selected;

  languageListBox.querySelectorAll("li").forEach(function (v) {
    if (v.dataset.name === selected) {
      if (!v.classList.contains("bg-4")) v.classList.add("bg-4", "dark:bg-1");
    } else {
      if (v.classList.contains("bg-4")) v.classList.remove("bg-4", "dark:bg-1");
    }
  });

  loadLaguage();
});

const language = {
  id: {
    "greeting.start": "Mari mulai dengan memilih Audio",
    "select.audio": "Pilih Audio",
    "greeting.dnd": "atau drag & drop kesini.",
    "property.form.des": "Semua input selain lirik bisa di kosongi, anda juga dapat mengedit ini nanti",
    "form.title": "Judul Lagu",
    "form.artist": "Nama Artis",
    "form.album": "Judul Album",
    "form.author": "Nama Pembuat",
    "form.userName": "Namamu",
    "form.seletcted.audio": "Audio Terpilih",
    "form.lyrics": "Lirik",
    "form.next": "Lanjutkan",
    "editor.intruction_1": "klik waktu disamping lirik atau tombol",
    "editor.intruction_2": "untuk mengatur waktu",
    "editor.lyrics": "Lirik",
    "editor.time": "Waktu",
    "save.header": "Simpan & Salin",
    "save.option": "Simpan sesuai",
    "save.option.audio": "audio",
    "save.option.property": "properti",
    "save.option.custom": "kustom",
    "save.copy": "salin",
    "save.download": "unduh",
    "alert.empty.lyrics": "Lirik tidak boleh kosong",
    "alert.file_type.not_suport": "Tidak dapat memuat file.",
  },
  //   translated by chatgpt
  en: {
    "greeting.start": "Let's start by selecting Audio",
    "select.audio": "Select Audio",
    "greeting.dnd": "or drag & drop here.",
    "property.form.des": "All inputs except lyrics can be left blank, you can also edit this later",
    "form.title": "Song Title",
    "form.artist": "Artist Name",
    "form.album": "Album Title",
    "form.author": "Author Name",
    "form.userName": "Your Name",
    "form.seletcted.audio": "Selected Audio",
    "form.lyrics": "Lyrics",
    "form.next": "Continue",
    "editor.intruction_1": "click the time next to the lyrics or the button",
    "editor.intruction_2": "to set the time",
    "editor.lyrics": "Lyrics",
    "editor.time": "Time",
    "save.header": "Save & Copy",
    "save.option": "Save as",
    "save.option.audio": "audio",
    "save.option.property": "property",
    "save.option.custom": "custom",
    "save.copy": "copy",
    "save.download": "download",
    "alert.empty.lyrics": "Lyrics cannot be empty",
    "alert.file_type.not_suport": "Cannot load file.",
  },
};

function getLanguageContext(key) {
  const language_now = languageListBox.dataset.value;
  if (!language[language_now]) {
    console.error("laguage : " + language_now + " not found");
    return key;
  } else if (!language[language_now][key]) {
    console.error("laguage key : " + key + " not found");
    return key;
  }
  return language[language_now][key];
}

function loadLaguage() {
  document.querySelectorAll(".lrc_text").forEach(function (element) {
    if (element.dataset.textkey) {
      const key = element.dataset.textkey.trim();
      element.innerHTML = getLanguageContext(key);
    } else {
      const key = element.innerHTML.trim();
      element.dataset.textkey = key;
      element.innerHTML = getLanguageContext(key);
    }
  });
}

loadLaguage();
