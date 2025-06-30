'use client';

import { QCLNode } from '@/lib/qcl-parser';
import { gzip } from 'pako';

type Props = {
  qcl: string;
  html: string;
  ast?: QCLNode;
};

export function ExportButtons({ qcl, html, ast }: Props) {
  const download = (data: string | Uint8Array, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={() => download(qcl, 'qcl-source.qcl', 'text/plain')}
        className="px-3 py-1 border rounded bg-blue-100 dark:bg-blue-800 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-700"
      >
        📄 Export QCL
      </button>

      <button
        onClick={() => download(html, 'rendered.html', 'text/html')}
        className="px-3 py-1 border rounded bg-green-100 dark:bg-green-800 dark:text-white hover:bg-green-200 dark:hover:bg-green-700"
      >
        🧾 Export HTML
      </button>

      {ast && (
        <button
          onClick={() => download(JSON.stringify(ast, null, 2), 'ast.json', 'application/json')}
          className="px-3 py-1 border rounded bg-yellow-100 dark:bg-yellow-800 dark:text-white hover:bg-yellow-200 dark:hover:bg-yellow-700"
        >
          🧠 Export AST (JSON)
        </button>
      )}

      <button
        onClick={() => {
          const compressed = gzip(qcl);
          download(compressed, 'qcl-source.qcl.gz', 'application/gzip');
        }}
        className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        🗜️ Export Gzipped QCL
      </button>
    </div>
  );
}
