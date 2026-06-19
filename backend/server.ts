import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as cookie from 'cookie';
import { db, initDb } from './db';

initDb();

const PORT = 8080;
const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const JWT_SECRET = process.env.JWT_SECRET || 'kelper_super_secret_hackathon_key';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const cleanRoutes: Record<string, string> = {
  '/': path.join(FRONTEND, 'index.html'),
  '/pricing': path.join(FRONTEND, 'pricing.html'),
  '/about': path.join(FRONTEND, 'about.html'),
  '/contact': path.join(FRONTEND, 'contact.html'),
  '/generator': path.join(FRONTEND, 'generator.html'),
  '/dashboard': path.join(FRONTEND, 'dashboard.html'),
  '/login': path.join(FRONTEND, 'login.html'),
  '/signup': path.join(FRONTEND, 'signup.html')
};

function serve404(res: http.ServerResponse): void {
  const notFoundPath = path.join(FRONTEND, '404.html');
  fs.readFile(notFoundPath, (err, content) => {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(err ? '<h1>404 Not Found</h1>' : content);
  });
}

function parseCookies(req: http.IncomingMessage) {
  return cookie.parse(req.headers.cookie || '');
}

function getUserFromReq(req: http.IncomingMessage): any {
  const cookies = parseCookies(req);
  if (!cookies.token) return null;
  try {
    return jwt.verify(cookies.token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  const urlObj = new URL(req.url || '/', `http://localhost:${PORT}`);
  const urlPath = urlObj.pathname;

  
  if (urlPath === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { name, email, password } = JSON.parse(body);
        if (!name || !email || !password) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'All fields are required' })); return;
        }
        if (password.length < 6) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'Password must be at least 6 characters' })); return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid email format' })); return;
        }
        const hash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], function (err) {
          if (err) { res.writeHead(400); res.end(JSON.stringify({ error: 'Email exists' })); return; }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) { res.writeHead(500); res.end(); }
    });
    return;
  }

  if (urlPath === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: any) => {
          if (!user || !(await bcrypt.compare(password, user.password))) {
            res.writeHead(401); res.end(JSON.stringify({ error: 'Invalid credentials' })); return;
          }
          const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie.serialize('token', token, { httpOnly: true, path: '/' })
          });
          res.end(JSON.stringify({ success: true }));
        });
      } catch (e) { res.writeHead(500); res.end(); }
    });
    return;
  }

  if (urlPath === '/api/auth/logout') {
    res.writeHead(302, {
      'Location': '/login',
      'Set-Cookie': cookie.serialize('token', '', { httpOnly: true, path: '/', expires: new Date(0) })
    });
    res.end();
    return;
  }

  if (urlPath === '/api/auth/me' && req.method === 'GET') {
    const user = getUserFromReq(req);
    if (!user) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' })); return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: { id: user.id, name: user.name, email: user.email } }));
    return;
  }

  if (urlPath === '/api/documents' && req.method === 'GET') {
    const user = getUserFromReq(req);
    if (!user) { res.writeHead(401); res.end(); return; }
    db.all('SELECT * FROM documents WHERE creator_id = ? OR second_party_email = ? ORDER BY id DESC', [user.id, user.email], (err, docs) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ documents: docs || [] }));
    });
    return;
  }

  if (urlPath === '/api/documents' && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user) { res.writeHead(401); res.end(); return; }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { title, doc_type, content, second_party_email } = JSON.parse(body);
      if (!title || !doc_type || !content) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title, document type, and content are required' }));
        return;
      }
      if (!second_party_email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Second party email is required to create a document' }));
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(second_party_email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid second party email format' }));
        return;
      }
      db.run('INSERT INTO documents (title, doc_type, content, creator_id, second_party_email) VALUES (?, ?, ?, ?, ?)',
        [title, doc_type, content, user.id, second_party_email], function (err) {
          if (err) {
            res.writeHead(500); res.end(JSON.stringify({ error: 'Database error' })); return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: this.lastID }));
        });
    });
    return;
  }

  const matchInvite = urlPath.match(/^\/api\/documents\/(\d+)\/invite$/);
  if (matchInvite && req.method === 'POST') {
    const user = getUserFromReq(req);
    if (!user) { res.writeHead(401); res.end(); return; }
    const docId = matchInvite[1];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email } = JSON.parse(body);
      db.run('UPDATE documents SET second_party_email = ?, status = ? WHERE id = ? AND creator_id = ?',
        [email, 'pending_signature', docId, user.id], (err) => {
          res.writeHead(200); res.end(JSON.stringify({ success: true }));
        });
    });
    return;
  }

  if (urlPath === '/api/ai' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { prompt } = JSON.parse(body) as { prompt: string };
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) { res.writeHead(500); res.end(JSON.stringify({ error: 'GROQ_API_KEY missing' })); return; }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: 'You are a Kenyan legal AI assistant for Kelper.' },
              { role: 'user', content: prompt }
            ]
          })
        });
        const data = await response.json() as any;
        if (data.error) {
          throw new Error(data.error.message || 'AI API Error');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: data?.choices?.[0]?.message?.content ?? 'No response' }));
      } catch (err: any) {
        res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === '/api/ai-generate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { userDescription, docType } = JSON.parse(body) as { userDescription: string; docType: string };
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) { res.writeHead(500); res.end(JSON.stringify({ error: 'GROQ_API_KEY missing' })); return; }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            temperature: 0.1,
            messages: [
              { role: 'system', content: `Return ONLY a pure JSON object mapping fields for a Kenyan ${docType} legal document based on the description. Do NOT use markdown. Keys must include: companyName, investorName, investmentAmount, valuationCap, founderNames.` },
              { role: 'user', content: userDescription }
            ]
          })
        });
        const data = await response.json() as any;
        if (data.error) {
          throw new Error(data.error.message || 'AI API Error');
        }
        const rawContent = data?.choices?.[0]?.message?.content ?? '{}';
        const cleaned = rawContent.replace(/```json\n?/gi, '').replace(/```/g, '').trim();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ fields: JSON.parse(cleaned) }));
      } catch (err: any) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); }
    });
    return;
  }

  
  const user = getUserFromReq(req);
  if (!user && (urlPath === '/generator' || urlPath === '/dashboard')) {
    res.writeHead(302, { 'Location': '/login' });
    res.end();
    return;
  }

  
  if (user && (urlPath === '/login' || urlPath === '/signup' || urlPath === '/')) {
    res.writeHead(302, { 'Location': '/dashboard' });
    res.end();
    return;
  }

  
  if (cleanRoutes[urlPath]) {
    const filePath = cleanRoutes[urlPath];
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? 'text/html';
    fs.readFile(filePath, (err, content) => {
      if (err) { serve404(res); return; }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
    return;
  }

  
  const candidates: string[] = [
    path.join(ROOT, urlPath),
    path.join(FRONTEND, urlPath),
    path.join(FRONTEND, path.basename(urlPath))
  ];

  const filePath = candidates.find(p => {
    if (!p.startsWith(ROOT)) return false;
    try { return fs.statSync(p).isFile(); } catch { return false; }
  });

  if (!filePath) {
    serve404(res);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) { serve404(res); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`✅  Kelper server running → http://localhost:${PORT}/`);
});
