import fs from "fs";
import path from "path";

// 
export const errorWhere = "in: \n > where: "

export function walkDir(dir, callback) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

export let hasError = false;

export function isError(msg) {
  console.error(`\n✖ ${msg}\n`);
  hasError = true;
}

/*
  Style files (Next.js):
  - .scss
  - .module.scss
  - fallback: filename contains "style"
*/
export function isStyleFile(filePath) {
  const fileName = path.basename(filePath).toLowerCase();

  if (
    fileName.endsWith(".scss") ||
    fileName.endsWith(".module.scss")
  ) {
    return true;
  }

  // fallback opcional
  if (fileName.includes("style")) return true;

  return false;
}
