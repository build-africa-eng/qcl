#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parseQCL } from '../src/lib/qcl-parser.js';
import { renderHTML } from '../src/lib/qcl-renderer.js';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error('❌ Usage: qcl <input.qcl> <output.html>');
  process.exit(1);
}

const input = fs.readFileSync(inputPath, 'utf-8');
const ast = parseQCL(input);
const html = renderHTML(ast);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);

console.log(`✅ Rendered HTML written to ${outputPath}`);
