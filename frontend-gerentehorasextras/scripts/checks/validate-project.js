const fs = require("fs");
const path = require("path");
const { walkDir, isError, hasError, errorWhere } = require("../utils");

const SRC_DIR = path.join(process.cwd(), "src");

/* =========================
   Rule 1
   Block: import { router }
========================= */

const forbiddenRouterImport =
  /import\s*{\s*router\s*}\s*from\s*['"][^'"]+['"]/;

/* =========================
   Rule 2
   Block: import { useRouter } from "next/router"
   &
   Block: import router from "next/router";
   ("next/router" legacy Pages Router), the app uses App Router ("next/navigation")
========================= */

const forbiddenNextRouterImport =
  /import\s*{\s*useRouter\s*}\s*from\s*['"]next\/router['"]/;

const forbiddenNextRouterDefaultImport =
/import\s+router\s+from\s+['"]next\/router['"]/;

/* =========================
   Rule 3
   useRouter without "use client"
========================= */

const useRouterImport =
  /import\s*{\s*useRouter\s*}\s*from\s*['"]next\/navigation['"]/;

const useClientDirective =
  /["']use client["']/;

/* =========================
   Rule 15 (ESLint can be used later)
   Hooks React without "use client"
========================= */

const reactHooksRegex =
  /\b(useState|useEffect|useRef|useCallback|useContext|useMemo|useReducer)\b/;

/* =========================
   Execution
========================= */

if (!fs.existsSync(SRC_DIR)) {
  console.error("⚠ src/ directory not found, skipping validations.");
  process.exit(0);
}

walkDir(SRC_DIR, (filePath) => {
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(process.cwd(), filePath);

  /* =========================
     Rule 1
  ========================= */
  if (forbiddenRouterImport.test(content)) {
    isError(
      `Forbidden import of "router" directly. Use "const router = useRouter()" instead. ${errorWhere}${relativePath}`
    );
  }

  /* =========================
     Rule 2
  ========================= */
  if (forbiddenNextRouterImport.test(content)) {
    isError(
      `"useRouter" imported from "next/router" is forbidden in App Router. Use "next/navigation" instead. ${errorWhere}${relativePath}`
    );
  }
  if (forbiddenNextRouterDefaultImport.test(content)) {
    isError(
      `Forbidden default import "router" from "next/router". Use "useRouter" from "next/navigation" instead. ${errorWhere}${relativePath}`
    );
  }

  /* =========================
     Rule 3
  ========================= */
  if (useRouterImport.test(content)) {
    if (!useClientDirective.test(content)) {
      isError(
        `"useRouter" used without "use client". ${errorWhere}${relativePath}`
      );
    }
  }

  /* =========================
     Rule 15
  ========================= */
  if (reactHooksRegex.test(content)) {
    if (!useClientDirective.test(content)) {
      isError(
        `React hook used without "use client". ${errorWhere}${relativePath}`
      );
    }
  }

});

/* =========================
   Finals
========================= */

if (hasError) {
  console.error("\n✖ Project validation failed.");
  process.exit(1);
}

console.log("✔ Custom validations passed successfully");
process.exit(0);
