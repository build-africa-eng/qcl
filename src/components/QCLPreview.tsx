import React, { useState } from 'react';
import type { QCLNode } from '@/lib/qcl-parser';

type QCLState = Record<string, string | number>;

export default function QCLPreview({ ast }: { ast: QCLNode }) {
  const initialState = Object.fromEntries(
    (ast.body || [])
      .filter(n => n.type === 'State' && typeof n.name === 'string')
      .map(n => [n.name as string, n.value ?? ''])
  );

  const [state, setState] = useState<QCLState>(initialState);

  const run = (code: string) => {
    try {
      const scopedEval = new Function('state', 'setState', `with(state) { ${code} }`);
      scopedEval({ ...state }, (newState: QCLState) => setState(prev => ({ ...prev, ...newState })));
    } catch (e) {
      console.error('Action failed:', e);
      alert('Action failed: ' + (e as Error).message);
    }
  };

  const handleStateChange = (key: string, value: string | number) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const renderNode = (node: QCLNode): React.ReactNode => {
    if (!node) return null;

    const props = node.props || {};
    const children = (node.body || []).map((child, i) => <React.Fragment key={i}>{renderNode(child)}</React.Fragment>);

    const dynamicText = (node.content || '').replace(/\{(\w+)\}/g, (_, v) => `${state[v] ?? `{${v}}`}`);

    switch (node.type) {
      case 'Box':
        return (
          <div
            className="rounded p-4 shadow-sm mb-4"
            style={{ backgroundColor: props.bg, padding: props.padding ? `${props.padding}px` : undefined }}
          >
            {children}
          </div>
        );

      case 'Text':
        return (
          <p className="mb-2" style={{ fontSize: props.size ? `${props.size}px` : undefined, fontWeight: props.weight }}>
            {dynamicText}
            {children}
          </p>
        );

      case 'Button':
        return (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => props.action && run(props.action)}
          >
            {dynamicText}
          </button>
        );

      case 'Input':
        return (
          <input
            className="border px-2 py-1 rounded"
            type={props.type || 'text'}
            value={state[props.name] ?? ''}
            placeholder={props.placeholder}
            onChange={(e) => handleStateChange(props.name, e.target.value)}
          />
        );

      case 'Select':
        const options = (props.options || '').split(',').map(s => s.trim());
        return (
          <select
            className="border px-2 py-1 rounded"
            value={state[props.name] ?? ''}
            onChange={(e) => handleStateChange(props.name, e.target.value)}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      default:
        return <div>{dynamicText}{children}</div>;
    }
  };

  return (
    <div className="space-y-4">
      {ast.title && <h1 className="text-2xl font-bold text-gray-800">{ast.title}</h1>}
      {ast.body?.filter(n => n.type !== 'State').map((node, index) => (
        <React.Fragment key={index}>{renderNode(node)}</React.Fragment>
      ))}
      <details className="mt-4 border-t pt-2 text-sm text-gray-600">
        <summary className="cursor-pointer">🔍 State Inspector</summary>
        <pre className="bg-gray-100 rounded p-2 mt-2 text-xs overflow-auto">{JSON.stringify(state, null, 2)}</pre>
      </details>
    </div>
  );
}
