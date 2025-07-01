// --- QCL RENDERER (TypeScript) ---

import type { QCLNode } from './qcl-parser';

/**
 * Escapes HTML special characters to prevent XSS.
 * @param str The string to escape.
 * @returns The escaped string.
 */
function escapeHTML(str: string | undefined): string {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[tag] || tag));
}

/**
 * Renders a single AST node into an HTML string.
 * @param node The AST node to render.
 * @returns The resulting HTML string.
 */
function renderNode(node: QCLNode): string {
    const props = node.props || {};
    const tagType = node.type;

    const attrs: string[] = [];
    const styles: string[] = [];

    for (const [key, val] of Object.entries(props)) {
        switch (key) {
            case 'action':
                attrs.push(`onclick=\"window.run('${val.replace(/'/g, "\\'")}')\"`);
                break;
            case 'placeholder':
                attrs.push(`placeholder=\"${escapeHTML(val)}\"`);
                break;
            case 'bg':
                styles.push(`background-color:${val}`);
                break;
            case 'padding':
                styles.push(`padding:${val}px`);
                break;
        }
    }
    const styleStr = styles.length ? ` style=\"${styles.join(';')}\"` : '';
    const children = (node.body || []).map(renderNode).join('');

    const rawContent = (node.content || '').replace(/`/g, '\\`');
    const content = rawContent.replace(/\{([^}]+)\}/g, (_, expr) => {
        return `\${window.safeEval('${expr.trim()}', {})}`;
    });

    if (tagType === 'If') {
        const cond = props.condition || 'false';
        return `\${window.safeEval('${cond}') ? \`${children}\` : ''}`;
    }

    if (tagType === 'For') {
        const loopItem = props.item || 'item';
        const loopListExpr = props.in || '[]';
        return `\${(window.safeEval('${loopListExpr}') || []).map((${loopItem}: any) => {
            let childHtml = \`${children}\`;
            childHtml = childHtml.replace(/\\{${loopItem}\\.(\\w+)} /g, (_, prop) => {
                return ${loopItem}[prop] || '';
            });
            return childHtml;
        }).join('')}`;
    }

    if (tagType === 'Card') {
        const userExpr = props.user;
        return `\${((user: any) => \`<div class=\"rounded p-4 shadow-sm mb-4 border border-gray-200 bg-gray-50\">
                    <p class=\"font-bold text-lg text-gray-800\">\${user.name}</p>
                    <p class=\"text-sm text-gray-600 bg-blue-100 inline-block px-2 py-1 rounded\">Role: \${user.role}</p>
                  </div>\`)(${userExpr})}`;
    }

    switch (tagType) {
        case 'Box':
            return `<div class=\"p-4 rounded-lg mb-4 ${props.bg ? '' : 'border'}\"${styleStr}>${children}</div>`;
        case 'Text':
            return `<p class=\"mb-2 ${props.weight === 'bold' ? 'font-bold' : ''} ${props.size ? `text-[${props.size}px]` : ''}\"${styleStr}>${content}${children}</p>`;
        case 'Button':
            return `<button ${attrs.join(' ')} class=\"bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mr-2\">${node.content}</button>`;
        case 'Input':
            if (props.bind) {
                attrs.push(`id=\"qcl-element-${escapeHTML(props.bind)}\"`);
                attrs.push(`oninput=\"window.run('state.${props.bind} = event.target.value')\"`);
                attrs.push(`value=\"\${state['${props.bind}'] || ''}\"`);
            }
            return `<input ${attrs.join(' ')} class=\"border p-2 rounded w-full mb-2\" />`;
        case 'Textarea':
            if (props.bind) {
                attrs.push(`id=\"qcl-element-${escapeHTML(props.bind)}\"`);
                attrs.push(`oninput=\"window.run('state.${props.bind} = event.target.value')\"`);
            }
            return `<textarea ${attrs.join(' ')} class=\"border p-2 rounded w-full mb-2\">\${state['${props.bind}'] || ''}</textarea>`;
        case 'Select':
            if (props.bind) {
                const bindName = props.bind;
                attrs.push(`id=\"qcl-element-${escapeHTML(bindName)}\"`);
                attrs.push(`onchange=\"window.run('state.${bindName} = event.target.value')\"`);
                const options = (props.options || '')
                    .split(',')
                    .map(opt => opt.trim())
                    .map(opt => `<option value=\"${escapeHTML(opt)}\" \${state['${bindName}'] === '${opt}' ? 'selected' : ''}>${escapeHTML(opt)}</option>`)
                    .join('');
                return `<select ${attrs.join(' ')} class=\"border p-2 rounded w-full mb-2\">${options}</select>`;
            }
            return '<!-- Select requires a "bind" and "options" property -->';
        case 'Checkbox':
            if (props.bind) {
                const bindName = props.bind;
                const id = `qcl-checkbox-${escapeHTML(bindName)}`;
                const action = `state.${bindName} = !state.${bindName}`;
                const checkboxAttrs = [
                    `id=\"${id}\"`,
                    `type=\"checkbox\"`,
                    `onclick=\"window.run('${action}')\"`,
                    `\${state['${bindName}'] ? 'checked' : ''}`
                ];
                const labelContent = escapeHTML(node.content);
                return `
                    <div class=\"flex items-center mb-2\">
                        <input ${checkboxAttrs.join(' ')} class=\"h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500\">
                        <label for=\"${id}\" class=\"ml-2 block text-sm text-gray-900\">${labelContent}</label>
                    </div>
                `;
            }
            return '<!-- Checkbox requires a "bind" property -->';
        case 'Image':
            if (props.src) {
                const imageAttrs = [
                    `src=\"${escapeHTML(props.src)}\"`,
                    `alt=\"${escapeHTML(props.alt || 'QCL Image')}\"`
                ];
                return `<img ${imageAttrs.join(' ')} class=\"w-full h-auto object-cover rounded-lg shadow-md my-2\">`;
            }
            return '<!-- Image requires a "src" property -->';
        case 'Link':
            if (props.href) {
                const linkAttrs = [`href=\"${escapeHTML(props.href)}\"`];
                if (props.target) {
                    linkAttrs.push(`target=\"${escapeHTML(props.target)}\"`);
                }
                const linkContent = escapeHTML(node.content);
                return `<a ${linkAttrs.join(' ')} class=\"text-blue-600 hover:text-blue-800 hover:underline transition-colors\">${linkContent}</a>`;
            }
            return '<!-- Link requires an "href" property -->';
        case 'Divider':
            return `<hr class=\"border-t border-gray-200 my-4\">`;
        default:
            return `<div${styleStr}>${content}${children}</div>`;
    }
}

/**
 * Renders the complete application from the root AST node.
 * @param ast The root AST node from the parser.
 * @returns The final HTML content to be injected into the page.
 */
export function renderHTML(ast: QCLNode): string {
    const stateVars = (ast.body || [])
        .filter(n => n.type === 'State' && typeof n.name === 'string')
        .map(n => `"${n.name}": ${JSON.stringify(n.value)}`)
        .join(',\n');

    const htmlContent = (ast.body || [])
        .filter(n => n.type !== 'State' && n.type !== 'Component')
        .map(renderNode)
        .join('');

    return `
        <h1 class=\"text-3xl font-bold mb-6 pb-2 border-b\">${escapeHTML(ast.title)}</h1>
        <div id=\"qcl-app\" class=\"space-y-4\"></div>
        <script>
          (() => {
            let state = {
              ${stateVars}
            };

            function safeEval(expr, context) {
              try {
                const stateKeys = Object.keys(state);
                const contextKeys = context ? Object.keys(context) : [];
                const allKeys = [...stateKeys, ...contextKeys];
                const func = new Function(...allKeys, `return (${expr})`);
                const stateValues = stateKeys.map(k => state[k]);
                const contextValues = context ? contextKeys.map(k => context[k]) : [];
                return func(...stateValues, ...contextValues);
              } catch (e) {
                console.warn(`Eval error for expression: "${expr}"`, e.message);
                return `{${expr}}`; 
              }
            }

            function render() {
              const html = `${htmlContent}`;
              const appElement = document.getElementById("qcl-app");
              const activeElement = document.activeElement;
              const activeElementId = activeElement ? activeElement.id : null;
              const selectionStart = activeElement ? activeElement.selectionStart : null;
              appElement.innerHTML = html;
              if (activeElementId && document.getElementById(activeElementId)) {
                  const newActiveElement = document.getElementById(activeElementId);
                  newActiveElement.focus();
                  if (selectionStart !== null) {
                    try { newActiveElement.setSelectionRange(selectionStart, selectionStart); } catch(e){}
                  }
              }
            }

            function run(code) {
              try {
                const stateKeys = Object.keys(state);
                const func = new Function(...stateKeys, `with(state) { ${code} }`);
                func(...stateKeys.map(k => state[k]));
                render();
              } catch (err) {
                console.error('Action failed:', err);
              }
            }

            window.run = run;
            window.safeEval = safeEval;
            window.state = state;
            render();
          })();
        <\/script>
    `;
}
