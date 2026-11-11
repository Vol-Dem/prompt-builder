import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
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
    babel({
      exclude: [/[\\/]node_modules[\\/]/, /\.(test|spec)\.[jt]sx?$/],
      presets: [reactCompilerPreset()],
    }),
  ],
  server: {
    open: true,
  },
  // test: {
  //   environment: "jsdom",
  //   globals: true,
  //   setupFiles: "./src/setupTests.js",
  // },
});
