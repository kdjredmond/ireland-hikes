module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) {
return res.status(405).json({ error: { message: ‘Method not allowed’ } });
}

// Check API key is present
if (!process.env.ANTHROPIC_API_KEY) {
return res.status(500).json({ error: { message: ‘API key not configured’ } });
}

let body = {};
try {
// Vercel parses JSON body automatically — use it directly
body = req.body || {};
if (typeof body === ‘string’) body = JSON.parse(body);
} catch (e) {
return res.status(400).json({ error: { message: ’Bad request body: ’ + e.message } });
}

let apiRes;
try {
apiRes = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’,
‘anthropic-beta’: ‘web-search-2025-03-05’,
},
body: JSON.stringify({
model: ‘claude-sonnet-4-6’,
max_tokens: 4000,
system: body.system || ‘’,
messages: body.messages || [],
tools: [{ type: ‘web_search_20250305’, name: ‘web_search’ }]
}),
});
} catch (e) {
return res.status(500).json({ error: { message: ’Fetch to Anthropic failed: ’ + e.message } });
}

let text;
try {
text = await apiRes.text();
} catch (e) {
return res.status(500).json({ error: { message: ’Failed to read API response: ’ + e.message } });
}

let data;
try {
data = JSON.parse(text);
} catch (e) {
return res.status(500).json({
error: { message: ‘API returned non-JSON (’ + apiRes.status + ’): ’ + text.slice(0, 300) }
});
}

return res.status(apiRes.status).json(data);
};