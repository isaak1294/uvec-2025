// Simple worker that runs the interpreter. It expects to find a global function
// `compileAndRenderSVG` available via importScripts or built-in bundling.
// Message format: { id, source, stepLimit }

let compileFunc = null;

self.onmessage = async (ev) => {
  const msg = ev.data;
  if (msg.type === 'init') {
    // optional: load script if provided
    if (msg.scriptUrl) {
      try {
        importScripts(msg.scriptUrl);
        // assume compileAndRenderSVG is now available
        compileFunc = self.compileAndRenderSVG || null;
        self.postMessage({ id: msg.id, ok: true });
      } catch (e) {
        self.postMessage({ id: msg.id, ok: false, error: e?.message || String(e) });
      }
    }
    return;
  }

  if (msg.type === 'compile') {
    const { id, source, stepLimit } = msg;
    try {
      if (typeof compileFunc !== 'function') {
        // If compileFunc not set, try global
        compileFunc = self.compileAndRenderSVG || null;
        if (typeof compileFunc !== 'function') throw new Error('compileAndRenderSVG not available in worker');
      }
      const svg = compileFunc(source, { stepLimit });
      self.postMessage({ id, ok: true, svg });
    } catch (err) {
      self.postMessage({ id, ok: false, error: err?.message || String(err) });
    }
  }
};
