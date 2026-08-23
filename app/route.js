import { readFile } from 'node:fs/promises';
import { negotiatedResponse } from '../lib/negotiate.js';

export const runtime = 'nodejs';

const content = Promise.all([
  readFile(`${process.cwd()}/index.html`, 'utf8'),
  readFile(`${process.cwd()}/index.md`, 'utf8'),
]);

export async function GET(request) {
  const [html, markdown] = await content;
  return negotiatedResponse(request, { html, markdown });
}
