export function renderHTML(ast) {
  const stateVars = ast.body
    .filter(n => n.type === "State")
    .map(n => `"${n.name}": ${JSON.stringify(n.value)}`)
    .join(",\n");

  const ui = ast.body
    .filter(n => n.type !== "State")
    .map(renderNode)
    .join("\n");

  return `
<h1>${ast.title}</h1>
<div id="qcl-app"></div>

<script type="module">
  let state = {
    ${stateVars}
  };

  function run(code) {
    try {
      with (state) { eval(code); }
      render();
    } catch (err) {
      console.error('❌ Action error:', err);
      alert(err.message);
    }
  }

  function render() {
    const html = \`${ui}\`;
    document.getElementById('qcl-app').innerHTML = html;
  }

  render();
</script>
`;
}

function renderNode(node) {
  const styles = [];
  const attrs = [];

  for (const [key, val] of Object.entries(node.props || {})) {
    if (["bg", "padding", "size", "weight"].includes(key)) {
      if (key === "bg") styles.push(`background:${val}`);
      if (key === "padding") styles.push(`padding:${val}px`);
      if (key === "size") styles.push(`font-size:${val}px`);
      if (key === "weight") styles.push(`font-weight:${val}`);
    } else if (key === "action") {
      attrs.push(`onclick="run('${val}')"`); // supports `count++`
    }
  }

  const styleAttr = styles.length ? ` style="${styles.join(';')}"` : "";
  const attrStr = attrs.join(' ');

  const htmlContent = (node.content || "").replace(/\{(\w+)\}/g, (_, v) => `\${state["${v}"]}`);

  if (node.type === "Box") return `<div${styleAttr}>${htmlContent}</div>`;
  if (node.type === "Text") return `<p${styleAttr}>${htmlContent}</p>`;
  if (node.type === "Button") return `<button ${attrStr}${styleAttr}>${htmlContent}</button>`;

  return `<div${styleAttr}>${htmlContent}</div>`;
}
