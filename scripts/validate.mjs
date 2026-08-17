import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const html = readFileSync(join(root, 'index.html'), 'utf8');

let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL:', msg); };

const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (jsonLdBlocks.length === 0) fail('no JSON-LD block found');
for (const m of jsonLdBlocks) {
  try {
    JSON.parse(m[1]);
  } catch (e) {
    fail(`JSON-LD parse error: ${e.message}`);
  }
}

const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
for (const m of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(m[1])) fail(`missing anchor target #${m[1]}`);
}

const localRefs = [...html.matchAll(/(?:src|href)="(?!https?:|mailto:|#|data:)([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => !p.startsWith('tel:'));
for (const p of localRefs) {
  const clean = p.split('#')[0].split('?')[0];
  if (clean && !existsSync(join(root, clean))) fail(`missing local asset ${clean}`);
}

const urls = [...new Set([...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))];
await Promise.all(urls.map(async (u) => {
  try {
    if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return;
    const res = await fetch(u, { method: 'HEAD', redirect: 'follow' });
    if (res.status === 403) {
      console.log('note: 403 (bot-protected), skipping', u);
      return;
    }
    if (!res.ok && res.status !== 405) fail(`link ${u} -> HTTP ${res.status}`);
  } catch (e) {
    fail(`link ${u} unreachable: ${e.message}`);
  }
}));

if (failures) {
  console.error(`${failures} validation failure(s)`);
  process.exit(1);
}
console.log('validate.mjs: JSON-LD OK, anchors OK, assets OK, external links OK');
