"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { compileAndRenderSVG } from "./lib/svgLang/interpreter";

export default function SvgLivePreview() {
  // --- Sample program in your language ---
  const sampleLang = `start svg width 400 height 300
use fill "cornflowerblue"
use stroke "black" width 2

let cell be 40
repeat 5 times as row:
  repeat 8 times as col:
    circle at (col * cell + 20, row * cell + 20) radius 16
  end
end

let x be 0
repeat x be x + 20 until x >= 200:
  text "x=" + x at (x + 20, 280) size 12
end

finish svg`;

  // --- Left editor: your language ---
  const [langText, setLangText] = useState<string>(sampleLang);

  // --- Middle/Right editor: generated SVG (editable if user wants to tweak) ---
  const [svgText, setSvgText] = useState<string>("");
  const [compileError, setCompileError] = useState<string | null>(null);

  // --- Iframe preview doc ---
  const [srcDoc, setSrcDoc] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Compile language → SVG (debounced)
  useEffect(() => {
    let cancelled = false;
    const tid = setTimeout(() => {
      try {
        const svg = compileAndRenderSVG(langText);
        if (!cancelled) {
          setSvgText(svg);
          setCompileError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setCompileError(e?.message ?? "Compile error");
        }
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [langText]);

  // When svgText changes, update iframe srcDoc
  useEffect(() => {
    setSrcDoc(wrapSvgForIframe(svgText));
  }, [svgText]);

  const hasSvgTag = useMemo(() => /<svg[\s>]/i.test(svgText), [svgText]);

  function wrapSvgForIframe(svg: string) {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;">${svg}</body></html>`;
  }

  function handleDownload() {
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drawing.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    setLangText(`start svg width 200 height 200
finish svg`);
  }

  return (
    <div className="h-screen w-screen grid grid-cols-3 gap-4 p-4 bg-gray-50">
      {/* Language editor */}
      <div className="flex flex-col rounded-2xl shadow p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Language Source</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded-lg border text-sm"
              title="Download current SVG"
            >
              Download SVG
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1 rounded-lg border text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={langText}
          onChange={(e) => setLangText(e.target.value)}
          className="flex-1 resize-none w-full p-3 rounded-md border font-mono text-sm leading-relaxed outline-none"
          style={{ minHeight: 0 }}
        />

        <p className="mt-2 text-xs text-gray-500">
          Write programs in your natural-language syntax. The result compiles to
          SVG automatically.
        </p>

        {compileError && (
          <div className="mt-2 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
            {compileError}
          </div>
        )}
      </div>

      {/* SVG source (generated, but editable) */}
      <div className="flex flex-col rounded-2xl shadow p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Generated SVG</h2>
          <div className="text-sm text-gray-500">
            {hasSvgTag ? "Valid <svg> detected" : "No <svg> root found"}
          </div>
        </div>

        <textarea
          value={svgText}
          onChange={(e) => setSvgText(e.target.value)}
          className="flex-1 resize-none w-full p-3 rounded-md border font-mono text-sm leading-relaxed outline-none"
          style={{ minHeight: 0 }}
        />

        <p className="mt-2 text-xs text-gray-500">
          You can tweak the SVG markup here directly if desired.
        </p>
      </div>

      {/* Iframe preview */}
      <div className="flex flex-col rounded-2xl shadow p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Preview</h2>
          <div className="text-sm text-gray-500">
            Rendered in sandboxed iframe
          </div>
        </div>

        <div
          className="flex-1 border rounded-md overflow-hidden"
          style={{ minHeight: 0 }}
        >
          <iframe
            ref={iframeRef}
            title="SVG Preview"
            srcDoc={srcDoc}
            sandbox=""
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
