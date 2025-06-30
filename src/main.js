import { parseQCL } from '../qcl-parser.js';
import { renderHTML } from '../qcl-renderer.js';
import './index.css';

fetch('/pages/index.qcl')
  .then(res => res.text())
  .then(source => {
    const ast = parseQCL(source);
    const html = renderHTML(ast);
    document.getElementById('qcl-container').innerHTML = html;
  })
  .catch(err => {
    console.error("❌ QCL Error:", err);
    document.getElementById('qcl-container').innerHTML = `<pre>${err.message}</pre>`;
  });
