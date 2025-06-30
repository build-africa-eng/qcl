import type { QCLNode } from './qcl-parser';

export function renderHTML(ast: QCLNode): string {
  const stateVars = (ast.body || [])
    .filter(n => n.type === "State")
    .map(n => (n.name ? `"${n.name}": ${JSON.stringify(n.value)}` : ''))
    .filter(Boolean)
    .join(",\n");

  const htmlContent = (ast.body || [])
    .filter(n => n.type !== "State")
    .map(renderNode)
    .join('\n');

  return `
    <h1 class="text-2xl font-bold mb-6">${ast.title}</h1>
    <div id="qcl-app"></div>
    <script type="module">
      (() => {
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
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'Action failed: ' + err.message;
            errorDiv.style.color = 'red';
            document.getElementById('qcl-app').appendChild(errorDiv);
          }
        }
        window.run = run;

        function render() {
          const html = \`${htmlContent}\`;
          document.getElementById("qcl-app").innerHTML = html;
        }

        render();
      })();
    <\/script>
  `;
}

function renderNode(node: QCLNode): string {
  const styles: string[] = [];
  const attrs: string[] = [];

  for (const [key, val] of Object.entries(node.props || {})) {
    if (key === 'bg') styles.push(`background-color:${val}`);
    if (key === 'padding') styles.push(`padding:${val}px`);
    if (key === 'size') styles.push(`font-size:${val}px`);
    if (key === 'weight') styles.push(`font-weight:${val}`);
    if (key === 'action') attrs.push(`onclick="window.run('${val.replace(/'/g, "\\'")}')"`);
  }

  const styleStr = styles.length ? ` style="${styles.join(';')}"` : '';
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  const rawContent = (node.content || '').replace(/`/g, '\\`');
  const content = rawContent.replace(/\{(\w+)\}/g, (_, v) => `\${state["${v}"] !== undefined ? state["${v}"] : \`{${v}}\`}`);
  const children = (node.body || []).map(renderNode).join('\n');

  switch (node.type) {
    case 'Box':
      return `<div${styleStr} class="rounded p-4 shadow-sm mb-4">${children}</div>`;
    case 'Text':
      return `<p${styleStr} class="mb-2">${content}${children}</p>`;
    case 'Button':
      return `<button${attrStr} class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">${content}</button>`;
    default:
      return `<div${styleStr}>${content}${children}</div>`;
  }
}
