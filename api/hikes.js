module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) {
return res.status(405).json({ error: { message: ‘Method not allowed’ } });
}

try {
var body = req.body;

```
// Parse body if it arrived as a string
if (typeof body === 'string') {
  body = JSON.parse(body);
}

// Safety check
if (!body || typeof body !== 'object') {
  return res.status(400).json({ error: { message: 'Missing request body' } });
}

var payload = {
  model: body.model || 'claude-sonnet-4-6',
  max_tokens: body.max_tokens || 4000,
  system: body.system || '',
  messages: body.messages || [],
  tools: [{ type: 'web_search_20250305', name: 'web_search' }]
};

var response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'web-search-2025-03-05'
  },
  body: JSON.stringify(payload)
});

var text = await response.text();

var data;
try {
  data = JSON.parse(text);
} catch (e) {
  return res.status(500).json({
    error: { message: 'API returned non-JSON (status ' + response.status + '): ' + text.slice(0, 200) }
  });
}

return res.status(response.status).json(data);
```

} catch (err) {
console.error(‘Handler error:’, err);
return res.status(500).json({
error: { message: ’Handler error: ’ + (err.message || String(err)) }
});
}
};