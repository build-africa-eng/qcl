import { parseQCL } from './qcl-parser.js';
import { renderHTML } from './qcl-renderer.js';

const qclSource = await (await fetch('/pages/index.qcl')).text();

try {
  const ast = parseQCL(qclSource);
  const html = renderHTML(ast);
  document.getElementById('qcl-container').innerHTML = html;
} catch (err) {
  console.error("❌ QCL App Error:", err);
  document.getElementById('qcl-container').innerHTML = `<pre class="text-red-600 bg-red-100 p-4 rounded">QCL Error:\n${err.message}</pre>`;
}
