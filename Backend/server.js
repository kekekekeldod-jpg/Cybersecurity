// server.js (gef ixt) ----------------------------------------------------
import dotenv from "dotenv";
import helmet from "helmet";
import Database from "better-sqlite3";
import express from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

// Pfad-Helfer (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade zum Frontend
const FRONTEND_ROOT = path.resolve(__dirname, "../Frontend");
const PROTECTED_ROOT = path.resolve(__dirname, "../Frontend/protected");

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || "./data/user.db";
const SESSION_SECRET = process.env.SESSION_SECRET || "please_change_me_super_secret";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

// =============================================================
// DEBUG-MODUS: Passwort-Logging im Klartext (nur Testzwecke!)
// =============================================================
const DEBUG_ON = process.env.PLAIN_PASS_DEBUG === "1";
const DEBUG_FILE = path.join(__dirname, "debug_plain.log");
function dbg(line) {
 
  try {
    fs.appendFileSync(DEBUG_FILE, line + "\n");
  } catch (e) {
    console.error("DBG-WRITE-ERROR:", e.message);
  }
}
console.log("PLAIN_PASS_DEBUG =", DEBUG_ON);

// =============================================================
// Express-App Setup
// =============================================================
const app = express();

app.use(
  helmet({
    hsts: false, // kein HTTPS-Zwang lokal
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'", "https:", "data:"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"],
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 Tag
    },
  })
);

// =============================================================
// SQLite-DB Setup
// =============================================================
const RAW_DB_PATH = DB_PATH.trim();
const DATA_DIR = path.dirname(RAW_DB_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
console.log("📁 DB-Ordner geprüft:", DATA_DIR);

// DB öffnen
const db = new Database(RAW_DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email_attempt TEXT,
    success INTEGER NOT NULL,
    ip TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    path TEXT,
    method TEXT,
    user_agent TEXT,
    status INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Express app
const app = express();

app.use(helmet({
  hsts: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false,
  crossOriginResourcePolicy: { policy: "same-origin" },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "script-src-attr": ["'unsafe-inline'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "font-src": ["'self'", "https:", "data:"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "frame-ancestors": ["'self'"],

      // >>> Schaltet die automatische HTTPS-Hochstufung AUS <<<
      "upgrade-insecure-requests": null
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Wenn Nginx als reverse-proxy davor ist:
app.set('trust proxy', 1);

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    // secure: true // erst aktivieren, wenn HTTPS da ist
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Request-Logger -> in DB (access_logs)
app.use((req, res, next) => {
  const start = Date.now();
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || "").toString();
  const ua = (req.get("User-Agent") || "").slice(0, 1000);

  // After response, insert a row with status
  res.on('finish', () => {
    try {
      db.prepare(
        `INSERT INTO access_logs (ip, path, method, user_agent, status)
         VALUES (?, ?, ?, ?, ?)`
      ).run(ip, req.originalUrl || req.url, req.method, ua, res.statusCode || 0);
    } catch (e) {
      // don't kill the app bei DB-Fehlern
      console.error("DB log error:", e && e.message ? e.message : e);
    }
  });

  next();
});

// Hilfsfunktionen
function noCache(_req, res, next) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}

function logLogin({ userId = null, emailAttempt = null, success = 0, ip = "", ua = "" }) {
  try {
    db.prepare(
      `INSERT INTO login_logs (user_id, email_attempt, success, ip, user_agent)
       VALUES (?, ?, ?, ?, ?)`
    ).run(userId, emailAttempt, success, ip, ua);
  } catch (e) {
    console.error("logLogin DB error:", e && e.message ? e.message : e);
  }
}

function requireAuth(req, res, next) {
  if (req.session?.userId) return next();
  if (req.accepts("html")) return res.redirect("/?auth=required");
  return res.status(401).json({ error: "Keine Berechtigung" });
}

// ===== AUTH API =====
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    dbg(`${new Date().toISOString()} REGISTER email="${email}" pass="${password}"`);

    if (!email || !password)
      return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const info = db.prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)`).run(email, hash);

    res.json({ ok: true, userId: info.lastInsertRowid });
  } catch (e) {
    if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "E-mail existiert bereits" });
    }
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    dbg(`${new Date().toISOString()} LOGIN email="${email}" pass="${password}"`);

    if (!email || !password)
      return res.status(400).json({ error: "E-Mail und Passwort erforderlich" });

    const row = db.prepare(`SELECT id, password_hash FROM users WHERE email = ?`).get(email);
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || "").toString();
    const ua = req.get("User-Agent") || "";

    if (!row) {
      logLogin({ emailAttempt: email, success: 0, ip, ua });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      logLogin({ userId: row.id, emailAttempt: email, success: 0, ip, ua });
      return res.status(401).json({ error: "Ungültige Eingabe" });
    }

    req.session.userId = row.id;
    req.session.email = email;
    logLogin({ userId: row.id, emailAttempt: email, success: 1, ip, ua });
    res.json({ ok: true, email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/auth/whoami", (req, res) => {
  if (req.session?.userId) return res.json({ ok: true, email: req.session.email });
  res.json({ ok: false });
});

// ===== STATIC / ROUTING =====
// Protected static
app.use("/member", requireAuth, noCache,
  express.static(PROTECTED_ROOT, { index: false, etag: false, maxAge: 0 })
);

// Schöne URL für Caney:
app.get("/member/caney", requireAuth, noCache, (_req, res) => {
  res.sendFile(path.join(PROTECTED_ROOT, "caney.html"));
});

// Public static (Frontend)
app.use(express.static(FRONTEND_ROOT, {
  index: "index.html",
  extensions: ["html"]
}));

// Fallback: nur für "seiten"-routen ohne Punkt (d.h. keine Assets)
app.get('*', (req, res, next) => {
  // Wenn Pfad eine Dateiendung enthält, weitergeben an next (damit static-Handler es kann)
  if (req.path.includes('.')) return next();
  res.sendFile(path.join(FRONTEND_ROOT, 'index.html'));
});

// Error handler (Fallback)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  if (!res.headersSent) res.status(500).send("Interner Serverfehler");
  else next();
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
