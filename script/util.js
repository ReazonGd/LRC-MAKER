const popup_container = document.querySelector("#popup-container");

function createPopup(title, innerHTML) {
  const modal = document.createElement("div");
  modal.classList.add("max-w-80", "fixed", "top-1/2", "left-1/2", "-translate-y-1/2", "-translate-x-1/2", "w-full", "z-[99]", "rounded-lg", "bg-white", "dark:bg-5", "rounded-lg", "p-5");

  const h1 = document.createElement("h1");
  h1.classList.add("text-lg", "w-full", "text-center");
  h1.innerHTML = title;

  const p = document.createElement("p");
  p.innerHTML = innerHTML;

  const button = document.createElement("button");
  button.classList.add("bg-4", "dark:bg-1", "rounded-lg", "px-5", "px-2", "mt-2");
  button.innerHTML = getLangText("button.ok");

  button.addEventListener("click", function () {
    popup_container.removeChild(modal);

    popup_container.classList.toggle("hidden", popup_container.childNodes.length > 0);
  });

  modal.appendChild(h1);
  modal.appendChild(p);
  modal.appendChild(button);
  popup_container.appendChild(modal);

  popup_container.classList.toggle("hidden", false);
}

const popup_loading = {
  element: document.querySelector("#popup-loading"),
  aset: ["/aset/aset1.gif", "/aset/aset2.gif"],
  queue: [],
  add: function (initial) {
    if (this.queue.includes(initial)) return;
    this.queue.push(initial);

    const img = this.element.querySelector("img");
    img.src = this.aset[Math.random() >= 0.5 ? 0 : 1];
    this.element.classList.toggle("hidden", false);
  },
  remove: function (initial) {
    this.queue = this.queue.filter(function (value) {
      return value !== initial;
    });

    if (!this.queue.length) this.element.classList.toggle("hidden", true);
    // console.log(this.queue);
  },
};
