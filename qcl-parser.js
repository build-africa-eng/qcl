export function parseQCL(source) {
  const lines = source.split('\n').map(line => line.trim()).filter(Boolean);

  const ast = { type: "Page", title: "", body: [] };
  let currentIndent = 0;
  let stack = [ast];

  for (let line of lines) {
    if (line.startsWith("page ")) {
      const titleMatch = line.match(/title:\s*(.+)/);
      if (titleMatch) ast.title = titleMatch[1].trim();
      continue;
    }

    if (line.startsWith("state ")) {
      const [, name, rawValue] = line.match(/^state\s+(\w+):\s+(.+)$/);
      const value = /^\d+(\.\d+)?$/.test(rawValue.trim()) ? Number(rawValue) : rawValue.trim();
      stack[stack.length - 1].body.push({ type: "State", name, value });
      continue;
    }

    const [tag, ...rest] = line.split(/\s+/);
    const afterColon = line.split(':');
    const lastPart = afterColon.slice(1).join(':').trim();

    const props = {};
    const propStr = rest.join(' ').split(',').map(p => p.trim());
    for (let pair of propStr) {
      if (pair.includes(':')) {
        const [k, v] = pair.split(':').map(s => s.trim());
        props[k] = v;
      }
    }

    const node = {
      type: tag.charAt(0).toUpperCase() + tag.slice(1),
      props,
      content: lastPart
    };

    stack[stack.length - 1].body.push(node);
  }

  return ast;
}
