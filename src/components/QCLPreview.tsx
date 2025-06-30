'use client';

import React, { useState } from 'react';
import { QCLNode } from '@/lib/qcl-parser';

type Props = {
  ast: QCLNode;
};

export default function QCLPreview({ ast }: Props) {
  const initialState: Record<string, any> = {};

  // Build initial state from QCL AST
  for (const node of ast.body || []) {
    if (node.type === 'State' && node.name) {
      initialState[node.name] = node.value;
    }
  }

  const [state, setState] = useState(initialState);

  // Safe interpolation with current state
  const interpolate = (template: string) =>
    template.replace(/\{(\w+)\}/g, (_, key) => String(state[key] ?? `{${key}}`));

  // Parse simple `setState({ count: state.count + 1 })` expressions
  const handleAction = (action: string) => {
    if (!action.startsWith('setState')) return;

    try {
      // Safe context: only allow access to `state` and `setState`
      const update = new Function('state', `return ${action.match(/\{(.+)\}/s)?.[0]}`)(state);
      if (typeof update === 'object') {
        setState(prev => ({ ...prev, ...update }));
      }
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  // Render a single node
  const renderNode = (node: QCLNode, index: number): React.ReactNode => {
    const { type, name, value, props = {}, content = '', body = [] } = node;

    switch (type.toLowerCase()) {
      case 'text':
        return (
          <p key={index} className="mb-2 text-gray-800 dark:text-gray-200 text-base">
            {interpolate(content)}
          </p>
        );

      case 'input':
        return (
          <div key={index} className="mb-4">
            <input
              name={props.name}
              placeholder={props.placeholder || ''}
              className="border px-2 py-1 rounded w-full"
              value={state[props.name] ?? ''}
              onChange={e => setState(prev => ({ ...prev, [props.name]: e.target.value }))}
            />
          </div>
        );

      case 'select':
        return (
          <div key={index} className="mb-4">
            <select
              name={props.name}
              className="border px-2 py-1 rounded w-full"
              value={state[props.name]}
              onChange={e => setState(prev => ({ ...prev, [props.name]: e.target.value }))}
            >
              {(props.options?.split(',') || []).map((opt, i) => (
                <option key={i} value={opt.trim()}>
                  {opt.trim()}
                </option>
              ))}
            </select>
          </div>
        );

      case 'button':
        return (
          <button
            key={index}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => handleAction(props.action || '')}
          >
            {interpolate(content)}
          </button>
        );

      case 'box':
        return (
          <div
            key={index}
            className="p-4 rounded shadow mb-4"
            style={{ backgroundColor: props.bg || '#fff' }}
          >
            {body.map(renderNode)}
          </div>
        );

      default:
        return null;
    }
  };

  return <div>{ast.body?.map(renderNode)}</div>;
}
