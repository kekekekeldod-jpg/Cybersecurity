import { Router } from 'express';
import bcrypt from 'bcrypt';

const r = Router();

// ⚠️ Demo-Datenspeicher (flüchtig bis zum Neustart)
const users = new Map(); // key: username/email, value: { hash }

r.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  if (users.has(username)) return res.status(409).json({ error: 'User exists' });

  const hash = await bcrypt.hash(password, 12);
  users.set(username, { hash });

  console.log('Gespeicherte Daten des Nutzers', users);
  
  return res.json({ ok: true });
});

r.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  const entry = users.get(username);
  if (!entry) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, entry.hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.user = { username };
  return res.json({ ok: true, user: { username } });
});

r.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Login-Status (optional fürs Frontend)
r.get('/me', (req, res) => {
  if (req.session?.user) return res.json({ loggedIn: true, user: req.session.user });
  return res.json({ loggedIn: false });
});

export default r;