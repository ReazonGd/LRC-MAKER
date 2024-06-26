import { createPopup, gotoPage, popup_loading } from "./util";
import "./audio";
import "./language";
import "./editor";

window.lrc = {};

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

// gotoPage btn handler
document.querySelectorAll(`*[data-gotopage]`).forEach(function (v) {
  v.addEventListener("click", function () {
    gotoPage(Number(this.dataset.gotopage));
  });
});
