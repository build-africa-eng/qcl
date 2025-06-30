export function parseQCL(source) {
  const lines = source.split('\n').filter(Boolean);

  const root = { type: "Page", title: "", body: [] };
  const stack = [{ indent: -1, node: root }];

  for (let rawLine of lines) {
    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();

    if (line.startsWith('page ')) {
      const titleMatch = line.match(/title:\s*(.+)/);
      if (titleMatch) root.title = titleMatch[1].trim();
      continue;
    }

    if (line.startsWith('state ')) {
      const [, name, value] = line.match(/^state (\w+):\s*(.+)$/);
      stack[stack.length - 1].node.body.push({
        type: "State",
        name,
        value: /^\d/.test(value) ? Number(value) : value
      });
      continue;
    }

    const [tag, ...rest] = line.split(/\s+/);
    const props = {};
    let content = '';

    if (line.includes(':')) {
      const [propPart, cont] = line.split(/:(.+)/);
      content = cont.trim();

      const kvPairs = propPart
        .replace(tag, '')
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

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
