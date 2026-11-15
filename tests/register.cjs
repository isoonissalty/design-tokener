/* eslint-disable @typescript-eslint/no-require-imports */
// Test-only TypeScript loader: exercise the real source without another runtime dependency.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const sourceRoot = path.resolve(__dirname, "../src");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolve(request, ...args) {
  return originalResolve.call(this, request.startsWith("@/") ? path.join(sourceRoot, request.slice(2)) : request, ...args);
};
require.extensions[".ts"] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};
