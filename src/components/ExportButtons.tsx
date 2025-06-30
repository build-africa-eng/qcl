// src/components/ExportButtons.tsx
export function ExportButtons({ qcl, html }: { qcl: string; html: string }) {
  const download = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => download(qcl, 'qcl-source.md', 'text/markdown')}
        className="px-3 py-1 border rounded bg-blue-100 dark:bg-blue-800"
      >
        📄 Export QCL
      </button>
      <button
        onClick={() => download(html, 'rendered.html', 'text/html')}
        className="px-3 py-1 border rounded bg-green-100 dark:bg-green-800"
      >
        🧾 Export HTML
      </button>
    </div>
  );
}
