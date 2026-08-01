import { FFmpeg } from "@ffmpeg/ffmpeg";

class FFmpegExtended extends FFmpeg {
  isLoaded: boolean = false

  constructor() {
    super();
  }

  async start_load() {
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
    this.on("log", ({ message }) => {
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });

    this.isLoaded = true;
  }
}

export const ffmpeg = new FFmpegExtended();


