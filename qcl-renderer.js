export function renderHTML(ast) {
  const stateVars = ast.body
    .filter(n => n.type === "State")
    .map(n => `"${n.name}": ${JSON.stringify(n.value)}`)
    .join(",\n");

  const htmlContent = ast.body
    .filter(n => n.type !== "State")
    .map(renderNode)
    .join('\n');

  return `
<h1>${ast.title}</h1>
<div id="qcl-app"></div>

<script type="module">
  let state = {
    ${stateVars}
  };

  function run(code) {
    try {
      with (state) {
        eval(code);
      }
      render();
    } catch (err) {
      console.error('Action failed:', err);
      alert(err.message);
    }
  }

  function render() {
    const html = \`${htmlContent}\`;
    document.getElementById("qcl-app").innerHTML = html;
  }

  render();
</script>
`;
}

function renderNode(node) {
  const styles = [];
  const attrs = [];

  for (const [key, val] of Object.entries(node.props || {})) {
    if (key === 'bg') styles.push(`background:${val}`);
    if (key === 'padding') styles.push(`padding:${val}px`);
    if (key === 'size') styles.push(`font-size:${val}px`);
    if (key === 'weight') styles.push(`font-weight:${val}`);
    if (key === 'action') attrs.push(`onclick="run('${val}')"`);
  }

  const styleStr = styles.length ? ` style="${styles.join(';')}"` : '';
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  const content = (node.content || '')
    .replace(/\{(\w+)\}/g, (_, v) => `\${state["${v}"]}`);

  const children = (node.body || [])
    .map(renderNode)
    .join('\n');

  if (node.type === 'Box') return `<div${styleStr}>${children}</div>`;
  if (node.type === 'Text') return `<p${styleStr}>${content}${children}</p>`;
  if (node.type === 'Button') return `<button${attrStr}${styleStr}>${content}</button>`;

  return `<div${styleStr}>${content}${children}</div>`;
}
