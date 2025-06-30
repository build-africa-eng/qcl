// src/lib/qcl-parser.ts
export type QCLNode = {
  type: string;
  title?: string;
  name?: string;
  value?: string | number;
  props?: Record<string, string>;
  content?: string;
  body?: QCLNode[];
};

export function parseQCL(source: string): QCLNode {
  const lines = source.split('\n').filter(line => line.trim() !== '');

  const root: QCLNode = { type: "Page", title: "", body: [] };
  const stack: { indent: number; node: QCLNode }[] = [{ indent: -1, node: root }];

  for (let rawLine of lines) {
    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();
    if (indent === -1) continue;

    if (line.startsWith('page ')) {
      const titleMatch = line.match(/title:\s*(.+)/);
      if (titleMatch) root.title = titleMatch[1].trim();
      continue;
    }

    if (line.startsWith('state ')) {
      const match = line.match(/^state (\w+):\s*(.+)$/);
      if (match) {
        const [, name, value] = match;
        const current = stack[stack.length - 1].node;
        if (!current.body) current.body = [];
        current.body.push({
          type: "State",
          name,
          value: /^\d+(\.\d+)?$/.test(value) ? Number(value) : value.replace(/^"(.*)"$/, '$1')
        });
      }
      continue;
    }

    const [tag] = line.split(/\s+/);
    const props: Record<string, string> = {};
    let content = '';

    if (line.includes(':')) {
      const [propPart, cont] = line.split(/:(.+)/);
      content = cont ? cont.trim() : '';
      const kvPairs = propPart.replace(tag, '').split(',').map(p => p.trim()).filter(Boolean);
      for (let pair of kvPairs) {
        const [k, v] = pair.split(':').map(p => p.trim());
        if (k && v) props[k] = v;
      }
    }

    const node: QCLNode = {
      type: tag.charAt(0).toUpperCase() + tag.slice(1),
      props,
      content,
      body: []
    };

    while (stack.length && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    if (!parent.body) parent.body = [];
    parent.body.push(node);
    stack.push({ indent, node });
  }

  return root;
}
