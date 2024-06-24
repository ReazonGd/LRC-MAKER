// class audioPlayer extends Audio{
//     constructor() {
//         super()

//         this.pnpButtonElement = document.querySelector("#p-n-p");
//         this.forwardButtonElement = document.querySelector("#forward");
//         this.rewindButtonElement = document.querySelector("#rewind");
//         this.volumeButtonElement = document.querySelector(".lrc-volume");
//         this.timeRangeElement = document.querySelector("#time-range");
//         this.volumeRangeElement = document.querySelector("#volume-range");
//         this.offsetTimeElement = document.querySelector("#offset");
//         this.playbackSpeedOptionElement = document.querySelector("#audio-playback");
//     }

//     preloadAudio() {
//         this.addEventListener("canplaythrough", () => {
//             this.volume = 0;
//             this.play();
//             this.addEventListener("timeupdate", () => {
//                 this.pause();
//                 this.volume = +this.volumeRangeElement.ariaValueMax;
//                 this.currentTime = 0;

//                 const copleatedEvent = new CustomEvent("ready2play");
//                 this.dispatchEvent(copleatedEvent);
//             })
//         })
//     }

//     init() {
//         this.pnpButtonElement.addEventListener("click", () => {

//         })

//         this.addEventListener("timeupdate")
//     }

//     timeUpdateHandler() {
//         if (isNaN(this.currentTime)) return;
//         this.timeRangeElement.value = this.currentTime;
//     }
// }
