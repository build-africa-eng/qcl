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

    // === Page title ===
    if (line.startsWith('page ')) {
      const titleMatch = line.match(/title:\s*(.+)/);
      if (titleMatch) root.title = titleMatch[1].trim();
      continue;
    }

    // === State variable ===
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

    // === Component definition ===
    if (line.startsWith('component ')) {
      const match = line.match(/^component (\w+)\s*(.*)$/);
      if (match) {
        const [, name, argsStr] = match;
        currentComponent = {
          name,
          args: argsStr.split(',').map(s => s.trim()).filter(Boolean),
          body: [],
        };
        stack.push({ indent, node: { type: 'ComponentDef', body: currentComponent.body } });
      }
      continue;
    }

    // === If inside a component body ===
    if (currentComponent) {
      while (stack.length && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }
      const parent = stack[stack.length - 1].node;
      if (!parent.body) parent.body = [];

      const node = parseNode(line, indent);
      parent.body.push(node);
      stack.push({ indent, node });
      continue;
    }

    // === End component def ===
    if (currentComponent && indent <= stack[stack.length - 1].indent) {
      const { name, args, body } = currentComponent;
      components[name] = {
        args,
        body: JSON.parse(JSON.stringify(body)),
      };
      currentComponent = null;
      continue;
    }

    // === Outside: parse regular tag or component ===
    const node = parseNode(line, indent);

    // Collect children until indent increases again
    while (stack.length && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    if (!parent.body) parent.body = [];
    parent.body.push(node);

    // === If it's a known component, inject props and slots ===
    if (components[node.type]) {
      const def = components[node.type];

      // Group children by slot name
      const slotGroups: Record<string, QCLNode[]> = {};
      for (const child of node.body || []) {
        const slot = child.slotName || '_default';
        if (!slotGroups[slot]) slotGroups[slot] = [];
        slotGroups[slot].push(child);
      }

      const clone = JSON.parse(JSON.stringify(def.body));
      const injected = injectProps(clone, node.props || {}, slotGroups);
      node.body = injected;
    }

    stack.push({ indent, node });
  }

  return root;
}

// === Parse a line into a node ===
function parseNode(line: string, indent: number): QCLNode {
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

  if (tag.toLowerCase() === 'slot' && props.name) {
    node.slotName = props.name;
  }

  return node;
}

// === Inject props + slot content ===
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

    return {
      ...node,
      content: node.content?.replace(/\{(\w+)\}/g, (_, key) => `{${props[key] || key}}`),
      props: Object.fromEntries(
        Object.entries(node.props || {}).map(([k, v]) => [k, props[v] || v])
      ),
      body: node.body ? node.body.map(traverse) : [],
    };
  };

  return body.map(traverse);
}
