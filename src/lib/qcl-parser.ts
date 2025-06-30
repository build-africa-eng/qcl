// src/lib/qcl-parser.ts
export type QCLNode = {
  type: string;
  title?: string;
  name?: string;
  value?: string | number;
  props?: Record<string, string>;
  content?: string;
  body?: QCLNode[];
  slotName?: string; 
};

export function parseQCL(source: string): QCLNode {
  const lines = source.split('\n').filter(line => line.trim() !== '');

  const root: QCLNode = { type: 'Page', title: '', body: [] };
  const stack: { indent: number; node: QCLNode }[] = [{ indent: -1, node: root }];
  const components: Record<string, { args: string[]; body: QCLNode[] }> = {};

  let currentComponent: { name: string; args: string[]; body: QCLNode[] } | null = null;

  for (let rawLine of lines) {
    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();
    if (indent === -1) continue;

    // === Handle page title ===
    if (line.startsWith('page ')) {
      const titleMatch = line.match(/title:\s*(.+)/);
      if (titleMatch) root.title = titleMatch[1].trim();
      continue;
    }

    // === Handle state ===
    if (line.startsWith('state ')) {
      const match = line.match(/^state (\w+):\s*(.+)$/);
      if (match) {
        const [, name, value] = match;
        const current = stack[stack.length - 1].node;
        if (!current.body) current.body = [];
        current.body.push({
          type: 'State',
          name,
          value: /^\d+(\.\d+)?$/.test(value) ? Number(value) : value.replace(/^"(.*)"$/, '$1'),
        });
      }
      continue;
    }

    // === Start a component ===
    if (line.startsWith('component ')) {
      const match = line.match(/^component (\w+)\s*(.*)$/);
      if (match) {
        const [, name, argsStr] = match;
        currentComponent = { name, args: argsStr.split(',').map(s => s.trim()).filter(Boolean), body: [] };
        stack.push({ indent, node: { type: 'ComponentDef', body: currentComponent.body } });
      }
      continue;
    }

    // === If we're in a component def, handle its body ===
    if (currentComponent) {
      while (stack.length && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }
      const parent = stack[stack.length - 1].node;
      if (!parent.body) parent.body = [];

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
        body: [],
      };

      parent.body.push(node);
      stack.push({ indent, node });
      continue;
    }

// === End component def ===
if (currentComponent && indent <= stack[stack.length - 1].indent) {
  const { name, args, body } = currentComponent;
  components[name] = {
    args,
    body: JSON.parse(JSON.stringify(body)), // deep copy
  };
  currentComponent = null;
  continue;
}

    // === Handle regular tag or component usage ===
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
    // Detect slot name (for slot nodes or usage)
if (tag.toLowerCase() === 'slot' && props.name) {
  node.slotName = props.name;
}

    const node: QCLNode = {
      type: tag.charAt(0).toUpperCase() + tag.slice(1),
      props,
      content,
      body: [],
    };

  // === If it's a known component, expand ===
if (components[tag]) {
  const def = components[tag];

  // Group children by slot name (default is '_default')
  const slotGroups: Record<string, QCLNode[]> = {};
  for (const child of node.body || []) {
    const slot = child.slotName || '_default';
    if (!slotGroups[slot]) slotGroups[slot] = [];
    slotGroups[slot].push(child);
  }

  const clone = JSON.parse(JSON.stringify(def.body));
  const injected = injectProps(clone, props, slotGroups);
  node.body = injected;
}

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

// Replace {name} with props["name"] inside component body
function injectProps(
  body: QCLNode[],
  props: Record<string, string>,
  slotGroups: Record<string, QCLNode[]> = {}
): QCLNode[] {
  const traverse = (node: QCLNode): QCLNode => {
    if (node.type === 'Slot') {
  const slot = node.slotName || '_default';
  return {
    type: 'SlotWrapper',
    body: (slotGroups[slot] || []).map(traverse),
  };
}

    const newNode: QCLNode = {
      ...node,
      content: node.content?.replace(/\{(\w+)\}/g, (_, key) => `{${props[key] || key}}`),
      props: Object.fromEntries(
        Object.entries(node.props || {}).map(([k, v]) => [k, props[v] || v])
      ),
      body: node.body ? node.body.map(traverse) : [],
    };
    return newNode;
  };

  return body.map(traverse);
}

