'use client';

import { useEffect, useState } from 'react';
import { parseQCL } from '@/lib/qcl-parser';
import { renderHTML } from '@/lib/qcl-renderer';

export default function Home() {
  const [html, setHtml] = useState('<div>Loading QCL...</div>');

  useEffect(() => {
    fetch('/pages/index.qcl')
      .then((res) => res.text())
      .then((source) => {
        const ast = parseQCL(source);
        const rendered = renderHTML(ast);
        setHtml(rendered);
      })
      .catch((err) => {
        console.error('❌ QCL Error:', err);
        setHtml(`<pre style="color:red;">QCL Error: ${err.message}</pre>`);
      });
  }, []);

  return <div id="qcl-container" dangerouslySetInnerHTML={{ __html: html }} />;
}
