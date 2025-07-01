#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parseQCL } from '../lib/parser.js';
import { renderHTML } from '../lib/renderer.js';

const inputPath = process.argv[2];
const outputPath = process.argv[3] || 'output.html';

if (!inputPath) {
  console.error('Usage: qcl <input.qcl> [output.html]');
  process.exit(1);
}

const source = fs.readFileSync(inputPath, 'utf-8');
const ast = parseQCL(source);
const html = renderHTML(ast);

fs.writeFileSync(outputPath, html);
console.log(`✅ QCL compiled to ${outputPath}`);
