const https = require('https');

module.exports = async function handler(req, res) {
  try {
    const body = req.body || {};

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: body.system || '',
      messages: body.messages || [],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }]
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req2 = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => { data += chunk; });
        r.on('end', () => resolve({ status: r.statusCode, body: data }));
      });

      req2.on('error', reject);
      req2.write(payload);
      req2.end();
    });

    let data;
    try {
      data = JSON.parse(result.body);
    } catch (e) {
      return res.status(500).json({ error: { message: 'Non-JSON: ' + result.body.slice(0, 200) } });
    }

    return res.status(result.status).json(data);

  } catch (e) {
    return res.status(500).json({ error: { message: 'Error: ' + e.message } });
  }
};
