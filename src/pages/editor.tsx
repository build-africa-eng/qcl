import { useEffect, useState, useRef } from 'react';
import { parseQCL } from '@/lib/qcl-parser';
import QCLPreview from '@/components/QCLPreview';
import ThemeToggle from '@/components/ThemeToggle';
import { ExportButtons } from '@/components/ExportButtons';

const STORAGE_KEY = 'qcl-live-editor';

export default function EditorPage() {
  const [qcl, setQcl] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setQcl(saved || defaultQCL);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, qcl);
  }, [qcl]);

  const ast = parseQCL(qcl);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <textarea
        value={qcl}
        onChange={e => setQcl(e.target.value)}
        className="w-full h-[500px] p-4 border rounded font-mono text-sm resize-none"
      />
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">QCL Live Editor</h1>
        <ThemeToggle />
      </div>
      <div className="border rounded p-4 bg-white shadow space-y-4">
        <div ref={previewRef}>
          <QCLPreview ast={ast} />
        </div>
        <ExportButtons
          qcl={qcl}
          html={previewRef.current?.innerHTML || ''}
          ast={ast}
        />
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
