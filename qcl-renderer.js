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
  const classes = [];
  const attrs = [];

  for (const [key, val] of Object.entries(node.props || {})) {
    if (key === 'bg') classes.push(`bg-[${val}]`);
    if (key === 'padding') classes.push(`p-[${val}px]`);
    if (key === 'size') classes.push(`text-[${val}px]`);
    if (key === 'weight') classes.push(val === 'bold' ? 'font-bold' : `font-[${val}]`);
    if (key === 'action') attrs.push(`onclick="window.run('${val.replace(/'/g, "\\'")}')"`);
  }

  const classStr = classes.length ? ` class="${classes.join(' ')}"` : '';
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  const content = (node.content || '')
    .replace(/\{(\w+)\}/g, (_, v) => `\${state["${v}"] !== undefined ? state["${v}"] : \`{${v}}\`}`);

  const children = (node.body || []).map(renderNode).join('\n');

  switch (node.type) {
    case 'Box':
      return `<div${classStr}>${children}</div>`;
    case 'Text':
      return `<p${classStr}>${content}${children}</p>`;
    case 'Button':
      return `<button${classStr}${attrStr}>${content}</button>`;
    default:
      return `<div${classStr}>${content}${children}</div>`;
  }
}

