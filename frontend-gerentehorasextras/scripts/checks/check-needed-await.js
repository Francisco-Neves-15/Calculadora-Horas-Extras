const fs = require("fs");
const path = require("path");
const utils = require("../utils");
const { walkDir, isError, errorWhere } = utils;
const ts = require("typescript");

const SRC_DIR = path.join(process.cwd(), "src");

/* =========================
   Await (useAlerts)
   Rule: calls to alert/confirm/input from useAlerts()
   must be awaited when used as a standalone statement.
========================= */

const USE_ALERTS_HOOK_NAME = "useAlerts";
const ALERTS_METHODS = new Set(["alert", "confirm", "input"]);

function toRelativePath(filePath) {
  return path.relative(process.cwd(), filePath);
}

function getFileLineCol(sourceFile, node) {
  const pos = node.getStart(sourceFile, false);
  const lc = sourceFile.getLineAndCharacterOfPosition(pos);
  return { line: lc.line + 1, col: lc.character + 1 };
}

function unwrapExpression(node) {
  let current = node;

  while (current) {
    if (ts.isParenthesizedExpression(current)) {
      current = current.expression;
      continue;
    }

    if (ts.isNonNullExpression(current)) {
      current = current.expression;
      continue;
    }

    if (ts.isAsExpression(current)) {
      current = current.expression;
      continue;
    }

    if (ts.isTypeAssertionExpression(current)) {
      current = current.expression;
      continue;
    }

    break;
  }

  return current;
}

function isAwaited(callExpression) {
  let current = callExpression;

  while (current.parent) {
    const parent = current.parent;

    if (ts.isAwaitExpression(parent)) return true;

    if (
      ts.isParenthesizedExpression(parent) ||
      ts.isNonNullExpression(parent) ||
      ts.isAsExpression(parent) ||
      ts.isTypeAssertionExpression(parent)
    ) {
      current = parent;
      continue;
    }

    return false;
  }

  return false;
}

function isIntentionallyIgnored(callExpression) {
  let current = callExpression;

  while (current.parent) {
    const parent = current.parent;

    if (ts.isVoidExpression(parent)) return true;

    if (
      ts.isParenthesizedExpression(parent) ||
      ts.isNonNullExpression(parent) ||
      ts.isAsExpression(parent) ||
      ts.isTypeAssertionExpression(parent)
    ) {
      current = parent;
      continue;
    }

    return false;
  }

  return false;
}

function collectUseAlertsBindings(sourceFile) {
  // localName -> originalName (alert/confirm/input)
  const bindings = new Map(); 

  function visit(node) {
    if (ts.isVariableDeclaration(node)) {
      const initializer = node.initializer;
      const name = node.name;

      if (
        initializer &&
        ts.isCallExpression(initializer) &&
        ts.isIdentifier(initializer.expression) &&
        initializer.expression.text === USE_ALERTS_HOOK_NAME &&
        ts.isObjectBindingPattern(name)
      ) {
        for (const element of name.elements) {
          if (!element.name) continue;

          const localName = ts.isIdentifier(element.name) ? element.name.text : null;
          if (!localName) continue;

          const originalName = element.propertyName
            ? ts.isIdentifier(element.propertyName)
              ? element.propertyName.text
              : null
            : localName;

          if (!originalName) continue;
          if (!ALERTS_METHODS.has(originalName)) continue;

          bindings.set(localName, originalName);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return bindings;
}

function checkFile(filePath) {
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = toRelativePath(filePath);

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const bindings = collectUseAlertsBindings(sourceFile);
  if (bindings.size === 0) return;

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = unwrapExpression(node.expression);
      if (callee && ts.isIdentifier(callee) && bindings.has(callee.text)) {
        if (isAwaited(node)) {
          ts.forEachChild(node, visit);
          return;
        }

        if (isIntentionallyIgnored(node)) {
          ts.forEachChild(node, visit);
          return;
        }

        const { line, col } = getFileLineCol(sourceFile, node);
        const method = bindings.get(callee.text);
        isError(
          `Missing "await" for useAlerts().${method}() call. ${errorWhere}${relativePath}:${line}:${col}`
        );
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

/* =========================
   Finals
========================= */

if (!fs.existsSync(SRC_DIR)) {
  console.error("\n▲ src/ directory not found, skipping validations.\n");
  process.exit(0);
}

walkDir(SRC_DIR, (filePath) => {
  checkFile(filePath);
});

if (utils.hasError) {
  console.error("\n✖ Await's validation failed.\n");
  process.exit(1);
}

console.log("\n✔ Await's validations passed successfully\n");
process.exit(0);
