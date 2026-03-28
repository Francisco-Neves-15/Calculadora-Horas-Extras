// NÃO FUNCIONAL AINDA

// USE: npx ts-node .\scripts\checks\check-lang-string.js

// const fs = require("fs");
// const path = require("path");
// const { walkDir, isError, hasError } = require("../utils");

// // Pasta onde estão os arquivos de strings
// const STRINGS_DIR = path.join(process.cwd(), "src/lang/strings");

// /* =========================
//    Helper: Verifica se os objetos estão ordenados por chave
// ========================= */
// function isObjectKeysSorted(obj) {
//   const keys = Object.keys(obj);
//   for (let i = 1; i < keys.length; i++) {
//     if (keys[i - 1] > keys[i]) return false;
//   }
//   return true;
// }

// /* =========================
//    Execution
// ========================= */

// if (!fs.existsSync(STRINGS_DIR)) {
//   console.error("⚠ src/lang/strings/ directory not found.");
//   process.exit(0);
// }

// walkDir(STRINGS_DIR, (filePath) => {
//   if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

//   const content = fs.readFileSync(filePath, "utf8");
//   const relativePath = path.relative(process.cwd(), filePath);

//   let stringsModule;
//   try {
//     // stringsModule = require(filePath);
//     stringsModule = import(filePath).then((content) => {});
//   } catch (err) {
//     isError(`Failed to import strings file: ${relativePath}\n${err}`);
//     return;
//   }

//   // Para cada export que é objeto
//   for (const key of Object.keys(stringsModule)) {
//     const langObject = stringsModule[key]; // ex: homeStrings
//     const langKeys = Object.keys(langObject);

//     // 1️⃣ Checagem de chaves dos idiomas consistentes
//     const allLangs = Object.keys(langObject);
//     const referenceKeys = Object.keys(langObject[allLangs[0]] || {});

//     allLangs.forEach((lang) => {
//       const currentKeys = Object.keys(langObject[lang] || {});
//       const missingKeys = referenceKeys.filter((k) => !currentKeys.includes(k));
//       const extraKeys = currentKeys.filter((k) => !referenceKeys.includes(k));

//       if (missingKeys.length > 0) {
//         isError(
//           `Missing keys in "${lang}" of ${relativePath}: ${missingKeys.join(
//             ", "
//           )}`
//         );
//       }

//       if (extraKeys.length > 0) {
//         isError(
//           `Extra keys in "${lang}" of ${relativePath}: ${extraKeys.join(", ")}`
//         );
//       }
//     });

//     // 2️⃣ Checagem de ordenação
//     allLangs.forEach((lang) => {
//       if (!isObjectKeysSorted(langObject[lang])) {
//         console.warn(
//           `WARN: Keys not sorted for "${lang}" in ${relativePath}. Run "node ./scripts/format/lang-string.js"`
//         );
//       }
//     });
//   }
// });

// /* =========================
//    Finals
// ========================= */

// if (hasError) {
//   console.error("\n✖ Lang strings validation failed.");
//   process.exit(1);
// }

// console.log("✔ Lang strings passed validation.");
// process.exit(0);
