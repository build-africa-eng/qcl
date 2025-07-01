#!/usr/bin/env node
import fs from 'fs';
import { parseQCL } from './src/lib/qcl-parser';
import { renderHTML } from './src/lib/qcl-renderer';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error('Usage: qcl <input.qcl> <output.html>');
  process.exit(1);
}

try {
  const qclCode = fs.readFileSync(inputPath, 'utf-8');
  const ast = parseQCL(qclCode);
  const html = renderHTML(ast);
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Rendered ${inputPath} → ${outputPath}`);
} catch (err) {
  console.error('❌ Error:', (err as Error).message);
  process.exit(1);
}
