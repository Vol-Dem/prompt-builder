import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    // svgr({
    //   svgrOptions: {
    //     exportType: "named",
    //   },
    //   include: "**/*.svg",
    //   exclude: "**/*.svg?raw", // prevent collision
    // }),
    react(),
  ],
  server: {
    open: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
