import { readFile } from 'node:fs/promises';
import { negotiatedResponse } from '../../lib/negotiate.js';

export const runtime = 'nodejs';

const content = Promise.all([
  readFile(`${process.cwd()}/404.html`, 'utf8'),
  readFile(`${process.cwd()}/404.md`, 'utf8'),
]);

export async function GET(request) {
  const [html, markdown] = await content;
  return negotiatedResponse(request, {
    html,
    markdown,
    status: 404,
    htmlLink: '</404.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"',
    markdownLink: '</llms.txt>; rel="describedby"',
  });
}
