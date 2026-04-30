export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) {
return res.status(405).json({ error: { message: ‘Method not allowed’ } });
}

try {
// Manually read raw body from stream — Vercel does not auto-parse
const rawBody = await new Promise((resolve, reject) => {
let data = ‘’;
req.on(‘data’, chunk => { data += chunk.toString(); });
req.on(‘end’, () => resolve(data));
req.on(‘error’, reject);
});

```
let body;
try {
  body = JSON.parse(rawBody);
} catch (e) {
  return res.status(400).json({ error: { message: 'Invalid JSON: ' + e.message } });
}

const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'web-search-2025-03-05',
  },
  body: JSON.stringify({
    model: body.model || 'claude-sonnet-4-6',
    max_tokens: body.max_tokens || 4000,
    system: body.system || '',
    messages: body.messages || [],
    tools: [{ type: 'web_search_20250305', name: 'web_search' }]
  }),
});

const text = await apiRes.text();
let data;
try {
  data = JSON.parse(text);
} catch (e) {
  return res.status(500).json({
    error: { message: 'API non-JSON (' + apiRes.status + '): ' + text.slice(0, 200) }
  });
}

return res.status(apiRes.status).json(data);
```

} catch (err) {
return res.status(500).json({
error: { message: ’Error: ’ + (err.message || String(err)) }
});
}
}