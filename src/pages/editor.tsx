'use client';

import { useEffect, useState, useRef } from 'react';
import { parseQCL } from '@/lib/qcl-parser';
import QCLPreview from '@/components/QCLPreview';
import ThemeToggle from '@/components/ThemeToggle';
import { ExportButtons } from '@/components/ExportButtons';
import type { QCLNode } from '@/lib/qcl-parser';

const STORAGE_KEY = 'qcl-live-editor';

export default function EditorPage() {
  const [qcl, setQcl] = useState('');
  const [ast, setAst] = useState<QCLNode | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved || defaultQCL;
    setQcl(initial);
    setAst(parseQCL(initial));
  }, []);

  // Re-parse AST and store QCL on change
  useEffect(() => {
    try {
      setAst(parseQCL(qcl));
      localStorage.setItem(STORAGE_KEY, qcl);
    } catch (e) {
      console.error('QCL parse error:', e);
    }
  }, [qcl]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQcl(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([qcl], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'my-qcl.qcl';
    link.click();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">QCL Live Editor</h1>
          <ThemeToggle />
        </div>

        <textarea
          value={qcl}
          onChange={(e) => setQcl(e.target.value)}
          className="w-full h-[500px] p-4 border rounded font-mono text-sm resize-none bg-white dark:bg-gray-800 dark:text-white"
        />

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".qcl,.txt"
            onChange={handleUpload}
            className="text-sm file:mr-4 file:px-4 file:py-2 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download QCL
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div
          ref={previewRef}
          className="border rounded p-4 shadow bg-white dark:bg-gray-800"
        >
          {ast && <QCLPreview ast={ast} />}
        </div>

        {ast && (
          <ExportButtons
            qcl={qcl}
            html={previewRef.current?.innerHTML || ''}
            ast={ast}
          />
        )}
      </div>
    </div>
  );
}

const defaultQCL = `page title: Live Editor

state count: 0
state name: "Guest"
state mood: "happy"

box bg: #f0f0f0
  text size: 18 : Hello, {name}! You look {mood}.
  input name: name, placeholder: Your name
  select name: mood, options: happy, tired, excited
  text : Count is {count}
  button action: setState({ count: state.count + 1 }) : Add 1
`;
