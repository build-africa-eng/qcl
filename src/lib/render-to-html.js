export function renderQCLToHTML(ast) {
  const content = renderNode(ast);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${ast.title || 'QCL Page'}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: sans-serif; padding: 2rem; background: #f9f9f9; color: #333; }
      .box { border: 1px solid #ccc; padding: 1rem; background: white; border-radius: 8px; }
      button { padding: 0.5rem 1rem; }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>`;
}

function renderNode(node) {
  if (!node) return '';

  if (node.type === 'Page') {
    return (node.body || []).map(renderNode).join('\n');
  }

  if (node.type === 'Text') {
    return `<p>${node.content || ''}</p>`;
  }

  if (node.type === 'Box') {
    const style = node.props?.bg ? `style="background:${node.props.bg}"` : '';
    return `<div class="box" ${style}>${(node.body || []).map(renderNode).join('\n')}</div>`;
  }

  if (node.type === 'Input') {
    return `<input name="${node.props?.name || ''}" placeholder="${node.props?.placeholder || ''}" />`;
  }

  if (node.type === 'Button') {
    return `<button>${node.content || 'Click'}</button>`;
  }

  if (node.type === 'Select') {
    const opts = (node.props?.options || '').split(',').map(o => `<option>${o.trim()}</option>`).join('');
    return `<select name="${node.props?.name || ''}">${opts}</select>`;
  }

  return '';
}
