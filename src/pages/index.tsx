import { useEffect, useState } from 'react';
import { parseQCL } from '@/lib/qcl-parser';
import { renderHTML } from '@/lib/qcl-renderer';

export default function HomePage() {
  const [output, setOutput] = useState('<p>Loading QCL...</p>');

  useEffect(() => {
    async function loadQCL() {
      try {
        const res = await fetch('/pages/index.qcl');
        const source = await res.text();
        const ast = parseQCL(source);
        const html = renderHTML(ast);
        setOutput(html);
      } catch (err: any) {
        setOutput(`<pre class="text-red-600">QCL Error:\n${err.message}</pre>`);
        console.error('❌ QCL Error:', err);
      }
    }
    loadQCL();
  }, []);

  return (
    <main className="max-w-2xl mx-auto">
      <div dangerouslySetInnerHTML={{ __html: output }} />
    </main>
  );
}
