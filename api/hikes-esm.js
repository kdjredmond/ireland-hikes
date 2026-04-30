module.exports = async function handler(req, res) {
try {
const body = req.body || {};
return res.status(200).json({
ok: true,
method: req.method,
hasBody: Object.keys(body).length > 0,
model: body.model || ‘none’
});
} catch (e) {
return res.status(500).json({ error: e.message });
}
};