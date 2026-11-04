// Inlines three.js (tree-shaken), a pruned monospace font and src/template.html
// into one standalone index.html (what GitHub Pages serves).
import { build } from 'esbuild';
import fs from 'node:fs';

const out = await build({
  entryPoints: ['vendor-entry.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'THREE',
  target: 'es2019',
  legalComments: 'none',
  write: false,
});
const vendor = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// Keep printable ASCII glyphs only (the poster never needs more).
const raw = JSON.parse(fs.readFileSync('fonts/droid_sans_mono_regular.typeface.json', 'utf8'));
const glyphs = {};
for (let c = 32; c <= 126; c++) {
  const ch = String.fromCharCode(c);
  if (raw.glyphs[ch]) glyphs[ch] = raw.glyphs[ch];
}
const font = { ...raw, glyphs };

let html = fs.readFileSync('src/template.html', 'utf8');
html = html
  .replace('/*__FONT__*/', () => 'window.__FONT_DATA__=' + JSON.stringify(font) + ';')
  .replace('/*__VENDOR__*/', () => vendor)
  .replace('/*__DEBUG__*/', () => process.env.DEBUG
    ? 'window.__rage = { G, gkeys, gameUpdate, startGame, stopGame, step, buildLevel, newState, drawGame, view };'
    : '');


fs.writeFileSync('index.html', html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' KB');
