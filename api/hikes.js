export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: { message: ‘Method not allowed’ } });

try {
let body = req.body;
if (typeof body === ‘string’) {
try { body = JSON.parse(body); } catch(e) {
return res.status(400).json({ error: { message: ’Invalid JSON: ’ + e.message } });
}
}

```
// Build request — include web search tool with correct beta header
const payload = {
  model: body.model || 'claude-sonnet-4-6',
  max_tokens: body.max_tokens || 4000,
  system: body.system || '',
  messages: body.messages || [],
  tools: [{
    type: 'web_search_20250305',
    name: 'web_search'
  }]
};

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'web-search-2025-03-05',
  },
  body: JSON.stringify(payload),
});

const text = await response.text();
let data;
try {
  data = JSON.parse(text);
} catch(e) {
  return res.status(500).json({ error: { message: 'Non-JSON from API: ' + text.slice(0, 300) } });
}

return res.status(response.status).json(data);
```

} catch (err) {
console.error(‘Proxy error:’, err.message);
return res.status(500).json({ error: { message: ’Proxy error: ’ + (err.message || ‘unknown’) } });
}
}