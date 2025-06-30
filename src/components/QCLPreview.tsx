'use client';

import React from 'react';
import { QCLNode } from '@/lib/qcl-parser';

type Props = {
  ast: QCLNode;
};

export default function QCLPreview({ ast }: Props) {
  const renderNode = (node: QCLNode, index: number) => {
    const { type, name, value, props = {}, content = '', body = [] } = node;

    switch (type.toLowerCase()) {
      case 'text':
        return (
          <p key={index} className="mb-2 text-gray-800 dark:text-gray-200 text-base">
            {interpolate(content, ast)}
          </p>
        );

      case 'input':
        return (
          <div key={index} className="mb-4">
            <input
              name={props.name}
              placeholder={props.placeholder || ''}
              className="border px-2 py-1 rounded w-full"
              disabled
            />
          </div>
        );

      case 'select':
        return (
          <div key={index} className="mb-4">
            <select name={props.name} className="border px-2 py-1 rounded w-full" disabled>
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled
          >
            {interpolate(content, ast)}
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

      case 'state':
        // states are handled globally; no UI rendered directly
        return null;

      default:
        return null;
    }
  };

  return (
    <div>
      {ast?.body?.map((node, index) => renderNode(node, index))}
    </div>
  );
}

// Very basic template variable replacement: replaces {name} with value from state
function interpolate(template: string, ast: QCLNode): string {
  const stateMap: Record<string, string | number> = {};

  for (const node of ast.body || []) {
    if (node.type.toLowerCase() === 'state' && node.name) {
      stateMap[node.name] = node.value ?? '';
    }
  }

  return template.replace(/\{(\w+)\}/g, (_, key) => String(stateMap[key] ?? `{${key}}`));
}
