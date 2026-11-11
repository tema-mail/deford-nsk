// Картинки сайта: исходники в assets/raw (в сборку не идут) → public/img/*.webp (качество 80, не шире 1600 px).
// Правило владельца 07.11.2026: на сайте только WebP. Запуск: npm run img
import sharp from 'sharp';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, parse, relative } from 'node:path';

const SRC = 'assets/raw', OUT = 'public/img';
const MAX = { 'artem-ava': 900 };
function walk(d) { return readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
let n = 0, kb = 0;
for (const f of walk(SRC).filter(f => /\.(jpe?g|png)$/i.test(f))) {
  const { dir, name } = parse(relative(SRC, f));
  const outDir = join(OUT, dir); mkdirSync(outDir, { recursive: true });
  const out = join(outDir, name + '.webp');
  const info = await sharp(f).resize({ width: MAX[name] || 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  n++; kb += info.size / 1024;
  if (info.size > 400 * 1024) console.warn('тяжело (>400 КБ):', out, Math.round(info.size / 1024), 'КБ');
}
console.log(`webp: ${n} файлов, ${Math.round(kb)} КБ`);
