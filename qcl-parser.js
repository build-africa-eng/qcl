export function parseQCL(source) {
  const lines = source.split('\n').filter(line => line.trim());
  const root = { type: 'Page', title: '', body: [] };
  const stack = [{ indent: -1, node: root }];

  for (let rawLine of lines) {
    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();

    // Handle 'page' node
    if (line.startsWith('page ')) {
      const titleMatch = line.match(/title:\s*(.+)/);
      if (titleMatch) root.title = titleMatch[1].trim();
      continue;
    }

    // Handle 'state' node
    if (line.startsWith('state ')) {
      const [, name, value] = line.match(/^state (\w+):\s*(.+)$/);
      stack[stack.length - 1].node.body.push({
        type: 'State',
        name,
        value: /^\d/.test(value) ? Number(value) : value
      });
      continue;
    }

    // Handle elements (box, text, button, etc.)
    const [tag, ...rest] = line.split(/\s+/);
    const props = {};
    let content = '';

    if (rest.length && rest.join(' ').includes(':')) {
      const [propPart, cont] = rest.join(' ').split(/:(.+)/);
      content = cont ? cont.trim() : '';
      const kvPairs = propPart.split(',').map(p => p.trim()).filter(Boolean);
      for (let pair of kvPairs) {
        const [k, v] = pair.split(':').map(p => p.trim());
        if (k && v) props[k] = v;
      }
    } else {
      content = rest.join(' ').trim();
    }

    const node = {
      type: tag.charAt(0).toUpperCase() + tag.slice(1),
      props,
      content,
      body: []
    };

    // Pop stack until correct parent is found
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    stack[stack.length - 1].node.body.push(node);
    stack.push({ indent, node });
  }

  return root;
}
