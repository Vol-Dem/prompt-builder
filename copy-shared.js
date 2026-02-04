import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = path.join(__dirname, "shared");
const dest = path.join(__dirname, "functions", "shared");

console.log("Syncing shared → functions/shared");

fs.removeSync(dest);
fs.copySync(src, dest);

fs.writeFileSync(
  path.join(dest, "README.md"),
  `
⚠️ AUTO-GENERATED FOLDER

This directory is copied from /shared before every Firebase deploy.

DO NOT EDIT FILES HERE.
Your changes will be overwritten.

Edit the source instead:
  /shared
`,
);

console.log("Shared synced.");
