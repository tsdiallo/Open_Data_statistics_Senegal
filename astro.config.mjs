import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://senegal-en-chiffres.netlify.app",
  integrations: [tailwind()],
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    ssr: {
      noExternal: ["chart.js"],
    },
  },
});
