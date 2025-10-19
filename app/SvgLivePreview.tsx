"use client";
import React, { useState, useEffect, useRef } from "react";

export default function SvgLivePreview() {
  const sample = `<!-- Example SVG: edit or paste your own -->
<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"400\" height=\"400\">
  <defs>
    <linearGradient id=\"g\" x1=\"0\" x2=\"1\"> 
      <stop offset=\"0%\" stop-color=\"#ff7b7b\" />
      <stop offset=\"100%\" stop-color=\"#7bb7ff\" />
    </linearGradient>
  </defs>
  <rect x=\"0\" y=\"0\" width=\"200\" height=\"200\" fill=\"url(#g)\"/>
  <circle cx=\"100\" cy=\"90\" r=\"48\" fill=\"white\" opacity=\"0.85\"/>
  <text x=\"100\" y=\"105\" text-anchor=\"middle\" font-size=\"20\" font-family=\"Arial\" fill=\"#333\">SVG</text>
</svg>`;

  const [svgText, setSvgText] = useState<string>(sample);
  const [srcDoc, setSrcDoc] = useState<string>(wrapSvgForIframe(sample));
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setSrcDoc(wrapSvgForIframe(svgText));
  }, [svgText]);

  function wrapSvgForIframe(svg: string) {
    return `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;\">${svg}</body></html>`;
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
    setSvgText('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  }

  return (
    <div className="h-screen w-screen grid grid-cols-2 gap-4 p-4 bg-gray-50">
      <div className="flex flex-col rounded-2xl shadow p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">SVG Source</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded-lg border text-sm"
            >
              Download
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
          value={svgText}
          onChange={(e) => setSvgText(e.target.value)}
          className="flex-1 resize-none w-full p-3 rounded-md border font-mono text-sm leading-relaxed outline-none"
          style={{ minHeight: 0 }}
        />

        <p className="mt-2 text-xs text-gray-500">
          Tip: paste full SVG markup (including the <code>svg</code> tag). The
          preview is rendered inside a sandboxed iframe so scripts will not run.
        </p>
      </div>

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
