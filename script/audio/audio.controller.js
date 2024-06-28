import { audioPlayer, pnpButton } from "../variable";

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

function forwardAudio(second = 10) {
  audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + second);
}
function rewindAudio(second = 10) {
  audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 15);
}

function setAudioSpeed(speed) {
  audioPlayer.playbackRate = speed;
}

function audioPlayHandler() {
  pnpButton.querySelector(".play").classList.add("hidden");
  pnpButton.querySelector(".pause").classList.remove("hidden");
}

function audioPauseHandler() {
  pnpButton.querySelector(".pause").classList.add("hidden");
  pnpButton.querySelector(".play").classList.remove("hidden");
}

function audioEndHandler() {
  if (!audioPlayer.paused) playAndPause(); // its effected?
  audioPauseHandler();
}

export { audioEndHandler, audioPauseHandler, audioPlayHandler, setAudioSpeed, rewindAudio, forwardAudio, playAndPause };
