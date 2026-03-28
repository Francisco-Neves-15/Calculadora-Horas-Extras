const fs = require("fs");
const path = require("path");
const { walkDir } = require("../utils");

const STRINGS_DIR = path.join(process.cwd(), "src/lang/strings");

function sortObjectKeys(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((k) => {
      sorted[k] = obj[k];
    });
  return sorted;
}

walkDir(STRINGS_DIR, (filePath) => {
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

  const relativePath = path.relative(process.cwd(), filePath);

  let content;
  try {
    content = require(filePath);
  } catch (err) {
    console.error(`Failed to import ${relativePath}`, err);
    return;
  }

  let modified = false;

  for (const exportKey of Object.keys(content)) {
    const langObj = content[exportKey];
    for (const lang of Object.keys(langObj)) {
      const sorted = sortObjectKeys(langObj[lang]);
      if (JSON.stringify(sorted) !== JSON.stringify(langObj[lang])) {
        langObj[lang] = sorted;
        modified = true;
      }
    }
  }

  if (modified) {
    // Converte para TS export format
    const exportsText = Object.entries(content)
      .map(([exportKey, obj]) => {
        return `export const ${exportKey} = ${JSON.stringify(obj, null, 2)};`;
      })
      .join("\n\n");

    fs.writeFileSync(filePath, exportsText, "utf8");
    console.log(`Formatted ${relativePath}`);
  }
});

console.log("✔ Lang strings formatting completed.");
