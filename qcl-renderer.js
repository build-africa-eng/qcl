export function renderHTML(ast) {
  const stateVars = ast.body
    .filter(n => n.type === 'State')
    .map(n => `"${n.name}": ${JSON.stringify(n.value)}`)
    .join(',\n');

  const htmlContent = ast.body
    .filter(n => n.type !== 'State')
    .map(node => renderNode(node))
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>${ast.title}</title>
  <style>
    .box { display: block; }
    .button:hover { cursor: pointer; }
  </style>
</head>
<body>
  <div id="qcl-app">${htmlContent}</div>
  <script>
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
        alert('Error: ' + err.message);
      }
    }

    function render() {
      const html = \`${htmlContent.replace(/\{(\w+)\}/g, (_, v) => `\${state["${v}"]}`)}\`;
      document.getElementById('qcl-app').innerHTML = html;
    }

    render();
  </script>
</body>
</html>
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
    if (key === 'hover') styles.push(`:hover {background:${val}}`);
    if (key === 'action') attrs.push(`onclick="run('${val.replace(/'/g, "\\'")}')"`);
  }

  const styleStr = styles.length ? ` style="${styles.join(';')}"` : '';
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
  const content = (node.content || '').replace(/\{(\w+)\}/g, (_, v) => `<span data-bind="${v}">${state[v] || ''}</span>`);
  const children = (node.body || []).map(renderNode).join('\n');

  if (node.type === 'Box') return `<div class="box"${styleStr}>${content}${children}</div>`;
  if (node.type === 'Text') return `<p${styleStr}>${content}${children}</p>`;
  if (node.type === 'Button') return `<button${styleStr}${attrStr}>${content}${children}</button>`;
  return `<div${styleStr}${attrStr}>${content}${children}</div>`;
}
