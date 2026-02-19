const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: "lib/index.js",
    sourcemap: true,
    format: "cjs",
    // packages: "external", // ignore all dependencies
    external: ["firebase-admin", "firebase-functions"],
  })
  .catch(() => process.exit(1));
