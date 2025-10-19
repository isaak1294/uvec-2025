"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { compileAndRenderSVG } from "./lib/svgLang/interpreter";
import Link from "next/link";

import { BookOpenText } from "lucide-react";

export default function SvgLivePreview() {
  const sampleLang = `to fb(n):
    if n % 15 == 0:
        give back "FizzBuzz"
    otherwise if n % 3 == 0:
        give back "Fizz"
    otherwise if n % 5 == 0:
        give back "Buzz"
    otherwise:
        give back "" + n
    end
end

start svg width 600 height 650
use fill "black"

let cell be 60
let x0 be 30
let y0 be 40

repeat 10 times as row:
    repeat 10 times as col:
        let n be (row - 1) * 10 + col

        if n % 15 == 0:
            use fill "purple"
        otherwise if n % 3 == 0:
            use fill "teal"
        otherwise if n % 5 == 0:
            use fill "orange"
        otherwise:
            use fill "black"
        end

        text fb(n) at (x0 + (col - 1) * cell, y0 + (row - 1) * cell) size 16
    end
end

finish svg`;

  const [langText, setLangText] = useState<string>(sampleLang);
  const [svgText, setSvgText] = useState<string>("");
  const [compileError, setCompileError] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState<string>("");
  const [leftPanelMode, setLeftPanelMode] = useState<"code" | "svg">("code");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    const tid = setTimeout(() => {
      // prefer running inside a Web Worker to avoid UI lockups
      const stepLimit = 5000000; // tune as required
      const timeoutMs = 2000;

      if (window.Worker) {
        const worker = new Worker('/svgWorker.js');
        const id = Math.random().toString(36).slice(2);
        let finished = false;

        const to = window.setTimeout(() => {
          if (!finished) {
            worker.terminate();
            if (!cancelled) setCompileError('Execution timed out');
          }
        }, timeoutMs);

        worker.onmessage = (ev) => {
          const m = ev.data;
          if (m.id !== id) return;
          finished = true;
          clearTimeout(to);
          worker.terminate();
          if (!cancelled) {
            if (m.ok) {
              setSvgText(m.svg);
              setCompileError(null);
            } else {
              // If worker couldn't find compileAndRenderSVG, fallback to synchronous compile
              if (/(compileAndRenderSVG not available|not available in worker)/i.test(m.error || '')) {
                try {
                  const svg = compileAndRenderSVG(langText, { stepLimit });
                  setSvgText(svg);
                  setCompileError(null);
                } catch (e: any) {
                  setCompileError(e?.message ?? 'Compile error');
                }
              } else {
                setCompileError(m.error || 'Compile error');
              }
            }
          }
        };

        worker.postMessage({ type: 'compile', id, source: langText, stepLimit });
      } else {
        // fallback: synchronous compile with stepLimit to guard loops
        try {
          const svg = compileAndRenderSVG(langText, { stepLimit: 5000000 });
          if (!cancelled) {
            setSvgText(svg);
            setCompileError(null);
          }
        } catch (e: any) {
          if (!cancelled) setCompileError(e?.message ?? 'Compile error');
        }
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [langText]);

  useEffect(() => {
    setSrcDoc(wrapSvgForIframe(svgText));
  }, [svgText]);

  const hasSvgTag = useMemo(() => /<svg[\s>]/i.test(svgText), [svgText]);

  //AI GENERATED
  function wrapSvgForIframe(svg: string) {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;">${svg}</body></html>`;
  }

  //AI GENERATED
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

  function insertAtCursor(text: string) {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue =
      textarea.value.substring(0, start) + text + textarea.value.substring(end);

    textarea.value = newValue;
  }

  return (
    <div className="h-screen w-screen grid grid-cols-2 gap-4 p-4 bg-gray-50">
      <div className="flex flex-col rounded-2xl shadow p-3  bg-white">
        {leftPanelMode == "code" ? (
          <>
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
                <button
                  onClick={() => setLeftPanelMode("svg")}
                  className="px-3 py-1 rounded-lg text-gray-500 hover:text-black text-sm"
                >
                  View Svg
                </button>
              </div>
            </div>

            <div className="flex h-full gap-8">
              <div className="border rounded-2xl p-5 shadow-sm bg-white w-64">
                <h1 className="text-xl font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 flex gap-2">
                  Draw
                  <Link href="/documentation/draw">
                    <BookOpenText className="hover:text-green-600 transition-colors cursor-pointer" />
                  </Link>
                </h1>
                <div className="flex flex-col gap-2 mb-5">
                  <button
                    onClick={() => insertAtCursor("circle at (x,y) radius r")}
                    className="text-sm font-medium bg-green-500/90 hover:bg-green-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    Circle
                  </button>
                  <button
                    onClick={() =>
                      insertAtCursor("rect at (x, y) width w height h")
                    }
                    className="text-sm font-medium bg-green-500/90 hover:bg-green-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    Rectangle
                  </button>
                  <button
                    onClick={() =>
                      insertAtCursor("line from (x1, y1) to (x2, y2)")
                    }
                    className="text-sm font-medium bg-green-500/90 hover:bg-green-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    Line
                  </button>
                  <button
                    onClick={() =>
                      insertAtCursor(`text "content" at (x, y) size s`)
                    }
                    className="text-sm font-medium bg-green-500/90 hover:bg-green-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    Text
                  </button>
                </div>

                <h1 className="text-xl font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 flex gap-2">
                  Conditionals
                  <Link href="/documentation/conditionals">
                    <BookOpenText className="hover:text-red-600 transition-colors cursor-pointer" />
                  </Link>
                </h1>
                <div className="flex flex-col gap-2 mb-5">
                  <button
                    onClick={() =>
                      insertAtCursor(
                        `if <condition>:
    <statements>
end`
                      )
                    }
                    className="text-sm font-medium bg-red-500/90 hover:bg-red-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    If / Else
                  </button>
                </div>

                <h1 className="text-xl font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 flex gap-2">
                  Loops
                  <Link href="/documentation/loops">
                    <BookOpenText className="hover:text-blue-600 transition-colors cursor-pointer" />
                  </Link>
                </h1>
                <div className="flex flex-col gap-2 mb-5">
                  <button
                    onClick={() =>
                      insertAtCursor(`repeat <count> times:
    <statements>
end`)
                    }
                    className="text-sm font-medium bg-blue-500/90 hover:bg-blue-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    Repeat # Times
                  </button>
                  <button
                    onClick={() =>
                      insertAtCursor(`repeat <initialization> until <condition>:
    <statements>
end
`)
                    }
                    className="text-sm font-medium bg-blue-500/90 hover:bg-blue-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    Repeat Until
                  </button>
                </div>

                <h1 className="text-xl font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2 flex gap-2">
                  Functions
                  <Link href="/documentation/functions">
                    <BookOpenText className="hover:text-purple-600 transition-colors cursor-pointer" />
                  </Link>
                </h1>
                <div className="flex flex-col gap-2 mb-5">
                  <button
                    onClick={() =>
                      insertAtCursor(`to <name>([parameters]):
    <statements>
end`)
                    }
                    className="text-sm font-medium bg-purple-500/90 hover:bg-purple-500 text-white w-full py-2 rounded-lg transition-colors"
                  >
                    Functions
                  </button>
                </div>
                <div className="pt-5 flex flex-col gap-2">
                  <Link href="/documentation/styles">
                    <p className="text-xs hover:text-black text-gray-500 transition-colors underline inline">
                      Learn About Colors and Styles
                    </p>
                  </Link>
                  <Link href="/documentation/variables">
                    <p className="text-xs hover:text-black text-gray-500 transition-colors underline inline">
                      Learn About Variable Binding
                    </p>
                  </Link>
                </div>
              </div>
              <textarea
                ref={textAreaRef}
                value={langText}
                onChange={(e) => setLangText(e.target.value)}
                className="flex-1 resize-none w-full p-3 rounded-2xl border font-mono text-sm leading-relaxed outline-none"
                style={{ minHeight: 0 }}
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Write programs in your natural-language syntax. The result
              compiles to SVG automatically.
            </p>

            {compileError && (
              <div className="mt-2 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
                {compileError}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">Generated SVG</h2>
              <div className="text-sm text-gray-500">
                {hasSvgTag ? "Valid <svg> detected" : "No <svg> root found"}
              </div>
              <button
                onClick={() => setLeftPanelMode("code")}
                className="px-3 py-1 rounded-lg text-gray-500 hover:text-black text-sm"
              >
                View Code
              </button>
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
          </>
        )}
      </div>

      <div className="flex flex-col rounded-2xl shadow p-3 bg-white ">
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
