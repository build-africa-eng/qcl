// qcl-renderer.js

export function renderHTML(ast) {
  const state = {};
  const html = [];

  // Inline styles helper
  function styleFromProps(props) {
    const css = [];
    if (props.bg) css.push(`background:${props.bg}`);
    if (props.padding) css.push(`padding:${props.padding}px`);
    if (props.size) css.push(`font-size:${props.size}px`);
    if (props.weight) css.push(`font-weight:${props.weight}`);
    return css.join(';');
  }

  function renderNode(node) {
    switch (node.type) {
      case 'State':
        state[node.name] = node.value;
        return '';

      case 'Text':
        return `<p style="${styleFromProps(node.props)}">${bindText(node.content)}</p>`;

      case 'Box':
        const children = (node.body || []).map(renderNode).join('\n');
        return `<div style="${styleFromProps(node.props)}">${children}</div>`;

      case 'Button':
        const action = node.props.action || '';
        return `<button onclick="run('${action}')" style="${styleFromProps(node.props)}">${bindText(node.content)}</button>`;

      default:
        return '';
    }
  }

  function bindText(text) {
    return text.replace(/{(\w+)}/g, (_, key) => `\${state["${key}"]}`);
  }

  const rendered = ast.body.map(renderNode).join('\n');

  // Final HTML + JS
  return `
<h1>${ast.title}</h1>
<div id="qcl-app"></div>

<script type="module">
  let state = ${JSON.stringify(state, null, 2)};
  function run(code) {
    try {
      eval(code);
      render();
    } catch (e) {
      console.error('Action failed:', e);
    }
  }
  function render() {
    const html = \`${rendered}\`;
    document.getElementById('qcl-app').innerHTML = html;
  }
  render();
</script>
`;
}
