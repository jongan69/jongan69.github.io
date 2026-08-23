import { copyFile, cp, mkdir } from 'node:fs/promises';

await mkdir('public', { recursive: true });
await Promise.all([
  'index.md',
  '404.md',
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
  'Jonathan-Gan-Resume.pdf',
].map((file) => copyFile(file, `public/${file}`)));
await cp('case-studies', 'public/case-studies', { recursive: true });
