// import { defineConfig } from "vite";
import { copy } from "vite-plugin-copy";

export default {
  plugins: [
    copy([
      { src: "./language/", dest: "./dist/" },
      { src: "./asset-image/", dest: "./dist/" },
    ]),
  ],
};
