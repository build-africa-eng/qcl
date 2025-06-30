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
      onClick={async () => {
  try {
    const res = await fetch('https://termbin.com:9999', {
      method: 'POST',
      body: qcl,
    });

    const url = await res.text();
    const cleanUrl = url.trim();
    setShareUrl(cleanUrl);
    alert('QCL pasted to:\n' + cleanUrl);
    navigator.clipboard.writeText(cleanUrl);
  } catch (err) {
    alert('Failed to upload to termbin.');
    console.error(err);
  }
}}
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
            <button
        onClick={async () => {
          try {
            const res = await fetch('https://termbin.com:9999', {
              method: 'POST',
              body: qcl,
            });

            const url = await res.text();
            alert('QCL pasted to:\n' + url);
            navigator.clipboard.writeText(url);
          } catch (err) {
            alert('Failed to upload to termbin.');
            console.error(err);
          }
        }}
        className="px-3 py-1 border rounded bg-purple-100 dark:bg-purple-800 dark:text-white hover:bg-purple-200 dark:hover:bg-purple-700"
      >
        🔗 Share via Paste
      </button>
      {shareUrl && (
  <div className="mt-4 text-center w-full">
    <p className="text-sm text-gray-800 dark:text-gray-200">
      📎 Shared URL: <a href={shareUrl} target="_blank" rel="noreferrer" className="underline">{shareUrl}</a>
    </p>
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
      alt="QR Code"
      className="mx-auto mt-2"
    />
  </div>
)}

    </div>
  );
}
