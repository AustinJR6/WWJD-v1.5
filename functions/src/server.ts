import express from 'express';
// import cors from 'cors';

const app = express();

// 1) JSON parser BEFORE routes
app.use(express.json({ limit: '1mb' }));

// 2) (Optional) CORS if the client calls from device/web
// app.use(cors({ origin: true, credentials: true }));

// 3) Minimal request diagnostics (temporary)
app.use((req, _res, next) => {
  if (req.path === '/askJesus' && req.method === 'POST') {
    console.log('[askJesus] content-type:', req.get('content-type'));
    console.log('[askJesus] has body?', !!req.body, 'keys:', req.body && Object.keys(req.body));
  }
  next();
});

// 4) Route
app.post('/askJesus', async (req, res) => {
  if (!req.is('application/json')) {
    return res.status(400).json({ error: 'content-type must be application/json' });
  }
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'empty or invalid JSON body' });
  }

  const { text, uid, model } = req.body ?? {};
  if (!text || !uid) {
    return res.status(400).json({ error: 'missing required fields: text, uid' });
  }

  const auth = req.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing Authorization Bearer token' });
  }

  // ... existing logic placeholder
  res.json({ ok: true, text: String(text), uid, model });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`askJesus server listening on port ${port}`);
});

export default app;
