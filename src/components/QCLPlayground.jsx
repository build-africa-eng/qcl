'use client';

import { useState, useEffect, useRef } from 'react';
import { parseQCL } from '../core/qcl-parser.js';
import { renderHTML } from '../core/qcl-renderer.js';

const defaultSource = `page title: Live QCL
  state count: 0
  box bg: #eaf4ff, padding: 20
    text size: 18, weight: bold: Count: {count}
    button action: count++: Increment`;

export default function QCLPlayground() {
  const [source, setSource] = useState(defaultSource);
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setError('');
      const ast = parseQCL(source);
      const html = renderHTML(ast);
      if (previewRef.current) {
        previewRef.current.innerHTML = html;
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
  }, [source]);

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Edit QCL</h2>
        <textarea
          className="w-full h-96 p-4 font-mono border rounded bg-white shadow resize-none"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        {error && (
          <pre className="mt-2 text-red-600 bg-red-100 p-2 rounded whitespace-pre-wrap">
            {error}
          </pre>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
        <div
          ref={previewRef}
          className="border rounded p-4 bg-white shadow min-h-96"
        />
      </div>
    </div>
  );
}
