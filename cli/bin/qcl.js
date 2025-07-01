// File: cli/qcl.js
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parseQCL } from '../src/lib/qcl-parser.js';
import { renderHTML } from '../src/lib/qcl-renderer.js';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: qcl <input.qcl> <output.html>');
  process.exit(1);
}

const [inputPath, outputPath] = args;

try {
  const qclSource = fs.readFileSync(inputPath, 'utf-8');
  const ast = parseQCL(qclSource);
  const html = renderHTML(ast);

  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`✅ Exported to ${outputPath}`);
} catch (e) {
  console.error('❌ Failed to export:', e);
  process.exit(1);
}
