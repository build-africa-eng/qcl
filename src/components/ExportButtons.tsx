'use client';

type Props = {
  qcl: string;
  html: string;
};

export function ExportButtons({ qcl, html }: Props) {
  const download = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url); // Clean up
  };

  return (
    <div className="flex gap-2 mt-4">
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
    </div>
  );
}
