import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import ts from 'typescript';

// Exercise the app's TypeScript modules without a second runtime dependency.
const root = fileURLToPath(new URL('../', import.meta.url));
registerHooks({
  resolve(specifier, context, nextResolve) {
    let url;
    if (specifier.startsWith('@/')) url = pathToFileURL(resolve(root, 'src', specifier.slice(2))).href;
    else if (specifier.startsWith('.') && context.parentURL && !context.parentURL.includes('/node_modules/')) url = new URL(specifier, context.parentURL).href;
    if (url?.startsWith('file:')) {
      for (const suffix of ['', '.ts', '.tsx', '/index.ts']) {
        if (existsSync(fileURLToPath(url + suffix))) return nextResolve(url + suffix, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url)) {
      const source = readFileSync(fileURLToPath(url), 'utf8');
      const { outputText } = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
        fileName: fileURLToPath(url),
      });
      return { format: 'module', source: outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
