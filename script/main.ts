import { createPopup, gotoPage, popup_loading } from "./util";
import "./audio/main";
import "./language";
import "./util/global-error"
import "./editor/main";
import { enableView, lrcDisplayContainer, themeButton } from "./variable";

// theme controler
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
  v.addEventListener("click", (e) => {
    gotoPage(Number((v as HTMLElement).dataset.gotopage));
  });
});

//
enableView.addEventListener("click", function () {
  !lrcDisplayContainer.hasAttribute("style")
    ? lrcDisplayContainer.setAttribute("style", "left: 0;")
    : lrcDisplayContainer.removeAttribute("style");
});


