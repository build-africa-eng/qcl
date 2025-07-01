#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { parseQCL } from '../src/lib/qcl-parser.js';
import { renderQCLToHTML } from '../src/lib/render-to-html.js';

const [,, inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: qcl <input.qcl> <output.html>');
  process.exit(1);
}

const qclSource = fs.readFileSync(inputPath, 'utf-8');
const ast = parseQCL(qclSource);
const html = renderQCLToHTML(ast);

fs.writeFileSync(outputPath, html);
console.log(`✅ Generated: ${outputPath}`);
