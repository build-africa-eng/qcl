// qcl-parser.js

export function parseQCL(source) {
  const lines = source.trim().split('\n');
  let ast = {};
  let currentIndent = 0;
  let rootStack = [];

  function parsePropsAndContent(rest) {
    // Separate props from content using last colon
    const lastColon = rest.lastIndexOf(':');
    if (lastColon === -1) {
      return { props: {}, content: rest.trim() };
    }

    const propsPart = rest.slice(0, lastColon).trim();
    const content = rest.slice(lastColon + 1).trim();
    const props = {};

    const pairs = propsPart.split(',');
    for (let pair of pairs) {
      const [k, v] = pair.split(':').map(s => s?.trim());
      if (k && v) props[k] = v;
    }

    return { props, content };
  }

  for (let line of lines) {
    const indent = line.match(/^\s*/)[0].length;
    const trimmed = line.trim();

    if (trimmed.startsWith('page')) {
      const { props } = parsePropsAndContent(trimmed.slice(4));
      ast = { type: 'Page', title: props.title || '', body: [] };
      rootStack = [{ node: ast, indent }];
      continue;
    }

    if (trimmed.startsWith('state')) {
      const [name, value] = trimmed.slice(5).split(':').map(s => s.trim());
      const stateNode = { type: 'State', name, value };
      rootStack[rootStack.length - 1].node.body.push(stateNode);
      continue;
    }

    const [tag, rest] = trimmed.split(/\s(.+)/);
    const type = tag.charAt(0).toUpperCase() + tag.slice(1);
    const { props, content } = parsePropsAndContent(rest || '');

    const node = { type, props, content };
    if (type === 'Box' || type === 'List') node.body = [];

    // Determine nesting by indentation
    while (rootStack.length && indent <= rootStack[rootStack.length - 1].indent) {
      rootStack.pop();
    }

    const parent = rootStack[rootStack.length - 1];
    if (parent) {
      if (!parent.node.body) parent.node.body = [];
      parent.node.body.push(node);
    }

    if (node.body) {
      rootStack.push({ node, indent });
    }
  }

  return ast;
}
