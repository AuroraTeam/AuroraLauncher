/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadSource(file, resolveImport, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, "../../src", file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
      esModuleInterop: true,
    },
  });
  const exports = {};
  vm.runInNewContext(
    outputText,
    { exports, require: resolveImport, URL, AbortController, ...globals },
    { filename: file },
  );
  return exports;
}

module.exports = { loadSource };
