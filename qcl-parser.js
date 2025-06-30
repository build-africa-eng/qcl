export function parseQCL(source) {
  const lines = source.split('\n').filter(line => line.trim() !== '');

  const root = { type: "Page", title: "", body: [] };
  const stack = [{ indent: -1, node: root }];

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
        stack[stack.length - 1].node.body.push({
          type: "State",
          name,
          value: /^\d+(\.\d+)?$/.test(value) ? Number(value) : value.replace(/^"(.*)"$/, '$1')
        });
      }
      continue;
    }

    const [tag] = line.split(/\s+/);
    const props = {};
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

    const node = {
      type: tag.charAt(0).toUpperCase() + tag.slice(1),
      props,
      content,
      body: []
    };

    while (stack.length && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    stack[stack.length - 1].node.body.push(node);
    stack.push({ indent, node });
  }

  return root;
}
