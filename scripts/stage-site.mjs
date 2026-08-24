import { copyFile, cp, mkdir } from 'node:fs/promises';

await mkdir('public', { recursive: true });
await Promise.all([
  'index.md',
  '404.md',
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
  'site.css',
  'og-image.png',
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'Jonathan-Gan-Resume.pdf',
].map((file) => copyFile(file, `public/${file}`)));
const bundle = await Bun.build({
  entrypoints: ['scripts/site.js'],
  outdir: 'public',
  minify: true,
  target: 'browser',
});
if (!bundle.success) throw new AggregateError(bundle.logs, 'Failed to bundle site.js');
await copyFile('public/site.js', 'site.js');
await cp('case-studies', 'public/case-studies', { recursive: true });
