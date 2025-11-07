import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import animeRoutes from './routes/anime.js';
import requireAuth from './middlewares/requireAuth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Pfad-Helfer (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
// → Frontend liegt in ../Frontend relativ zum Backend-Ordner:
const FRONTEND_ROOT = path.join(__dirname, '..', 'Frontend');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      // nicht aus JS lesbar
    sameSite: 'lax',
    secure: false,       // in PROD: true (nur über HTTPS)
    maxAge: 1000 * 60 * 60 * 24 // 1 Tag
  }
}));

// 1) Frontend ausliefern (Startseite, CSS, JS, Assets)
app.use('/', express.static(FRONTEND_ROOT));

// 2) API-Routen
app.use('/auth', authRoutes);
app.use('/anime', animeRoutes); // API (JSON)

// 3) Geschützte HTML-Seite nur für eingeloggte Nutzer
//    → FRONTEND/member/anime.html muss existieren
app.get('/member/anime', requireAuth, (_req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, 'anime.html'));
});

// 4) 404 Fallback (optional)
app.use((req, res) => res.status(404).send('Not Found'));

app.listen(PORT, () => {
  console.log(`✅ API läuft auf http://localhost:${PORT}`);
});