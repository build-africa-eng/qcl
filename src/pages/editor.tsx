import dynamic from 'next/dynamic';
import { useState } from 'react';
import { parseQCL } from '@/lib/qcl-parser';
import ThemeToggle from '@/components/ThemeToggle';
const QCLPreview = dynamic(() => import('@/components/QCLPreview'), { ssr: false });
import { ExportButtons } from '@/components/ExportButtons';
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

export default function EditorPage() {
  const [qcl, setQcl] = useState(defaultQCL);
  const ast = parseQCL(qcl);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold">QCL Live Editor</h1>
        <div className="flex gap-4">
          <ExportButtons
            qcl={qcl}
            html={`<html><body>${document?.getElementById('preview')?.innerHTML || ''}</body></html>`}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Editor + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <textarea
          value={qcl}
          onChange={e => setQcl(e.target.value)}
          className="w-full h-[500px] p-4 border rounded font-mono text-sm resize-none bg-gray-100 dark:bg-gray-800 dark:text-white"
        />

        <div
          id="preview"
          className="border rounded p-4 bg-white dark:bg-gray-800 shadow"
        >
          <QCLPreview ast={ast} />
        </div>
      </div>
    </div>
  );
}
