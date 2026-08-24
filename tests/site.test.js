import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { GET as getHomepage } from '../app/route.js';
import { GET as getNotFound } from '../app/[...path]/route.js';
import { metadata } from '../app/layout.js';
import nextConfig from '../next.config.js';

describe('homepage HTTP representations', () => {
  test('serves authored Markdown when an agent requests it', async () => {
    const response = await getHomepage(new Request('https://jongan.com/', {
      headers: { Accept: 'text/markdown' },
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('vary')).toBe('Accept, Accept-Encoding');
    expect(await response.text()).toStartWith('---\n');
  });

  test('serves meaningful raw HTML without JavaScript', async () => {
    const response = await getHomepage(new Request('https://jongan.com/'));
    const html = await response.text();
    const body = html.slice(html.indexOf('<body'), html.lastIndexOf('<script>'));
    const textCharacters = [...body.matchAll(/>([^<]+)</g)]
      .reduce((total, match) => total + match[1].trim().length, 0);

    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(html).toMatch(/<h1[\s>]/i);
    expect(html).toMatch(/<h1>\s*Jonathan Gan\s*<\/h1>/i);
    expect(textCharacters).toBeGreaterThanOrEqual(500);
  });

  test.each([
    ['text/markdown, text/html;q=0.8', 200, 'text/markdown; charset=utf-8'],
    ['text/html', 200, 'text/html; charset=utf-8'],
    ['text/markdown;q=0, text/html', 200, 'text/html; charset=utf-8'],
    ['*/*', 200, 'text/html; charset=utf-8'],
    ['application/pdf', 406, 'text/plain; charset=utf-8'],
  ])('honors Accept %s', async (accept, status, contentType) => {
    const response = await getHomepage(new Request('https://jongan.com/', {
      headers: { Accept: accept },
    }));

    expect(response.status).toBe(status);
    expect(response.headers.get('content-type')).toBe(contentType);
    expect(response.headers.get('vary')).toBe('Accept, Accept-Encoding');
  });
});

describe('not-found HTTP representations', () => {
  test('returns a recoverable Markdown body with a real 404 status', async () => {
    const response = await getNotFound(new Request('https://jongan.com/missing-page', {
      headers: { Accept: 'text/markdown' },
    }));
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('vary')).toBe('Accept, Accept-Encoding');
    expect(body).toContain('[Portfolio](https://jongan.com/)');
    expect(body).toContain('[Agent instructions](https://jongan.com/llms.txt)');
    expect(body).toContain('[Sitemap](https://jongan.com/sitemap.xml)');
  });

  test('keeps the branded HTML 404 recoverable without JavaScript', async () => {
    const response = await getNotFound(new Request('https://jongan.com/missing-page', {
      headers: { Accept: 'text/html' },
    }));
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(body).toContain('<h1 class="error-code">404</h1>');
    expect(body).toContain('href="/site.css"');
    expect(body).toContain('href="/llms.txt"');
    expect(body).toContain('href="/sitemap.xml"');
    expect(body).not.toContain('<script');
  });
});

describe('agent and brand discovery files', () => {
  test('publishes a spec-shaped llms.txt with concrete when-to-use guidance', async () => {
    const llms = await readFile(new URL('../llms.txt', import.meta.url), 'utf8');

    expect(llms).toStartWith('# Jonathan Gan\n\n> ');
    expect(llms).toContain('## When to use');
    expect(llms).toContain('React Native or Expo');
    expect(llms.toLowerCase()).toContain('native camera or hardware');
    expect(llms).toContain('mailto:jongan.engineering@outlook.com');
    expect(llms).not.toMatch(/^###/m);
  });

  test('advertises the Markdown alternate and an exact-name WebSite entity', async () => {
    const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

    expect(html).toContain('rel="alternate" type="text/markdown"');
    expect(html).toContain('rel="describedby"');
    expect(jsonLd['@graph']).toContainEqual(expect.objectContaining({
      '@type': 'WebSite',
      name: 'Jonathan Gan',
      url: 'https://jongan.com/',
    }));
    expect(metadata.openGraph.title).toBe('Jonathan Gan — Mobile Systems Engineer');
    expect(metadata.openGraph.images[0].alt).toBe('Jonathan Gan — Mobile Systems Engineer');
  });
});

describe('portfolio experience contracts', () => {
  test('keeps the Three.js experience local, optional, and motion-safe', async () => {
    const [html, css, javascript, stageScript] = await Promise.all([
      readFile(new URL('../index.html', import.meta.url), 'utf8'),
      readFile(new URL('../site.css', import.meta.url), 'utf8'),
      readFile(new URL('../scripts/site.js', import.meta.url), 'utf8'),
      readFile(new URL('../scripts/stage-site.mjs', import.meta.url), 'utf8'),
    ]);

    expect(html).toContain('<canvas id="observatory-canvas" aria-hidden="true"></canvas>');
    expect(html).toContain('<script type="module" src="/site.js"></script>');
    expect(html).toContain('class="signal-fallback"');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).not.toMatch(/transition:\s*all\b/);
    expect(css).toContain('overscroll-behavior-inline: contain');
    expect(css).not.toContain('.nav-links li:not(:last-child)');
    expect(css).toContain('text-rendering: optimizelegibility');
    expect(javascript).toContain('WebGLRenderer,');
    expect(javascript).toContain("from 'three';");
    expect(javascript).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(javascript).toContain('navigator.connection?.saveData');
    expect(stageScript).toContain('await Bun.build({');
    expect(stageScript).toContain("target: 'browser'");
    expect(stageScript).toContain("'site.css'");
    expect(stageScript).toContain("entrypoints: ['scripts/site.js']");
    expect(stageScript).toContain("'index.html'");
    expect(stageScript).toContain("'404.html'");
  });

  test('preserves accessible project media controls', async () => {
    const javascript = await readFile(new URL('../scripts/site.js', import.meta.url), 'utf8');

    expect(javascript).toContain("button.setAttribute('aria-label', 'Play project animation')");
    expect(javascript).toContain("button.setAttribute('aria-pressed', String(!paused))");
    expect(javascript).toContain("button.type = 'button'");
    expect(javascript).toContain('const manuallyPausedVideos = new WeakSet();');
    expect(javascript).toContain('!manuallyPausedVideos.has(entry.target)');
  });

  test('uses the signal identity across social and browser assets', async () => {
    const [favicon, socialCard] = await Promise.all([
      readFile(new URL('../favicon.svg', import.meta.url), 'utf8'),
      readFile(new URL('../public/og-image.svg', import.meta.url), 'utf8'),
    ]);

    expect(favicon).toContain('aria-label="Jonathan Gan signal mark"');
    expect(favicon).toContain('#a9d5ff');
    expect(favicon).not.toContain('#6366f1');
    expect(socialCard).toContain('JONATHAN');
    expect(socialCard).toContain('MOBILE SYSTEMS ENGINEER');
    expect(socialCard).toContain('SIGNAL / 07');
  });
});

describe('host and legacy route preservation', () => {
  test('publishes GitHub Pages from the same staged artifact as Vercel', async () => {
    const workflow = await readFile(new URL('../.github/workflows/static.yml', import.meta.url), 'utf8');

    expect(workflow).toContain('run: bun install --frozen-lockfile');
    expect(workflow).toContain('run: bun run stage');
    expect(workflow).toContain("path: 'public'");
    expect(workflow).toContain('bun-version: 1.3.14');
  });

  test('keeps the existing blog and video subdomain redirects', async () => {
    const redirects = await nextConfig.redirects();

    expect(redirects).toContainEqual(expect.objectContaining({
      has: [{ type: 'host', value: 'blog.jongan.com' }],
      destination: 'https://medium.com/@jonngan',
      permanent: true,
    }));
    expect(redirects).toContainEqual(expect.objectContaining({
      has: [{ type: 'host', value: 'video.jongan.com' }],
      destination: 'https://www.youtube.com/@jonngan',
      permanent: true,
    }));
  });

  test('keeps published project pages on the GitHub Pages origin', async () => {
    const rewrites = await nextConfig.rewrites();

    expect(rewrites.beforeFiles).toContainEqual({
      source: '/YouTubeResearchAI/:path*',
      destination: 'https://pages.jongan.com/YouTubeResearchAI/:path*',
    });
    expect(rewrites.beforeFiles).toContainEqual({
      source: '/opendating-mobile/:path*',
      destination: 'https://pages.jongan.com/opendating-mobile/:path*',
    });
    expect(rewrites.beforeFiles).toContainEqual({
      source: '/privacy-policy/:path*',
      destination: 'https://pages.jongan.com/privacy-policy/:path*',
    });
  });
});
