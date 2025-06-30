'use client';

import { useState } from 'react';
import { QCLNode } from '@/lib/qcl-parser';
import { gzip } from 'pako';
import { QRCodeCanvas } from 'qrcode.react';

type Props = {
  qcl: string;
  html: string;
  ast?: QCLNode;
};

export function ExportButtons({ qcl, html, ast }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const download = (data: string | Uint8Array, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast(`⬇️ Downloaded ${filename}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setToast('📋 Copied to clipboard!');
    setTimeout(() => setCopied(false), 1500);
  };

  const showToast = toast && (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50 text-sm animate-fadeIn">
      {toast}
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2 mt-4 relative">
      {showToast}
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
            setToast('🔗 Uploaded to Termbin!');
            navigator.clipboard.writeText(cleanUrl);
          } catch (err) {
            console.error(err);
            setToast('❌ Failed to upload to Termbin');
          }
        }}
        className="px-3 py-1 border rounded bg-purple-100 dark:bg-purple-800 dark:text-white hover:bg-purple-200 dark:hover:bg-purple-700"
      >
        🔗 Share via Paste
      </button>

      {shareUrl && (
        <div className="mt-4 text-center w-full">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            📎 Shared URL:{' '}
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="underline break-all"
            >
              {shareUrl}
            </a>
            <button
              onClick={() => copyToClipboard(shareUrl)}
              className="ml-2 text-xs px-2 py-0.5 border rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
          </p>
          <div className="flex justify-center mt-2">
            <QRCodeCanvas value={shareUrl} size={150} />
          </div>
        </div>
      )}
    </div>
  );
}
