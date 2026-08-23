function parseAccept(header) {
  return header.split(',').flatMap((raw, position) => {
    const [rawType, ...params] = raw.trim().split(';').map((value) => value.trim());
    const type = rawType.toLowerCase();
    if (!type) return [];

    let q = 1;
    for (const param of params) {
      const [name, value] = param.split('=').map((part) => part.trim());
      if (name.toLowerCase() === 'q') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
      }
    }

    return [{
      type,
      q,
      position,
      specificity: type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2,
    }];
  });
}

function matches(entry, candidate) {
  if (entry.type === '*/*') return true;
  if (entry.type.endsWith('/*')) return candidate.startsWith(entry.type.slice(0, -1));
  return entry.type === candidate;
}

function preferredType(header) {
  const produces = ['text/html', 'text/markdown'];
  if (!header) return produces[0] ?? null;
  const entries = parseAccept(header);
  if (!entries.length) return produces[0] ?? null;

  let best = null;
  for (const candidate of produces) {
    const match = entries
      .filter((entry) => matches(entry, candidate))
      .sort((a, b) => b.specificity - a.specificity || a.position - b.position)[0];
    if (!match || match.q <= 0) continue;
    if (!best || match.q > best.q || (match.q === best.q && match.position < best.position)) {
      best = { type: candidate, q: match.q, position: match.position };
    }
  }
  return best?.type ?? null;
}

export function negotiatedResponse(request, {
  html,
  markdown,
  status = 200,
  htmlLink = '</index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"',
  markdownLink = '<https://jongan.com/>; rel="canonical", </llms.txt>; rel="describedby"',
}) {
  const type = preferredType(request.headers.get('accept'));
  const headers = { Vary: 'Accept, Accept-Encoding' };

  if (!type) {
    return new Response('Not Acceptable\n\nAvailable: text/html, text/markdown\n', {
      status: 406,
      headers: {
        ...headers,
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const wantsMarkdown = type === 'text/markdown';
  return new Response(wantsMarkdown ? markdown : html, {
    status,
    headers: {
      ...headers,
      'Content-Type': `${type}; charset=utf-8`,
      'Link': wantsMarkdown ? markdownLink : htmlLink,
    },
  });
}
