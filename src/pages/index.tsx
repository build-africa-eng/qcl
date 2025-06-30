'use client';

import { useEffect } from 'react';
import { parseQCL } from '@/lib/qcl-parser';
import { renderHTML } from '@/lib/render';

const sampleQCL = `page title: Live QCL

state name: "Guest"
state count: 0

box bg: #f0f0f0
  text size: 18 : Hello, {name}!
  input name: name, placeholder: Enter your name
  text : Count: {count}
  button action: setState({ count: state.count + 1 }) : Add One
`;

export default function HomePage() {
  useEffect(() => {
    const ast = parseQCL(sampleQCL);
    const html = renderHTML(ast);
    const container = document.getElementById('qcl-container');
    if (container) container.innerHTML = html;
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">QCL App</h1>
        <div
          id="qcl-container"
          className="border rounded bg-white shadow p-6"
        >
          Loading QCL...
        </div>
      </div>
    </main>
  );
}
