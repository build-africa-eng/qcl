// qcl-parser.js

export function parseQCL(source) {
  const lines = source.trim().split('\n');
  let ast = {};
  let currentIndent = 0;
  let currentParent = null;
  let rootStack = [];

  function parseProps(raw) {
    const props = {};
    const parts = raw.split(',');
    for (const part of parts) {
      const [key, value] = part.split(':').map(s => s.trim());
      if (key && value) props[key] = value;
    }
    return props;
  }

  for (let line of lines) {
    const indent = line.match(/^\s*/)[0].length;
    const trimmed = line.trim();

    if (trimmed.startsWith('page')) {
      const [, rest] = trimmed.split('page');
      const props = parseProps(rest);
      ast = { type: 'Page', title: props.title || '', body: [] };
      currentParent = ast;
      currentIndent = indent;
      rootStack = [ast];
    } else {
      const [tagAndProps, ...contentParts] = trimmed.split(':');
      const content = contentParts.join(':').trim();
      const [tag, rawProps = ''] = tagAndProps.split(/\s(.+)/);

      const node = {
        type: tag.charAt(0).toUpperCase() + tag.slice(1),
        props: parseProps(rawProps),
        content
      };

      // Determine where to place the node based on indent level
      if (indent > currentIndent) {
        const last = rootStack[rootStack.length - 1];
        if (!last.body) last.body = [];
        last.body.push(node);
        rootStack.push(node);
        currentIndent = indent;
      } else {
        // Pop until we're back at the right level
        while (indent < currentIndent && rootStack.length > 1) {
          rootStack.pop();
          currentIndent -= 2;
        }
        const parent = rootStack[rootStack.length - 1];
        if (!parent.body) parent.body = [];
        parent.body.push(node);
      }
    }
  }

  return ast;
}
