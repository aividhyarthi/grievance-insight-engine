import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import DB first (creates tables on startup)
import './db.js';

import { auditRouter } from './routes/audit.js';
import { reportRouter } from './routes/report.js';
import { authRouter } from './routes/auth.js';
import { stripeRouter } from './routes/stripe.js';
import { resourceAuditRouter } from './routes/resource-audit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

// Stripe webhook needs raw body for signature verification - must come before json parser
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parser for everything else
app.use(express.json({ limit: '5mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again in a minute.' },
});
app.use('/api/', limiter);

// Stricter rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

// API routes
app.use('/api', authRouter);
app.use('/api', auditRouter);
app.use('/api', reportRouter);
app.use('/api', stripeRouter);
app.use('/api', resourceAuditRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Serve static frontend in production
// Works whether run via `tsx server/index.ts` (dev) or `node dist/server/index.js` (prod)
const possibleClientPaths = [
  path.resolve(__dirname, '../dist/client'),   // from tsx (project root)
  path.resolve(__dirname, '../client'),         // from dist/server/ (compiled)
  path.resolve(process.cwd(), 'dist/client'),   // fallback to cwd
];
const clientPath = possibleClientPaths.find((p) => fs.existsSync(p)) || possibleClientPaths[0];

app.use(express.static(clientPath));
app.get('*', (_req, res) => {
  const indexFile = path.join(clientPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(200).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h1>AEO Audit Tool</h1>
        <p>Backend is running! Frontend not built yet.</p>
        <p>Run <code>npm run build</code> first, or use <code>npm run dev</code> for development.</p>
        <p style="margin-top:20px">API available at <a href="/api/health">/api/health</a></p>
      </body></html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`AEO Audit Server running on http://localhost:${PORT}`);
});

export default app;
