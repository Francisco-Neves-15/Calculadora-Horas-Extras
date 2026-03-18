const fs = require("fs");
const path = require("path");

// === PATHS ===
const SCSS_FILE = path.resolve("src/style/pallete-theme.scss");
const GLOBAL_FILE = path.resolve("src/hooks/useGlobalStyles.tsx");
const TYPES_FILE = path.resolve("src/types/pallete-theme.ts");
const TAILWIND_FILE = path.resolve("tailwind.config.ts");

// === HELPERS ===

// kebab → camelCase
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Extrai blocos marcados
function extractMarkedBlocks(content) {
  const blockNames = [
    "pallete-theme-dontchange",
    "pallete-theme-default",
  ];

  const blocks = [];

  blockNames.forEach((name) => {
    const regex = new RegExp(
      `// \\*-script-\\* as "${name}" - START[\\s\\S]*?// \\*-script-\\* as "${name}" - END`,
      "g"
    );

    const match = content.match(regex);
    if (match) {
      blocks.push(...match);
    }
  });

  return blocks;
}

// Extrai variáveis
function extractColors(blocks) {
  const regex = /--color-([\w-]+)\s*:/g;
  const colorsMap = new Map();

  blocks.forEach((block) => {
    let match;
    while ((match = regex.exec(block))) {
      const raw = match[1];
      const key = toCamelCase(raw);

      colorsMap.set(key, {
        key,
        cssVar: `--color-${raw}`,
      });
    }
  });

  return Array.from(colorsMap.values());
}

function replaceAutoBlock(content, newInnerContent) {
  return content.replace(
    /(\/\/ AUTO-GENERATED--PALLETE-THEME START)([\s\S]*?)(\/\/ AUTO-GENERATED--PALLETE-THEME END)/,
    (_, start, _old, end) => {
      return `${start}\n${newInnerContent}\n${end}`;
    }
  );
}

// === PROCESS ===

const scss = fs.readFileSync(SCSS_FILE, "utf-8");
const blocks = extractMarkedBlocks(scss);
const colors = extractColors(blocks);


if (!colors.length) {
  console.error("No color found in the marked blocks.");
  process.exit(1);
}

console.log("Colors found:", colors);

// =====================================================
// useGlobalStyles.tsx
// =====================================================

let globalFile = fs.readFileSync(GLOBAL_FILE, "utf-8");

const gColorsContent = `    gColors: {
${colors.map(c => `      "${c.key}": "var(${c.cssVar})",`).join("\n")}
    } as IPalleteTheme,`;

globalFile = replaceAutoBlock(globalFile, gColorsContent);
fs.writeFileSync(GLOBAL_FILE, globalFile);

// =====================================================
// TYPES
// =====================================================

let typesFile = fs.readFileSync(TYPES_FILE, "utf-8");

const typesContent = colors
  .map(c => `  "${c.key}": string;`)
  .join("\n");

typesFile = replaceAutoBlock(typesFile, typesContent);
fs.writeFileSync(TYPES_FILE, typesFile);

// =====================================================
// TAILWIND
// =====================================================

let tailwindFile = fs.readFileSync(TAILWIND_FILE, "utf-8");

const tailwindContent = `      colors: {
${colors.map(c => `        "${c.key}": "var(${c.cssVar})",`).join("\n")}
      },`;

tailwindFile = replaceAutoBlock(tailwindFile, tailwindContent);
fs.writeFileSync(TAILWIND_FILE, tailwindFile);

// =====================================================

console.log("> Files updated successfully.");
