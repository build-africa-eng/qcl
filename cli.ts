#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { parseQCL } from './lib/qcl-parser';
import { renderHTML } from './lib/qcl-renderer';
import { renderHTMLPage } from './lib/render-html-page';
import JSZip from 'jszip';
import { gzip } from 'pako';
import { program } from 'commander';
import open from 'open';

program
  .name('qcl')
  .description('QCL CLI — compile QCL source to HTML, JSON AST, or zip')
  .version('1.0.0');

program
  .argument('<file>', 'Path to the QCL source file')
  .option('-o, --out <dir>', 'Output directory', 'dist')
  .option('--html', 'Export rendered HTML')
  .option('--json', 'Export AST as JSON')
  .option('--zip', 'Export everything as zip')
  .option('--open', 'Open the HTML file in the default browser')
  .action(async (file, options) => {
    const srcPath = path.resolve(file);
    if (!fs.existsSync(srcPath)) {
      console.error(`❌ File not found: ${srcPath}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(srcPath, 'utf8');
    const ast = parseQCL(raw);
    const html = renderHTMLPage(ast);

    const outDir = path.resolve(options.out);
    fs.mkdirSync(outDir, { recursive: true });

    if (options.html) {
      const htmlPath = path.join(outDir, 'index.html');
      fs.writeFileSync(htmlPath, html);
      console.log(`✅ HTML saved to ${htmlPath}`);
      if (options.open) await open(htmlPath);
    }

    if (options.json) {
      const jsonPath = path.join(outDir, 'ast.json');
      fs.writeFileSync(jsonPath, JSON.stringify(ast, null, 2));
      console.log(`✅ AST JSON saved to ${jsonPath}`);
    }

    if (options.zip) {
      const zip = new JSZip();
      zip.file('source.qcl', raw);
      zip.file('index.html', html);
      zip.file('ast.json', JSON.stringify(ast, null, 2));
      zip.file('README.md', '# QCL Export\n\nThis archive contains compiled output from QCL source.');
      const blob = await zip.generateAsync({ type: 'nodebuffer' });
      const zipPath = path.join(outDir, 'qcl-export.zip');
      fs.writeFileSync(zipPath, blob);
      console.log(`📦 Zip archive saved to ${zipPath}`);
    }
  });

program.parse();
