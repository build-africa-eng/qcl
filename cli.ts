#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { parseQCL } from './src/lib/qcl-parser';
import { renderHTML } from './src/lib/qcl-renderer';

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.error('Usage: qcl <input.qcl> <output.html>');
  process.exit(1);
}

const qclCode = fs.readFileSync(input, 'utf-8');
const ast = parseQCL(qclCode);
const html = renderHTML(ast);

fs.writeFileSync(output, html, 'utf-8');
console.log(`✅ Rendered ${output}`);
