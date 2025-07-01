#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { parseQCL } from '../src/lib/qcl-parser.js';
import { renderHTMLPage } from '../src/lib/qcl-renderer.js';

const inputPath = process.argv[2];
const outputPath = process.argv[3] || 'dist/index.html';

if (!inputPath) {
  console.error('❌ Usage: qcl <input.qcl> [output.html]');
  process.exit(1);
}

const source = fs.readFileSync(inputPath, 'utf-8');
const ast = parseQCL(source);
const html = renderHTMLPage(ast);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`✅ QCL compiled to ${outputPath}`);
