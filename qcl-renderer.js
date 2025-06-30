// qcl-renderer.js

export function renderHTML(ast) {
  const state = {};
  const html = [];

  // Inline styles from props
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
        return `<p style="${styleFromProps(node.props)}">${bind(node.content)}</p>`;

      case 'Box':
        const boxChildren = (node.body || []).map(renderNode).join('\n');
        return `<div style="${styleFromProps(node.props)}">${boxChildren}</div>`;

      case 'Button':
        return `<button onclick="run('${node.props.action}')" style="${styleFromProps(node.props)}">${bind(node.content)}</button>`;

      default:
        return '';
    }
  }

  function bind(text) {
    return text.replace(/{(\w+)}/g, (_, key) => `\${state["${key}"]}`);
  }

  const renderedHTML = ast.body.map(renderNode).join('\n');

  return `
<h1>${ast.title}</h1>
<div id="qcl-app"></div>

<script type="module">
  let state = ${JSON.stringify(state, null, 2)};

  function run(code) {
    try {
      eval(code);
      render();
    } catch (err) {
      console.error('Action failed:', err);
    }
  }

  function render() {
    const html = \`${renderedHTML}\`;
    document.getElementById('qcl-app').innerHTML = html;
  }

  render();
</script>
  `;
}
