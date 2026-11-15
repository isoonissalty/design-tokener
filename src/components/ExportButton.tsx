"use client";

import { useRef, useState } from "react";
import { Download, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { setTokens } from "@/store/features/themeSlice";
import type { DesignTokenSystem } from "@/types/token-system";
import { exportThemeCss, exportThemeJson, exportTailwindConfig, importTheme } from "@/lib/theme-io";

type ExportFormat = "css4" | "css3" | "config3" | "json";

function exportFile(tokens: DesignTokenSystem, format: ExportFormat) {
  if (format === "json") return { content: exportThemeJson(tokens), name: "design-tokens.json", type: "application/json" };
  if (format === "config3") return { content: exportTailwindConfig(tokens), name: "tailwind.config.cjs", type: "text/javascript" };
  return { content: exportThemeCss(tokens, format === "css3" ? 3 : 4), name: "theme.css", type: "text/css" };
}

/** Import and export share a dialog so each download has an explicit format. */
export function ExportButton({ tokens }: { tokens: DesignTokenSystem }) {
  const dispatch = useAppDispatch();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"import" | "export">("export");
  const [format, setFormat] = useState<ExportFormat>("css4");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reading, setReading] = useState(false);
  const [copied, setCopied] = useState(false);
  const file = exportFile(tokens, format);

  const open = (nextMode: "import" | "export") => {
    setMode(nextMode);
    setError("");
    setCopied(false);
    dialog.current?.showModal();
  };

  const download = () => {
    const blob = new Blob([file.content], { type: file.type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Keep the object URL alive until the browser starts the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${file.name} downloaded.`);
  };

  const apply = () => {
    try {
      const result = importTheme(source, tokens);
      dispatch(setTokens(result.tokens));
      setNotice(result.message);
      setError("");
      dialog.current?.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not import this theme.");
    }
  };

  return (
    <>
      <Button aria-label="Import Theme" variant="outline" onClick={() => open("import")}><Upload />Import<span className="hidden sm:inline"> Theme</span></Button>
      <Button aria-label="Export Theme" onClick={() => open("export")}><Download />Export<span className="hidden sm:inline"> Theme</span></Button>
      <span role="status" className="sr-only">{notice}</span>
      <dialog ref={dialog} aria-labelledby="theme-io-title" className="m-auto w-[min(640px,calc(100vw-2rem))] max-h-[90dvh] overflow-auto rounded-xl border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/40">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 id="theme-io-title" className="font-semibold">{mode === "import" ? "Import a theme" : "Export your theme"}</h2>
          <Button variant="ghost" size="icon" aria-label="Close theme dialog" onClick={() => dialog.current?.close()}><X /></Button>
        </div>
        <div className="space-y-4 p-5">
          {mode === "import" ? (
            <>
              <p className="text-sm text-muted-foreground">Load a full JSON theme, or import CSS variables from Tailwind and shadcn. CSS updates matching tokens and keeps the rest of your theme. You can undo the import.</p>
              <div className="space-y-2">
                <label htmlFor="theme-file" className="block text-sm font-medium">Choose a JSON or CSS file</label>
                <input id="theme-file" type="file" accept=".json,.css,application/json,text/css" className="block w-full rounded-md border p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1" onChange={async (event) => {
                  const selected = event.target.files?.[0];
                  event.target.value = "";
                  if (!selected) return;
                  setError("");
                  if (selected.size > 1024 * 1024) { setError("Choose a theme smaller than 1 MB."); return; }
                  setReading(true);
                  try { setSource(await selected.text()); } catch { setError("The file could not be read. Try choosing it again."); }
                  finally { setReading(false); }
                }} />
              </div>
              <div className="space-y-2">
                <label htmlFor="theme-source" className="block text-sm font-medium">Or paste theme JSON / CSS</label>
                <textarea id="theme-source" value={source} onChange={(event) => { setSource(event.target.value); setError(""); }} placeholder={':root {\n  --primary: #7c3aed;\n}\n.dark {\n  --primary: #a78bfa;\n}'} spellCheck={false} className="h-64 w-full resize-y rounded-md border bg-background p-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => dialog.current?.close()}>Cancel</Button><Button onClick={apply} disabled={reading || !source.trim()}><Upload />{reading ? "Reading file…" : "Import Theme"}</Button></div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="theme-format" className="block text-sm font-medium">Export format</label>
                <select id="theme-format" value={format} onChange={(event) => { setFormat(event.target.value as ExportFormat); setCopied(false); setError(""); }} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="css4">Tailwind CSS v4 — theme.css</option>
                  <option value="css3">Tailwind CSS v3 — theme.css</option>
                  <option value="config3">Tailwind CSS v3 — tailwind.config.cjs</option>
                  <option value="json">Editable theme — JSON</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground">{format === "json" ? "Includes every token and both color modes. Import this file to restore the theme exactly." : format === "css4" ? "Includes the Tailwind import, utility mappings, and light/dark variables. Use as your Tailwind v4 stylesheet." : "For Tailwind v3, download both theme.css and tailwind.config.cjs. Import the CSS in your app and use the config for utility mappings."}</p>
              <label htmlFor="theme-export-preview" className="sr-only">Export preview</label>
              <textarea id="theme-export-preview" readOnly value={file.content} spellCheck={false} className="h-64 w-full resize-y rounded-md border bg-muted/30 p-3 font-mono text-xs" />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={async () => {
                  try { await navigator.clipboard.writeText(file.content); setCopied(true); setNotice("Theme copied to clipboard."); }
                  catch { setError("Clipboard unavailable. Select the preview text or download the file."); }
                }}>{copied && <Check />}{copied ? "Copied" : "Copy code"}</Button>
                <Button onClick={download}><Download />Download {file.name}</Button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
