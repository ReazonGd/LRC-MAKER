import { defineConfig } from "vite";
import { copy } from "vite-plugin-copy";

export default defineConfig({
  plugins: [copy([{ src: "./asset-image/", dest: "./dist/" }]), copy([{ src: "./language/", dest: "./dist/" }])],
});
