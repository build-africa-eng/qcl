(() => {
  async function loadRuntime() {
    const { parseQCL } = await import('/lib/qcl-parser.js');
    const { renderHTML } = await import('/lib/qcl-renderer.js');

    document.querySelectorAll('script[type="text/qcl"]').forEach(script => {
      const code = script.textContent || '';
      try {
        const ast = parseQCL(code);
        const html = renderHTML(ast);
        const container = document.createElement('div');
        container.className = 'qcl-container';
        container.innerHTML = html;
        script.replaceWith(container);
      } catch (err) {
        const error = document.createElement('pre');
        error.style.color = 'red';
        error.textContent = 'QCL Parse Error:\n' + err.message;
        script.replaceWith(error);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRuntime);
  } else {
    loadRuntime();
  }
})();
