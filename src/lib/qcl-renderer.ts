import type { QCLNode } from './qcl-parser';

export function renderHTML(ast: QCLNode): string {
  const stateVars = (ast.body || [])
    .filter(n => n.type === "State" && typeof n.name === "string")
    .map(n => `"${n.name}": ${JSON.stringify(n.value)}`)
    .join(",\n");

  const htmlContent = (ast.body || [])
    .filter(n => n.type !== "State")
    .map(renderNode)
    .join('\n');

  return `
    <h1 class="text-2xl font-bold mb-6">${escapeHTML(ast.title || '')}</h1>
    <div id="qcl-app"></div>
    <script type="module">
      const state = {
        ${stateVars}
      };

      function render() {
        const html = \`${htmlContent}\`;
        document.getElementById("qcl-app").innerHTML = html;
        bindInputs();
      }

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

      function bindInputs() {
        document.querySelectorAll('[data-bind]').forEach(el => {
          const name = el.getAttribute('data-bind');
          if (!name) return;

          el.value = state[name] || '';
          el.oninput = e => {
            state[name] = e.target.value;
            render();
          };
        });

        document.querySelectorAll('[data-select]').forEach(el => {
          const name = el.getAttribute('data-select');
          el.value = state[name] || '';
          el.onchange = e => {
            state[name] = e.target.value;
            render();
          };
        });
      }

      window.run = run;
      render();
    <\/script>
  `;
}

function safeEval(expr: string, state: Record<string, any>) {
  try {
    return Function('state', `with (state) { return (${expr}); }`)(state);
  } catch (e) {
    return `{${expr}}`; // fallback if broken
  }
}

function renderNode(node: QCLNode): string {
  const styles: string[] = [];
  const attrs: string[] = [];
  const props = node.props || {};
  const tagType = node.type;

  // === Handle actions and inline styles ===
  for (const [key, val] of Object.entries(props)) {
    if (key === 'bg') styles.push(`background-color:${val}`);
    if (key === 'padding') styles.push(`padding:${val}px`);
    if (key === 'size') styles.push(`font-size:${val}px`);
    if (key === 'weight') styles.push(`font-weight:${val}`);
    if (key === 'action') {
      const safeAction = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      attrs.push(`onclick="window.run('${safeAction}')"`);
    }
  }

  const styleStr = styles.length ? ` style="${styles.join(';')}"` : '';
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  // === Content with state injection ===
  const rawContent = (node.content || '').replace(/`/g, '\\`');
  const content = rawContent.replace(/\{([^}]+)\}/g, (_, expr) => {
  return `\${safeEval(\`${expr.trim()}\`, state)}`;
});

  // === Recursively render children ===
  const children = (node.body || []).map(renderNode).join('\n');

  // === Special cases ===
  if (tagType === 'If') {
    const cond = props.condition || 'false';
    return `\${${cond} ? \`${children}\` : ''}`;
  }

  if (tagType === 'For') {
    const loopItem = props.item || 'item';
    const loopList = props.in || '[]';
    return `\${(${loopList}).map(${loopItem} => \`${children.replace(/\{(\w+)\}/g, (_, v) => {
      return v === loopItem ? `\$\{${loopItem}\}` : `\$\{state["${v}"]\}`;
    })}\`).join('')}`;
  }

  // === Built-in tags ===
  switch (tagType) {
    case 'Box':
      return `<div${styleStr} class="rounded p-4 shadow-sm mb-4">${children}</div>`;
    case 'Text':
      return `<p${styleStr} class="mb-2">${content}${children}</p>`;
    case 'Button':
      return `<button${attrStr} class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">${content}</button>`;
    case 'Input':
      return `<input data-bind="${props.name}" placeholder="${props.placeholder || ''}" class="border p-2 rounded w-full" />`;
      case 'SlotWrapper':
  return children; // children already injected by parser
    case 'Select':
      const options = (props.options || '')
        .split(',')
        .map(opt => `<option value="${opt.trim()}">\${state["${props.name}"] === "${opt.trim()}" ? "✅ " : ""}${opt.trim()}</option>`)
        .join('');
      return `<select data-select="${props.name}" class="border p-2 rounded w-full">${options}</select>`;
    default:
      // === Custom component fallback ===
      return `<div${styleStr}>${content}${children}</div>`;
  }
}

function escapeHTML(str: string): string {
  return str.replace(/[&<>"']/g, tag =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[tag] || tag)
  );
}
