import { useState } from 'react';
import { parseQCL } from '@/lib/qcl-parser';
import QCLPreview from '@/components/QCLPreview';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <textarea
        value={qcl}
        onChange={e => setQcl(e.target.value)}
        className="w-full h-[500px] p-4 border rounded font-mono text-sm resize-none"
      />
      <div className="border rounded p-4 bg-white shadow">
        <QCLPreview ast={ast} />
      </div>
    </div>
  );
}
